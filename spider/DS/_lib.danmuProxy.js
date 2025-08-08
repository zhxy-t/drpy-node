const { getHtml } = $.require('./_lib.request.js');

// 弹幕代理核心逻辑
async function proxy_rule(params) {
    try {
        // 校验参数并获取目标地址
        if (!params || !params.url) {
            throw new Error('请求参数缺失或缺少input字段');
        }
      //  let { input } = params.url;
        const targetUrl = decodeURIComponent(params.url);
        if (!targetUrl) {
            throw new Error('解析后目标地址为空');
        }
        console.log(`[弹幕流程] 4. 开始代理请求 - 目标URL: ${targetUrl}`);
        
        // 发送请求并强化响应校验
        try {
        let resp = await getHtml({ url: targetUrl });
        console.log(`[弹幕流程] 5. 代理请求完成 - 状态: ${resp.status}, 数据长度: ${resp.data?.length || 0}`);
        
        // 打印原始响应数据（前200字符）
        const dataPreview = resp.data ? JSON.stringify(resp.data).substring(0, 200) : '空数据';
        console.log(`[弹幕流程] 5.1 原始响应预览: ${dataPreview}...`);
        
        let parsedDanmu = await getPublicDanmu(resp.data);
        return [200, 'text/xml', parsedDanmu];
    } catch (error) {
        console.error(`[弹幕流程] 请求/解析失败: ${error.message}`);
        return [200, 'text/xml', '<<i></</i>'];
    }

        
        // 校验resp是否有效且包含status属性
        if (!resp || typeof resp !== 'object' || !('status' in resp)) {
            throw new Error(`getHtml返回无效响应（缺少status）: ${JSON.stringify(resp)}`);
        }
        
        console.log(`[弹幕流程] 5. 代理请求完成 - 状态: ${resp.status}, 原始数据长度: ${resp.data?.length || 0} 字符`);
        // 原始数据预览
        const dataPreview = resp.data ? JSON.stringify(resp.data).substring(0, 200) : '空数据';
        console.log(`[弹幕流程] 5.1 原始响应预览: ${dataPreview}...`);
        
        // 根据URL选择对应解析器
        let parsedDanmu;
        if (targetUrl.includes('mgtv.com')) {
            console.log(`[弹幕流程] 6. 匹配芒果弹幕，使用getMGDanmu解析`);
            parsedDanmu = await getMGDanmu(resp.data);
        } else if (targetUrl.includes('qq.com')) {
            console.log(`[弹幕流程] 6. 匹配腾讯弹幕，使用getQQDanmu解析`);
            parsedDanmu = await getQQDanmu(resp.data);
        } else {
            console.log(`[弹幕流程] 6. 匹配通用弹幕，使用getPublicDanmu解析`);
            parsedDanmu = await getPublicDanmu(resp.data);
        }
        
        console.log(`[弹幕流程] 7. 解析完成 - 生成XML弹幕长度: ${parsedDanmu.length} 字符`);
        return [200, 'text/xml', parsedDanmu];
    } catch (error) {
        console.error(`[弹幕流程] 代理/解析失败: ${error.message}`);
        return [500, 'text/xml', '<?xml version="1.0" encoding="UTF-8"?><<<<i></</</</i>']; // 空XML避免播放器报错
    }
}

// 解析芒果TV弹幕
async function getMGDanmu(data) {
    // 初始化XML（带声明头）
    let danmu = '<?xml version="1.0" encoding="UTF-8"?><<<<i>';
    if (!data || !data.data) {
        console.log(`[芒果弹幕解析] 数据无效 - 无data字段`);
        return danmu + '</</</</i>';
    }
    
    // 提取CDN和版本信息（清洗CDN协议前缀）
    const cdn = (data.data.cdn_list?.split(",")[0] || '').replace(/^https?:\/\//, '');
    const version = data.data.cdn_version;
    console.log(`[芒果弹幕解析] 提取CDN信息 - cdn: ${cdn}, version: ${version}`);
    
    if (!cdn || !version) {
        console.log(`[芒果弹幕解析] 缺少CDN信息 - 无法获取弹幕`);
        return danmu + '</</</</i>';
    }
    
    // 生成分片URL（共121个分片）
    const urls = Array.from({ length: 121 }, (_, i) => `https://${cdn}/${version}/${i}.json`);
    if (urls.length === 0) {
        console.error(`[芒果弹幕解析] 分片URL生成失败`);
        return danmu + '</</</</i>';
    }
    console.log(`[芒果弹幕解析] 生成分片URL - 共${urls.length}个分片`);
    
    try {
        const responses = await Promise.allSettled(urls.map(url => getHtml({ url })));
        let totalDanmu = 0;
        
        responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const list = result.value.data;
                if (list?.data?.items) {
                    console.log(`[芒果弹幕解析] 分片${index+1}解析完成 - ${list.data.items.length}条弹幕`);
                    totalDanmu += list.data.items.length;
                    
                    list.data.items.forEach(item => {
                        // 字段默认值处理
                        const time = (item.time || 0) / 1000; // 确保时间有效
                        const content = (item.content || '').replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#39;'); // 补充单引号转义
                        danmu += `<<<<d p="${time},1,25,${gcolor()}">${content}</</</</d>`;
                    });
                } else {
                    console.log(`[芒果弹幕解析] 分片${index+1}无有效数据`);
                }
            } else {
                console.log(`[芒果弹幕解析] 分片${index+1}请求失败: ${result.reason.message}`);
            }
        });
        
        console.log(`[芒果弹幕解析] 全部完成 - 共解析${totalDanmu}条弹幕`);
    } catch (error) {
        console.error(`[芒果弹幕解析] 批量请求失败: ${error.message}`);
    }
    
    return danmu + '</</</</i>';
}

// 解析腾讯视频弹幕
async function getQQDanmu(data) {
    // 初始化XML（带声明头）
    let danmu = '<?xml version="1.0" encoding="UTF-8"?><<<<i>';
    // 数据有效性校验
    if (!data || !data.comments || !Array.isArray(data.comments)) {
        console.log(`[腾讯弹幕解析] 数据无效 - 无comments字段或非数组`);
        return danmu + '</</</</i>';
    }
    
    console.log(`[腾讯弹幕解析] 开始解析 - 共${data.comments.length}条评论`);
    
    data.comments.forEach((item, index) => {
        // 字段默认值处理
        const timepoint = item.timepoint ?? 0; // 默认为0秒
        let content = item.content ?? ''; // 默认为空
        // 完整特殊字符转义
        content = content.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        // 打印前3条示例
        if (index < 3) {
            console.log(`[腾讯弹幕解析] 示例弹幕${index+1}: ${timepoint}s - ${content.substring(0, 20)}`);
        }
        
        danmu += `<<<<d p="${timepoint},1,25,${gcolor()}">${content}</</</</d>`;
    });
    
    console.log(`[腾讯弹幕解析] 完成解析 - 生成${data.comments.length}条弹幕`);
    return danmu + '</</</</i>';
}

// 解析通用格式弹幕
async function getPublicDanmu(data) {
    // 初始化XML（带声明头）
    let danmu = '<?xml version="1.0" encoding="UTF-8"?><<<<i>';
    // 数据结构校验
    if (!data || !data.danmuku || !Array.isArray(data.danmuku)) {
        console.log(`[通用弹幕解析] 数据无效 - 无danmuku字段或非数组`);
        return danmu + '</</</</i>';
    }
    
    let validCount = 0;
    
    data.danmuku.forEach((item) => {
        // 提取时间点（确保有效）
        let time = 0;
        if (typeof item[0] === 'string') {
            time = parseFloat(item[0]) || 0;
        } else if (typeof item[0] === 'number') {
            time = item[0] || 0;
        }
        if (time < 0) return;
        
        // 提取内容（从后向前查找有效字符串）
        let content = '';
        for (let i = item.length - 1; i >= 0; i--) {
            if (typeof item[i] === 'string' && item[i].trim() !== '') {
                content = item[i].trim();
                break;
            }
        }
        if (!content) return;
        
        // 完整特殊字符转义（含单引号）
        content = content.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        danmu += `<<<<d p="${time},1,25,${gcolor()}">${content}</</</</d>`;
        validCount++;
    });
    
    console.log(`[通用弹幕解析] 完成解析 - 有效弹幕: ${validCount}/${data.danmuku.length}`);
    return danmu + '</</</</i>';
}

// 随机颜色生成（共用函数）
function gcolor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return (r << 16) + (g << 8) + b; // 十进制RGB颜色值
}

// 导出包含proxy_rule的对象，供外部调用
$.exports = {
    danmuProxy: {
        proxy_rule: proxy_rule // 暴露proxy_rule接口
    }
};
