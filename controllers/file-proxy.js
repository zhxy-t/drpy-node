/**
 * 远程文件代理控制器模块
 * 提供远程文件的 HTTP 直链代理访问功能
 * @module file-proxy-controller
 */

import {ENV} from '../utils/env.js';
import https from 'https';
import http from 'http';
import {URL} from 'url';

/**
 * 远程文件代理控制器插件
 * @param {Object} fastify - Fastify实例
 * @param {Object} options - 插件选项
 * @param {Function} done - 完成回调
 */
export default (fastify, options, done) => {
    // 请求缓存
    const requestCache = new Map();
    // 缓存超时时间（5分钟）
    const cacheTimeout = 5 * 60 * 1000;

    /**
     * 验证身份认证
     * @param {Object} request - Fastify请求对象
     * @param {Object} reply - Fastify响应对象
     * @returns {boolean} 验证是否通过
     */
    function verifyAuth(request, reply) {
        const requiredAuth = ENV.get('PROXY_AUTH', 'drpys');
        const providedAuth = request.query.auth;
        
        if (!providedAuth || providedAuth !== requiredAuth) {
            reply.status(401).send({
                error: 'Unauthorized',
                message: 'Missing or invalid auth parameter',
                code: 401
            });
            return false;
        }
        return true;
    }

    /**
     * 解码参数 - 支持 base64 解码
     * @param {string} param - 需要解码的参数
     * @param {boolean} isJson - 是否为 JSON 格式
     * @returns {string|Object} 解码后的参数
     */
    function decodeParam(param, isJson = false) {
        if (!param) return isJson ? {} : '';

        let decoded = param;

        try {
            // 首先尝试 URL 解码
            decoded = decodeURIComponent(param);
        } catch (e) {
            // URL 解码失败，使用原始参数
            decoded = param;
        }

        // 对于 URL 参数，如果不是 http 开头，尝试 base64 解码
        if (!isJson && !decoded.startsWith('http://') && !decoded.startsWith('https://')) {
            try {
                const base64Decoded = Buffer.from(decoded, 'base64').toString('utf8');
                if (base64Decoded.startsWith('http://') || base64Decoded.startsWith('https://')) {
                    decoded = base64Decoded;
                }
            } catch (e) {
                // base64 解码失败，保持原值
            }
        }

        // 对于 headers 参数，如果不是 JSON 格式，尝试 base64 解码
        if (isJson && !decoded.startsWith('{') && !decoded.endsWith('}')) {
            try {
                const base64Decoded = Buffer.from(decoded, 'base64').toString('utf8');
                if (base64Decoded.startsWith('{') && base64Decoded.endsWith('}')) {
                    decoded = base64Decoded;
                }
            } catch (e) {
                // base64 解码失败，保持原值
            }
        }

        // 如果是 JSON 格式，尝试解析
        if (isJson) {
            try {
                return JSON.parse(decoded);
            } catch (e) {
                console.warn('Failed to parse headers as JSON:', decoded);
                return {};
            }
        }

        return decoded;
    }

    /**
     * 获取默认请求头
     * @param {Object} request - Fastify 请求对象
     * @returns {Object} 默认请求头
     */
    function getDefaultHeaders(request) {
        const defaultHeaders = {};

        // 复制一些重要的请求头
        const headersToForward = [
            'user-agent',
            'accept',
            'accept-language',
            'accept-encoding',
            'referer',
            'origin'
        ];

        headersToForward.forEach(header => {
            if (request.headers[header]) {
                defaultHeaders[header] = request.headers[header];
            }
        });

        // 如果没有 user-agent，设置默认值
        if (!defaultHeaders['user-agent']) {
            defaultHeaders['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        }

        return defaultHeaders;
    }

    /**
     * 发起远程请求
     * @param {string} url - 远程文件 URL
     * @param {Object} headers - 请求头
     * @param {string} method - 请求方法
     * @param {string} range - Range 头
     * @returns {Promise} 请求结果
     */
    function makeRemoteRequest(url, headers, method = 'GET', range = null) {
        return new Promise((resolve, reject) => {
            try {
                const urlObj = new URL(url);
                const isHttps = urlObj.protocol === 'https:';
                const httpModule = isHttps ? https : http;

                const requestHeaders = { ...headers };
                if (range) {
                    requestHeaders['range'] = range;
                }

                const options = {
                    hostname: urlObj.hostname,
                    port: urlObj.port || (isHttps ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: method,
                    headers: requestHeaders,
                    timeout: 30000 // 30秒超时
                };

                const req = httpModule.request(options, (res) => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        stream: res
                    });
                });

                req.on('error', (error) => {
                    reject(new Error(`Request failed: ${error.message}`));
                });

                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Request timeout'));
                });

                req.end();
            } catch (error) {
                reject(new Error(`Invalid URL or request setup: ${error.message}`));
            }
        });
    }

    /**
     * 远程文件代理健康检查接口
     * GET /file-proxy/health - 检查远程文件代理服务状态
     */
    fastify.get('/file-proxy/health', async (request, reply) => {
        console.log(`[fileProxyController] Health check request`);

        return reply.send({
            status: 'ok',
            service: 'Remote File Proxy',
            timestamp: new Date().toISOString(),
            cache: {
                requests: requestCache.size
            }
        });
    });

    /**
     * 远程文件代理接口
     * GET/HEAD /file-proxy/proxy - 代理远程文件
     */
    fastify.route({
        method: ['GET', 'HEAD'],
        url: '/file-proxy/proxy',
        handler: async (request, reply) => {
            // 验证身份认证
            if (!verifyAuth(request, reply)) {
                return;
            }

            const { url: urlParam, headers: headersParam } = request.query;

            console.log(`[fileProxyController] ${request.method} request for URL: ${urlParam}`);

            // 验证必需参数
            if (!urlParam) {
                return reply.status(400).send({ error: 'Missing required parameter: url' });
            }

            try {
                // 解码 URL 参数
                const targetUrl = decodeParam(urlParam, false);
                
                // 验证 URL 格式
                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                    return reply.status(400).send({ error: 'Invalid URL: must start with http:// or https://' });
                }

                // 解码 headers 参数
                const customHeaders = decodeParam(headersParam, true);
                
                // 合并默认请求头和自定义请求头
                const defaultHeaders = getDefaultHeaders(request);
                const requestHeaders = { ...defaultHeaders, ...customHeaders };

                // 处理 Range 请求
                const range = request.headers.range;

                try {
                    // 发起远程请求
                    const remoteResponse = await makeRemoteRequest(
                        targetUrl, 
                        requestHeaders, 
                        request.method, 
                        range
                    );

                    // 检查远程响应状态
                    if (remoteResponse.statusCode >= 400) {
                        return reply.status(remoteResponse.statusCode).send({
                            error: `Remote server error: ${remoteResponse.statusCode}`
                        });
                    }

                    // 设置响应状态码
                    reply.status(remoteResponse.statusCode);

                    // 转发重要的响应头
                    const headersToForward = [
                        'content-type',
                        'content-length',
                        'content-range',
                        'accept-ranges',
                        'last-modified',
                        'etag',
                        'cache-control',
                        'expires'
                    ];

                    headersToForward.forEach(header => {
                        if (remoteResponse.headers[header]) {
                            reply.header(header, remoteResponse.headers[header]);
                        }
                    });

                    // 设置 CORS 头
                    reply.header('Access-Control-Allow-Origin', '*');
                    reply.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                    reply.header('Access-Control-Allow-Headers', 'Range, Content-Type');

                    // 对于 HEAD 请求，只返回头部信息
                    if (request.method === 'HEAD') {
                        return reply.send();
                    }

                    // 对于 GET 请求，返回文件流
                    return reply.send(remoteResponse.stream);

                } catch (requestError) {
                    console.error('[fileProxyController] Remote request error:', requestError);
                    return reply.status(502).send({ 
                        error: `Failed to fetch remote file: ${requestError.message}` 
                    });
                }

            } catch (error) {
                console.error('[fileProxyController] Request processing error:', error);
                return reply.status(500).send({ error: error.message });
            }
        }
    });

    /**
     * 远程文件信息获取接口
     * GET /file-proxy/info - 获取远程文件信息（HEAD 请求）
     */
    fastify.get('/file-proxy/info', async (request, reply) => {
        // 验证身份认证
        if (!verifyAuth(request, reply)) {
            return;
        }

        const { url: urlParam, headers: headersParam } = request.query;

        console.log(`[fileProxyController] Info request for URL: ${urlParam}`);

        // 验证必需参数
        if (!urlParam) {
            return reply.status(400).send({ error: 'Missing required parameter: url' });
        }

        try {
            // 解码 URL 参数
            const targetUrl = decodeParam(urlParam, false);
            
            // 验证 URL 格式
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                return reply.status(400).send({ error: 'Invalid URL: must start with http:// or https://' });
            }

            // 解码 headers 参数
            const customHeaders = decodeParam(headersParam, true);
            
            // 合并默认请求头和自定义请求头
            const defaultHeaders = getDefaultHeaders(request);
            const requestHeaders = { ...defaultHeaders, ...customHeaders };

            try {
                // 发起 HEAD 请求获取文件信息
                const remoteResponse = await makeRemoteRequest(targetUrl, requestHeaders, 'HEAD');

                if (remoteResponse.statusCode >= 400) {
                    return reply.status(remoteResponse.statusCode).send({
                        error: `Remote server error: ${remoteResponse.statusCode}`
                    });
                }

                // 提取文件信息
                const fileInfo = {
                    url: targetUrl,
                    statusCode: remoteResponse.statusCode,
                    contentType: remoteResponse.headers['content-type'] || 'application/octet-stream',
                    contentLength: remoteResponse.headers['content-length'] ? parseInt(remoteResponse.headers['content-length']) : null,
                    lastModified: remoteResponse.headers['last-modified'] || null,
                    etag: remoteResponse.headers['etag'] || null,
                    acceptRanges: remoteResponse.headers['accept-ranges'] || null,
                    cacheControl: remoteResponse.headers['cache-control'] || null,
                    expires: remoteResponse.headers['expires'] || null
                };

                return reply.send(fileInfo);

            } catch (requestError) {
                console.error('[fileProxyController] Remote info request error:', requestError);
                return reply.status(502).send({ 
                    error: `Failed to get remote file info: ${requestError.message}` 
                });
            }

        } catch (error) {
            console.error('[fileProxyController] Info request processing error:', error);
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * 缓存管理接口
     * DELETE /file-proxy/cache - 清理缓存
     */
    fastify.delete('/file-proxy/cache', async (request, reply) => {
        // 验证身份认证
        if (!verifyAuth(request, reply)) {
            return;
        }

        console.log(`[fileProxyController] Cache clear request`);

        try {
            // 非VERCEL环境可在设置中心控制此功能是否开启
            if (!process.env.VERCEL) {
                if (!Number(process.env.allow_file_cache_clear)) {
                    return reply.status(403).send({ error: 'Cache clear is not allowed by owner' });
                }
            }

            const cacheCount = requestCache.size;

            // 清理缓存
            requestCache.clear();

            return reply.send({
                success: true,
                message: 'Cache cleared successfully',
                cleared: {
                    requests: cacheCount
                }
            });
        } catch (error) {
            console.error('[fileProxyController] Cache clear error:', error);
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * 远程文件代理状态接口
     * GET /file-proxy/status - 获取代理服务状态
     */
    fastify.get('/file-proxy/status', async (request, reply) => {
        console.log(`[fileProxyController] Status request`);

        try {
            return reply.send({
                service: 'Remote File Proxy Controller',
                version: '1.0.0',
                status: 'running',
                cache: {
                    requests: requestCache.size,
                    timeout: cacheTimeout
                },
                features: [
                    'Remote file proxying',
                    'Base64 parameter decoding',
                    'Range request support',
                    'Custom headers support',
                    'CORS support',
                    'Authentication protection'
                ],
                endpoints: [
                    'GET /file-proxy/health - Health check (no auth required)',
                    'GET /file-proxy/proxy?url=<remote_url>&auth=<auth_code>&headers=<custom_headers> - Proxy remote file',
                    'HEAD /file-proxy/proxy?url=<remote_url>&auth=<auth_code>&headers=<custom_headers> - Get remote file headers',
                    'GET /file-proxy/info?url=<remote_url>&auth=<auth_code>&headers=<custom_headers> - Get remote file information',
                    'DELETE /file-proxy/cache?auth=<auth_code> - Clear cache',
                    'GET /file-proxy/status - Get service status (no auth required)'
                ],
                auth: {
                    required: true,
                    parameter: 'auth',
                    description: 'Authentication code required for protected endpoints'
                }
            });
        } catch (error) {
            console.error('[fileProxyController] Status request error:', error);
            return reply.status(500).send({ error: error.message });
        }
    });

    done();
};