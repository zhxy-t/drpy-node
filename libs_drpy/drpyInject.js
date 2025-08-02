import axios, {toFormData} from 'axios';
import axiosX from './axios.min.js';
import crypto from 'crypto';
import http from "http";
import https from 'https';
import fs from 'node:fs';
import qs from 'qs';
import _ from './underscore-esm.min.js'
import tunnel from "tunnel";
import iconv from 'iconv-lite';
import {jsonpath, jsoup} from './htmlParser.js';
import hlsParser from './hls-parser.js'
import {keysToLowerCase} from '../utils/utils.js'
import {ENV} from '../utils/env.js';

import {batchFetch3} from './hikerBatchFetch.js';

globalThis.batchFetch = batchFetch3;
globalThis.axios = axios;
globalThis.axiosX = axiosX;
globalThis.hlsParser = hlsParser;
globalThis.qs = qs;

const AgentOption = {keepAlive: true, maxSockets: 64, timeout: 30000};
const httpAgent = new http.Agent(AgentOption);
let httpsAgent = new https.Agent({rejectUnauthorized: false, ...AgentOption});

const _axios = axios.create({
    httpAgent,
    httpsAgent,
});

_axios.interceptors.request.use((config) => {
    const curlCommand = generateCurlCommand(config);
    if (ENV.get('show_curl', '0') === '1') {
        console.log(`Generated cURL command:\n${curlCommand}`);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

function generateCurlCommand(config) {
    const {method, url, headers, data} = config;
    let curlCommand = `curl -X ${method.toUpperCase()} '${url}'`;

    if (headers) {
        for (const [key, value] of Object.entries(headers)) {
            curlCommand += ` -H '${key}: ${value}'`;
        }
    }

    if (data) {
        if (typeof data === 'object') {
            curlCommand += ` -d '${JSON.stringify(data)}'`;
        } else {
            curlCommand += ` -d '${data}'`;
        }
    }

    return curlCommand;
}

async function request(url, opt = {}) {
    const {
        data: _data = null,
        body = '',
        postType = null,
        buffer: returnBuffer = 0,
        timeout = 5000,
        redirect = 1,
        encoding: userEncoding = '',
        headers: userHeaders = {},
        method = 'get',
        proxy = false,
        stream = null,
    } = opt;

    let data = body || _data;
    let encoding = userEncoding;

    const headers = keysToLowerCase({
        ...userHeaders,
        ...(postType === 'form' && {'Content-Type': 'application/x-www-form-urlencoded'}),
        ...(postType === 'form-data' && {'Content-Type': 'multipart/form-data'}),
    });

    if (!Object.keys(headers).includes('accept')) {
        headers['accept'] = '*/*';
    }

    if (headers['content-type'] && /charset=(.*)/i.test(headers['content-type'])) {
        encoding = headers['content-type'].match(/charset=(.*)/i)[1];
    }

    if (postType === 'form' && data != null) {
        data = qs.stringify(data, {encode: false});
    } else if (postType === 'form-data') {
        data = toFormData(data);
    }

    const agent = proxy ? tunnel.httpsOverHttp({proxy: {host: '127.0.0.1', port: 7890}}) : httpsAgent;
    const respType = returnBuffer ? 'arraybuffer' : 'arraybuffer';

    if (ENV.get('show_req', '0') === '1') {
        console.log(`req: ${url} headers: ${JSON.stringify(headers)} data: ${JSON.stringify(data)}`);
    }
    try {
        const resp = await _axios({
            url: typeof url === 'object' ? url.url : url,
            method,
            headers,
            data,
            timeout,
            responseType: respType,
            maxRedirects: redirect ? undefined : 0,
            httpsAgent: agent,
        });

        let responseData = resp.data;
        const resHeader = Object.fromEntries(
            Object.entries(resp.headers).map(([key, value]) => [key, Array.isArray(value) ? (value.length === 1 ? value[0] : value) : value])
        );

        if (!returnBuffer) {
            const buffer = Buffer.from(responseData);

            if (encoding && encoding.toLowerCase() !== 'utf-8') {
                responseData = iconv.decode(buffer, encoding);
            } else {
                responseData = buffer.toString('utf-8');
            }
        } else if (returnBuffer === 1) {
            return {code: resp.status, headers: resHeader, content: responseData};
        } else if (returnBuffer === 2) {
            return {code: resp.status, headers: resHeader, content: Buffer.from(responseData).toString('base64')};
        } else if (returnBuffer === 3 && stream) {
            if (stream.onResp) await stream.onResp({code: resp.status, headers: resHeader});
            if (stream.onData) {
                responseData.on('data', async (chunk) => {
                    await stream.onData(chunk);
                });
                responseData.on('end', async () => {
                    if (stream.onDone) await stream.onDone();
                });
            } else if (stream.onDone) {
                await stream.onDone();
            }
            return 'stream...';
        }
        return {code: resp.status, headers: resHeader, content: responseData};
    } catch (error) {
        const {response: resp} = error;
        console.error(`Request error: ${error.message}`);
        let responseData = '';
        try {
            const buffer = Buffer.from(resp.data);
            if (encoding && encoding.toLowerCase() !== 'utf-8') {
                responseData = iconv.decode(buffer, encoding);
            } else {
                responseData = buffer.toString('utf-8');
            }
        } catch (e) {
            console.error(`get error response Text failed: ${e.message}`);
        }
        return {
            code: resp?.status || 500,
            headers: resp?.headers || {},
            content: responseData || '',
        };
    }
}

function base64EncodeBuf(buff, urlsafe = false) {
    return buff.toString(urlsafe ? 'base64url' : 'base64');
}

function base64Encode(text, urlsafe = false) {
    return base64EncodeBuf(Buffer.from(text, 'utf8'), urlsafe);
}

function base64DecodeBuf(text) {
    return Buffer.from(text, 'base64');
}

function base64Decode(text) {
    return base64DecodeBuf(text).toString('utf8');
}

function responseBase64(data) {
    const buffer = Buffer.from(data, 'binary');
    return buffer.toString('base64');
}

function md5(text) {
    return crypto.createHash('md5').update(Buffer.from(text, 'utf8')).digest('hex');
}

function aes(mode, encrypt, input, inBase64, key, iv, outBase64) {
    if (iv.length == 0) iv = null;
    try {
        if (mode.startsWith('AES/CBC')) {
            switch (key.length) {
                case 16:
                    mode = 'aes-128-cbc';
                    break;
                case 32:
                    mode = 'aes-256-cbc';
                    break;
            }
        } else if (mode.startsWith('AES/ECB')) {
            switch (key.length) {
                case 16:
                    mode = 'aes-128-ecb';
                    break;
                case 32:
                    mode = 'aes-256-ecb';
                    break;
            }
        }
        const inBuf = inBase64 ? base64DecodeBuf(input) : Buffer.from(input, 'utf8');
        let keyBuf = Buffer.from(key);
        if (keyBuf.length < 16) keyBuf = Buffer.concat([keyBuf], 16);
        let ivBuf = iv == null ? Buffer.alloc(0) : Buffer.from(iv);
        if (iv != null && ivBuf.length < 16) ivBuf = Buffer.concat([ivBuf], 16);
        const cipher = encrypt ? crypto.createCipheriv(mode, keyBuf, ivBuf) : crypto.createDecipheriv(mode, keyBuf, ivBuf);
        const outBuf = Buffer.concat([cipher.update(inBuf), cipher.final()]);
        return outBase64 ? base64EncodeBuf(outBuf) : outBuf.toString('utf8');
    } catch (error) {
        console.log(error);
    }
    return '';
}

function des(mode, encrypt, input, inBase64, key, iv, outBase64) {
    try {
        if (mode.startsWith('DESede/CBC')) {
            switch (key.length) {
                case 16:
                    mode = 'des-ede-cbc';
                    break;
                case 24:
                    mode = 'des-ede3-cbc';
                    break;
            }
        }
        const inBuf = inBase64 ? base64DecodeBuf(input) : Buffer.from(input, 'utf8');
        let keyBuf = Buffer.from(key);
        if (keyBuf.length < 16) keyBuf = Buffer.concat([keyBuf], 16);
        let ivBuf = iv == null ? Buffer.alloc(0) : Buffer.from(iv);
        if (iv != null && ivBuf.length < 8) ivBuf = Buffer.concat([ivBuf], 8);
        const cipher = encrypt ? crypto.createCipheriv(mode, keyBuf, ivBuf) : crypto.createDecipheriv(mode, keyBuf, ivBuf);
        const outBuf = Buffer.concat([cipher.update(inBuf), cipher.final()]);
        return outBase64 ? base64EncodeBuf(outBuf) : outBuf.toString('utf8');
    } catch (error) {
        console.log(error);
    }
    return '';
}

function rsa(mode, pub, encrypt, input, inBase64, key, outBase64) {
    try {
        let pd = undefined;
        const keyObj = pub ? crypto.createPublicKey(key) : crypto.createPrivateKey(key);
        if (!keyObj.asymmetricKeyDetails || !keyObj.asymmetricKeyDetails.modulusLength) return '';
        const moduleLen = keyObj.asymmetricKeyDetails.modulusLength;
        let blockLen = moduleLen / 8;
        switch (mode) {
            case 'RSA/PKCS1':
                pd = crypto.constants.RSA_PKCS1_PADDING;
                blockLen = encrypt ? blockLen - 11 : blockLen;
                break;
            case 'RSA/None/NoPadding':
                pd = crypto.constants.RSA_NO_PADDING;
                break;
            case 'RSA/None/OAEPPadding':
                pd = crypto.constants.RSA_PKCS1_OAEP_PADDING;
                blockLen = encrypt ? blockLen - 41 : blockLen;
                break;
            default:
                throw Error('not support ' + mode);
        }
        let inBuf = inBase64 ? base64DecodeBuf(input) : Buffer.from(input, 'utf8');
        let bufIdx = 0;
        let outBuf = Buffer.alloc(0);
        while (bufIdx < inBuf.length) {
            const bufEndIdx = Math.min(bufIdx + blockLen, inBuf.length);
            let tmpInBuf = inBuf.subarray(bufIdx, bufEndIdx);
            if (pd == crypto.constants.RSA_NO_PADDING) {
                if (tmpInBuf.length < blockLen) {
                    tmpInBuf = Buffer.concat([Buffer.alloc(128 - tmpInBuf.length), tmpInBuf]);
                }
            }
            let tmpBuf;
            if (pub) {
                tmpBuf = encrypt ? crypto.publicEncrypt({
                    key: keyObj, padding: pd
                }, tmpInBuf) : crypto.publicDecrypt({key: keyObj, padding: pd}, tmpInBuf);
            } else {
                tmpBuf = encrypt ? crypto.privateEncrypt({
                    key: keyObj, padding: pd
                }, tmpInBuf) : crypto.privateDecrypt({key: keyObj, padding: pd}, tmpInBuf);
            }
            bufIdx = bufEndIdx;
            outBuf = Buffer.concat([outBuf, tmpBuf]);
        }
        return outBase64 ? base64EncodeBuf(outBuf) : outBuf.toString('utf8');
    } catch (error) {
        console.log(error);
    }
    return '';
}

var charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';

function randStr(len, withNum) {
    var _str = '';
    let containsNum = withNum === undefined ? true : withNum;
    for (var i = 0; i < len; i++) {
        let idx = _.random(0, containsNum ? charStr.length - 1 : charStr.length - 11);
        _str += charStr[idx];
    }
    return _str;
}

// 移除本地存储相关代码
globalThis.md5X = md5;
globalThis.rsaX = rsa;
globalThis.aesX = aes;
globalThis.desX = des;

globalThis.req = request;
globalThis.responseBase64 = responseBase64;

globalThis.JSProxyStream = function () {
    this.head = async function (code, headers) {
    };
    this.write = async function (buf) {
        return 1;
    };
    this.done = async function () {
    };
    this.error = async function (err) {
    };
};

globalThis.JSFile = function (path) {
    this._path = path;
    this.fd = null;
    this.path = async function () {
        return this._path;
    };
    this.open = async function (mode) {
        const file = this;
        return await new Promise((resolve, reject) => {
            if (mode == 'w' || mode == 'a') {
                const directoryPath = dirname(file._path);
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, {recursive: true});
                }
            }
            fs.open(file._path, mode, null, (e, f) => {
                if (!e) file.fd = f;
                if (file.fd) resolve(true); else resolve(false);
            });
        });
    };

    this.read = async function (length, position) {
        const file = this;
        return await new Promise((resolve, reject) => {
            let arraybuffer = new ArrayBuffer(length);
            let arr = new Int8Array(arraybuffer);
            fs.read(file.fd, arr, 0, length, position, (err, bytesRead, buffer) => {
                if (length > bytesRead) {
                    arraybuffer = buffer.slice(0, bytesRead).buffer;
                }
                resolve(arraybuffer);
            });
        });
    };

    this.write = async function (arraybuffer, position) {
        const file = this;
        return await new Promise((resolve, reject) => {
            fs.write(file.fd, new Int8Array(arraybuffer), 0, arraybuffer.byteLength, position, (err, written, buffer) => {
                if (!err) resolve(true); else resolve(false);
            });
        });
    };

    this.flush = async function () {
        return;
    };

    this.close = async function () {
        const file = this;
        return await new Promise((resolve, reject) => {
            fs.close(file.fd, (err) => {
                resolve();
            });
        });
    };

    this.move = async function (newPath) {
        const file = this;
        return await new Promise((resolve, reject) => {
            fs.rename(file._path, newPath, (err) => {
                if (!err) resolve(true); else resolve(false);
            });
        });
    };

    this.copy = async function (newPath) {
        const file = this;
        return await new Promise((resolve, reject) => {
            fs.copyFile(file._path, newPath, (err) => {
                if (!err) resolve(true); else resolve(false);
            });
        });
    };

    this.delete = async function () {
        const file = this;
        return await new Promise((resolve, reject) => {
            fs.rm(file._path, (err) => {
                resolve();
            });
        });
    };

    this.exist = async function () {
        const file = this;
        return await new Promise((resolve, reject) => {
            fs.exists(file._path, (stat) => {
                resolve(stat);
            });
        });
    };

    this.size = async function () {
        const file = this;
        return await new Promise((resolve, reject) => {
            fs.stat(file._path, (err, stat) => {
                if (err) {
                    resolve(0);
                } else {
                    resolve(stat.size);
                }
            });
        });
    };
};

globalThis.js2Proxy = function (dynamic, siteType, site, url, headers) {
    let hd = Object.keys(headers).length == 0 ? '_' : encodeURIComponent(JSON.stringify(headers));
    return (dynamic ? 'js2p://_WEB_/' : 'http://127.0.0.1:13333/jp/') + randStr(6) + '/' + siteType + '/' + site + '/' + hd + '/' + encodeURIComponent(url);
};

globalThis.jsp = new jsoup();

globalThis.pdfh = (html, parse, base_url = '') => {
    const jsp = new jsoup(base_url);
    return jsp.pdfh(html, parse, base_url);
};

globalThis.pd = (html, parse, base_url = '') => {
    const jsp = new jsoup(base_url);
    return jsp.pd(html, parse);
};

globalThis.pdfa = (html, parse) => {
    const jsp = new jsoup();
    return jsp.pdfa(html, parse);
};

globalThis.pdfl = (html, parse, list_text, list_url, url_key) => {
    const jsp = new jsoup();
    return jsp.pdfl(html, parse, list_text, list_url, url_key);
};

globalThis.pq = (html) => {
    const jsp = new jsoup();
    return jsp.pq(html);
};

globalThis.pjfh = (html, parse, addUrl = false) => {
    const jsp = new jsoup();
    return jsp.pjfh(html, parse, addUrl);
};

globalThis.pj = (html, parse) => {
    const jsp = new jsoup();
    return jsp.pj(html, parse);
};

globalThis.pjfa = (html, parse) => {
    const jsp = new jsoup();
    return jsp.pjfa(html, parse);
};

globalThis.log = console.log;
globalThis.print = console.log;
globalThis.jsonpath = jsonpath;
globalThis.jsoup = jsoup;

function jsonToCookie(json) {
    return qs.stringify(json, {
        delimiter: ';',
        encoder: value => String(value).trim()
    });
}

function cookieToJson(cookieString) {
    return qs.parse(cookieString, {
        delimiter: ';',
        decoder: value => value.trim()
    });
}

globalThis.jsonToCookie = jsonToCookie;
globalThis.cookieToJson = cookieToJson;
globalThis.keysToLowerCase = keysToLowerCase;

export default {};