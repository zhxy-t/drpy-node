/*
@header({
  searchable: 1,
  filterable: 1,
  quickSearch: 1,
  title: 'AppRJ[模版]',
  lang: 'ds'
})
*/

// 自动生成于 7/29/2025, 5:32:09 AM
// 原始文件: AppRJ[模板].js


let { readFileSync } = require('fs');
let App_Path = './pz/App模板配置.json';
let App_Data = JSON.parse(readFileSync(App_Path, 'utf-8'));

globalThis.getSign = function() {
    let t = Math.floor(Date.now() / 1000).toString();
    let sign = CryptoJS.MD5(`7gp0bnd2sr85ydii2j32pcypscoc4w6c7g5spl${t}`).toString();
    return {
        t,
        sign
    };
};

globalThis.createReqOpts = function(body) {
    return {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
};

function shouldRemoveTitle(title, patterns) {
    if (!patterns || patterns.length === 0 || !title) return false;
    let lowerTitle = title.toLowerCase();
    return patterns.some(pattern =>
        lowerTitle.includes(pattern.toLowerCase())
    );
}

function shouldRemoveLine(lineName, patterns) {
    if (!patterns || patterns.length === 0 || !lineName) return false;
    let lowerLine = lineName.toLowerCase();
    return patterns.some(pattern =>
        lowerLine.includes(pattern.toLowerCase())
    );
}

var rule = {
    类型: '影视',
    host: '',
    title: 'AppRJ[模版]',
    desc: 'AppRJ[模版]',
    homeUrl: '/v3/type/top_type',
    url: '/v3/home/type_search',
    detailUrl: '/v3/home/vod_details',
    searchUrl: '/v3/home/search',
    searchable: 1,
    filterable: 1,
    quickSearch: 1,
    headers: {
        'User-Agent': 'MOBILE_UA',
    },
    timeout: 5000,
    play_parse: true,
    search_match: true, //精准搜索
    cate_exclude: '网址|专题',
    title_remove: ['广告', '破解', '群'],
    line_remove: ['线路1', '线路2', '线路3'],
    line_order: ['原画', '蓝光3', '蓝光3'],

    hostJs: async function() {
        try {
            rule.params = ungzip(rule.params);
        } catch (e) {
            console.log(`ungzip解密失败: ${e.message}`);
        }
        let parts = rule.params.split('$');
        let _host = parts[0];
        let json = App_Data.AppRJ || {};
        let paramKey = decodeURIComponent((rule.params || '').split('$')[1]);
        rule.params = json[paramKey];
        let config = rule.params || {};
        rule.username = config.username || '';
        rule.password = config.password || '';
        rule.lazyheader = config.lazyheader || {};
        rule.verify = config.verify === 'true';
        rule.muban = config.muban || 'Appget';
        let host = '';
        let hostUrl = config.host || config.hosturl || config.url || config.site || _host;
        let hostData = await request(hostUrl);
        if (hostData) {
            let firstLine = hostData.split('\n')[0].replace(/[\s\r]+/g, '');
            if (/^https?:\/\//i.test(firstLine)) {
                host = firstLine;
            } else {
                host = hostUrl;
            }
        } else {
            host = hostUrl;
        }
        if (host.endsWith('/')) {
            host = host.slice(0, -1);
        }
        return host;
    },

    class_parse: async function() {
        let { input } = this;
        let { t, sign } = getSign();
        let body = {
            'sign': sign,
            'timestamp': t
        };
        let options = createReqOpts(body);
        let html = await request(input, options);
        let data = JSON.parse(html).data;
        let filterMap = {
            "extend": "类型",
            "area": "地区",
            "lang": "语言",
            "year": "年份",
            "sort": "排序"
        };
        let filters = {};
        let classes = [];
        data.list.forEach(item => {
            let typeExtend = {
                extend: item.extend,
                area: item.area,
                lang: item.lang,
                year: item.year,
            };
            classes.push({
                type_name: item.type_name,
                type_id: item.type_id
            });
            let typeId = String(item.type_id);
            filters[typeId] = [];
            Object.keys(filterMap).forEach(key => {
                if (item[key] && item[key].length > 0) {
                    let values = JSON.parse(JSON.stringify(item[key]))
                        .filter(v => v && v.trim() !== "");
                    if (values.length > 0) {
                        if (!values.includes("全部")) {
                            values.unshift("全部");
                        }
                        let effectiveOptions = values.map(v => ({
                            n: v,
                            v: v === "全部" ? "" : v
                        })).filter(opt => !(opt.n === "全部" && values.length === 1));
                        if (effectiveOptions.length > 0) {
                            filters[typeId].push({
                                key: key,
                                name: filterMap[key],
                                value: effectiveOptions
                            });
                        }
                    }
                }
            });
        });
        return {
            class: classes,
            filters: filters
        };
    },

    一级: async function(tid, pg, filter, extend) {
        let { input, MY_CATE, MY_FL, MY_PAGE } = this;
        let d = [];
        let { t, sign } = getSign();
        let body = {
            'type_id': MY_CATE,
            'limit': '12',
            'page': MY_PAGE,
            'class': MY_FL.extend,
            'area': MY_FL.area,
            'year': MY_FL.year,
            'lang': MY_FL.lang,
            'sign': sign,
            'timestamp': t
        };
        let options = createReqOpts(body);
        let html = await request(input, options);
        let data = JSON.parse(html).data;
        let list = data["list"] || [];
        let removePatterns = rule.title_remove || [];
        list.forEach(item => {
            let title = item.vod_name || '';
            let shouldRemove = shouldRemoveTitle(title, removePatterns);
            if (title && !shouldRemove) {
                d.push({
                    title: title,
                    desc: (item.vod_remarks || '').trim(),
                    pic_url: item.vod_pic_thumb || item.vod_pic || '',
                    url: String(item.vod_id)
                });
            }
        });
        return setResult(d);
    },

    二级: async function(ids) {
    let { input, orId } = this;
    let { t, sign } = getSign();
    let body = {
        'vod_id': orId,
        'sign': sign,
        'timestamp': t
    };
    let options = createReqOpts(body);
    let html = await request(input, options);
    let data = JSON.parse(html).data;
    let list = data;
    
    // 1. 基础视频信息
    let vod_content = list['vod_content'].match(/[\u4e00-\u9fa5，。？！“”]+/g)?.join('') || list['vod_content'] || '暂无剧情介绍';
    let VOD = {
        vod_id: list['vod_id'] || '暂无id',
        vod_name: list['vod_name'] || '暂无名称',
        type_name: list['vod_class'] || '暂无类型',
        vod_pic: list['vod_pic_thumb'] || list['vod_pic'] || '暂无图片',
        vod_remarks: list['vod_remarks'] || '暂无备注',
        vod_year: list['vod_year'] || '暂无年份',
        vod_area: list['vod_area'] || '暂无地区',
        vod_actor: list['vod_actor'] || '暂无演员信息',
        vod_director: list['vod_director'] || '暂无导演',
        vod_content: vod_content
    };

    // 2. 处理播放列表
    let playlist = list['vod_play_list'] || [];
    
    let playmap = {};
    
    // 3. 核心修改：优化线路优先级匹配逻辑
    const getPriority = (lineName) => {
        if (!rule.line_order || !lineName) return 9999;
        const lowerLine = lineName.toLowerCase();
        
        // 完全匹配（如 line_order 中有 "蓝光3"）
        const exactMatchIndex = rule.line_order.findIndex(
            pattern => pattern.toLowerCase() === lowerLine
        );
        if (exactMatchIndex >= 0) return exactMatchIndex;

        // 部分匹配（如 line_order 有 "蓝光"，匹配 "蓝光3"）
        const partialMatchIndex = rule.line_order.findIndex(
            pattern => lowerLine.includes(pattern.toLowerCase())
        );
        if (partialMatchIndex >= 0) return partialMatchIndex;

        return 9999; // 未匹配的线路排在最后
    };

    // 4. 过滤并排序线路
    let validPlaylist = playlist
        .filter(item => {
            let form = item['title'];
            return form && !shouldRemoveLine(form, rule.line_remove);
        })
        .sort((a, b) => {
            const aPriority = getPriority(a['title']);
            const bPriority = getPriority(b['title']);
            return aPriority - bPriority;
        });


    // 6. 组装播放数据
    validPlaylist.forEach(item => {
        let form = item['title'];
        let playurl = item['urls'] || [];
        let purls = item['parse_urls'] || '';

        playmap[form] = playurl
            .filter(urlItem => urlItem.url && urlItem.url.trim() !== "")
            .map((urlItem, j) => {
                let name = urlItem.name || `第${j+1}集`;
                return `${name}$${urlItem.url}*${purls}`;
            });
    });

    // 7. 生成最终播放源
    let sortedForms = Object.keys(playmap).sort((a, b) => {
        return getPriority(a) - getPriority(b);
    });

    VOD.vod_play_from = sortedForms.join('$$$') || '暂无资源';
    VOD.vod_play_url = sortedForms.map(form => playmap[form].join('#')).join('$$$') || '暂无资源$0';
    
    return VOD;
},

    lazy: async function(flag, id, flags) {
        let { input } = this;
        let [purl, parse] = input.split('*');
        let PlayRegex = /m3u8|mp4|mkv/i;
        let isPlayUrl = PlayRegex.test(purl);
        let isHttpUrl = purl.startsWith('http');
        let isHttpParse = parse.startsWith('http');
        let parseApis = parse.split(',').map(api => api.trim());

        try {
            if (isHttpParse) {
                for (let api of parseApis) {
                    try {
                        let parseUrl = api;
                        if (!api.includes('url=')) {
                            parseUrl += api.includes('?') ? '&url=' : '?url=';
                        }
                        log(`尝试解析接口: ${parseUrl + purl}`);
                        let html = await request(parseUrl + purl);
                        let jsonData = JSON.parse(html);
                        if (jsonData.url && /^https?:\/\//i.test(jsonData.url)) {
                            let parsedUrl = jsonData.url;

                            return {
                                parse: 0,
                                url: parsedUrl
                            };
                        }
                    } catch (e) {
                        log(`解析接口失败: ${api}, 错误: ${e.message}`);
                        continue; // 尝试下一个接口
                    }
                }
                log(`所有解析接口均失败，返回原始URL`);
                return {
                    parse: 0,
                    url: purl
                };
            }
            else if (isPlayUrl) {
                log(`直接播放链接: ${purl}`);
                return {
                    parse: 0,
                    url: purl
                };
            }
            else {
                log(`未知解析类型，返回原始URL`);
                return {
                    parse: 0,
                    url: purl
                };
            }
        } catch (e) {
            log(`解析过程发生错误: ${e.message}`);
            return {
                parse: 0,
                url: purl
            };
        }
    },

    搜索: async function(wd, quick, pg) {
        let { input, KEY, MY_PAGE } = this;
        let d = [];
        let { t, sign } = getSign();
        let body = {
            'limit': '12',
            'page': MY_PAGE,
            'keyword': KEY,
            'sign': sign,
            'timestamp': t
        };
        let options = createReqOpts(body);
        let html = await request(input, options);
        let data = JSON.parse(html).data;
        let list = data.list || [];
        if (rule.search_match) {
            list = list.filter(item =>
                item.vod_name && new RegExp(wd, "i").test(item.vod_name)
            );
        }
        let removePatterns = rule.title_remove || [];
        list.forEach(item => {
            let title = item.vod_name || '';
            let shouldRemove = shouldRemoveTitle(title, removePatterns);
            if (title && !shouldRemove) {
                d.push({
                    title: title,
                    desc: (item.vod_remarks || '').trim(),
                    pic_url: item.vod_pic_thumb || item.vod_pic || '',
                    url: String(item.vod_id)
                });
            }
        });
        return setResult(d);
    },
}