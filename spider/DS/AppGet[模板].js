/*
@header({
  searchable: 1,
  filterable: 1,
  quickSearch: 0,
  title: 'Appget[模板]',
  lang: 'ds'
})
*/

// 自动生成于 7/31/2025, 2:58:19 PM
// 原始文件: AppGet[模板].js


let { readFileSync } = require('fs');
let App_Path = './pz/App模板配置.json';
let App_Data = JSON.parse(readFileSync(App_Path, 'utf-8'));

async function detectApiType(host) {
    let testApis = [
        '/api.php/getappapi.index/initV119',
        '/api.php/qijiappapi.index/initV119'
    ];
    for (let api of testApis) {
        let testUrl = host + api;
        try {
            let res = await request(testUrl, {
                timeout: 3000
            });

            if (res.trim().startsWith('<')) continue;
            let jsonRes = JSON.parse(res);
            let decryptedData = rule.decrypt(jsonRes.data);

            let parsedData = JSON.parse(decryptedData);
            if (parsedData.recommend_list || parsedData.type_list) {
                return api.includes('getappapi') ? 'getappapi' : 'qijiappapi';
            }
        } catch (e) {
            console.log(`API检测错误: ${e.message}`);
            continue;
        }
    }
    log(`✅data的结果: ${data}`);
    return null;
}

function shouldRemoveLine(lineName, patterns) {
    if (!patterns || patterns.length === 0) return false;
    let lowerLine = lineName.toLowerCase();
    return patterns.some(pattern =>
        lowerLine.includes(pattern.toLowerCase())
    );
}

function shouldRemoveTitle(title, patterns) {
    if (!patterns || patterns.length === 0) return false;
    let lowerTitle = title.toLowerCase();
    return patterns.some(pattern =>
        lowerTitle.includes(pattern.toLowerCase())
    );
}

var rule = {
    类型: '影视',
    title: 'Appget[模板]',
    author: 'wow',
    homeUrl: '/api.php/Tapi.index/initV119', // 主页初始化接口（可能用于加载首页基础数据）
    url: '/api.php/Tapi.index/typeFilterVodList?fyfilter', // 分类筛选视频列表接口（带筛选参数）
    detailUrl: '/api.php/Tapi.index/vodDetail?vod_id=fyid', // 视频详情接口（通过vod_id获取对应视频详情，fyid为动态参数占位符）
    searchUrl: '/api.php/Tapi.index/searchList', // 搜索列表接口（用于处理搜索请求，返回匹配结果）
    loginUrl: '/api.php/Tapi.index/appLogin', // 应用登录接口（处理用户登录请求）
    parseUrl: "/api.php/Tapi.index/vodParse", // 视频解析接口（用于解析视频播放地址）
    mineUrl: "/api.php/Tapi.index/mineInfo", // 个人中心信息接口（获取用户个人信息）
    AdUrl: "/api.php/Tapi.index/watchRewardAd", // 观看激励广告接口（可能用于记录用户观看广告行为并发放奖励）
    VipUrl: "/api.php/Tapi.index/userBuyVip", // 用户购买VIP接口（处理VIP购买相关逻辑）
    verifyUrl: "/api.php/Tapi.verify/create?key=", // 验证接口（可能用于生成或验证密钥，key为动态参数）
    filter_url: 'area={{fl.area or "全部"}}&year={{fl.year or "全部"}}&type_id=fyclass&page=fypage&sort={{fl.sort or "最新"}}&lang={{fl.lang or "全部"}}&class={{fl.class or "全部"}}',
    searchable: 1,
    quickSearch: 0,
    filterable: 1,
    timeout: 5000,
    play_parse: true,
    headers: {
        'User-Agent': 'MOBILE_UA'
    },
    title_remove: ['广告', '破解', '群'],
    line_remove: ['线路1', '线路2', '(4K)'],
    line_order: ['原画', '4K', '优质', '自营D', 'mr'],
    search_match: true,

    class_parse: async function() {
        let { input } = this;
        let html = await post(input);
        let data = JSON.parse(rule.decrypt(JSON.parse(html).data));
        let type_list = data.type_list;
        let classes = [];
        let filterObj = {};
        let defaultLangs = ["国语", "粤语", "英语", "韩语", "日语"];
        let defaultSorts = ["最新", "最热", "最赞"];
        let currentYear = new Date().getFullYear();
        let defaultYears = Array.from({
            length: 10
        }, (_, i) => (currentYear - i).toString());
        let defaultFilters = [{
                key: "lang",
                name: "语言",
                list: defaultLangs
            },
            {
                key: "year",
                name: "年份",
                list: defaultYears
            },
            {
                key: "sort",
                name: "排序",
                list: defaultSorts
            }
        ];
        let addAllOption = (options) => [{
                n: "全部",
                v: ""
            },
            ...options.map(option => ({
                n: option,
                v: option
            }))
        ];
        for (let item of type_list) {
            classes.push({
                type_name: item.type_name,
                type_id: item.type_id
            });
            if (item.type_name === "全部") {
                filterObj[item.type_id] = defaultFilters.map(filter => ({
                    key: filter.key,
                    name: filter.name,
                    value: addAllOption(filter.list)
                }));
            } else {
                filterObj[item.type_id] = [];
                (item.filter_type_list || []).forEach((it, i) => {
                    let value = (it.list || []).map(it1 => ({
                        n: it1,
                        v: it1
                    }));
                    filterObj[item.type_id][i] = {
                        key: it.name,
                        name: it.name,
                        value: value
                    };
                });
            }
        }
        return {
            class: classes,
            filters: filterObj
        };
    },

    hostJs: async function() {
        try {
            rule.params = ungzip(rule.params);
        } catch (e) {
            console.log(`ungzip解密失败: ${e.message}`);
        }
        let parts = rule.params.split('$');
        let _host = parts[0];
        rule._key = parts[1];
        rule._iv = (parts[2] ? parts[2].split('@')[0] : rule._key) || rule._key;
        let params = rule.params || {};
        let json = App_Data.AppGet || {};
        let paramKey = decodeURIComponent((params || '').split('$')[1]);
        rule.params = json[paramKey];
        let config = rule.params || {};
        rule.key = config.key || config.dataKey || config.datakey || rule._key;
        rule.iv = rule.key || config.iv || config.dataIv || rule._iv;
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

    预处理: async function() {
        rule.apiType = await detectApiType(rule.host);
        if (!rule.apiType) {
            rule.apiType = rule.muban === 'Appget' ? 'getappapi' : 'qijiappapi';
        } else {
            log(`✅rule.apiType的结果: ${rule.apiType}`);
        }
        let apiPaths = [
            'url',
            'searchUrl',
            'detailUrl',
            'homeUrl',
            'parseUrl',
            'mineUrl',
            'AdUrl',
            'VipUrl',
            'loginUrl',
            'verifyUrl'
        ];
        apiPaths.forEach(path => {
            let oldUrl = rule[path];
            rule[path] = oldUrl.replace(/Tapi/g, rule.apiType);
        });
        if (rule.username && rule.password) {
            try {
                let data = await post(`${rule.loginUrl}`, {
                    headers: rule.headers,
                    body: `password=${rule.password}&code=&device_id=&user_name=${rule.username}&invite_code=&key=&is_emulator=0`
                });
                let userInfo = JSON.parse(rule.decrypt(JSON.parse(data).data)).user;
                rule.headers['app-user-token'] = userInfo.auth_token;
            } catch (e) {
                console.log('登录错误:', e.message);
            }
        }
    },

    一级: async function(tid, pg, filter, extend) {
        let { input, MY_CATE, MY_FL, MY_PAGE } = this;
        let d = [];
        let html = await post(input, {
            headers: rule.headers
        });
        let html1 = rule.decrypt(JSON.parse(html).data);
        let list = JSON.parse(html1).recommend_list;
        list.forEach(item => {
            let title = item.vod_name;
            let isBadTitle = rule.title_remove && rule.title_remove.some(word =>
                new RegExp(word, 'i').test(title)
            );
            if (!isBadTitle) {
                d.push({
                    title: title,
                    desc: item.vod_remarks,
                    pic_url: item.vod_pic,
                    url: item.vod_id,
                });
            }
        });
        return setResult(d);
    },

    二级: async function(ids) {
        let { input } = this;
        try {
            if (!rule.会员时长 && rule.params['会员时长']) {
                eval('rule.会员时长 = ' + ungzip(rule.params['会员时长']));
            }
            if (rule.username && rule.password) {
                let mineInfo = await post(rule.mineUrl, {
                    headers: rule.headers
                });
                mineInfo = JSON.parse(rule.decrypt(JSON.parse(mineInfo).data));
                if (!mineInfo.user) {
                    await rule.预处理();
                    mineInfo = await post(rule.mineUrl, {
                        headers: rule.headers
                    });
                    mineInfo = JSON.parse(rule.decrypt(JSON.parse(mineInfo).data));
                }
                if (mineInfo.user?.is_vip) {
                    console.log('会员到期时间:' + new Date(mineInfo.user.user_end_time * 1000).toLocaleString());
                } else if (rule.会员时长) {
                    await rule.会员时长(mineInfo);
                    await rule.预处理();
                }
            }
        } catch (e) {
            console.error('会员/登录流程出错，但继续执行后续操作:', e.message);
        }
        let html = await post(input, {
            headers: rule.headers
        });

        let json = JSON.parse(rule.decrypt(JSON.parse(html).data));
        let vod = json.vod;
        if (!json.vod_play_list || json.vod_play_list.length === 0) {
            throw new Error('无播放列表');
        }
        let isBadLine = line => rule.line_remove && line &&
            rule.line_remove.some(p => line.toLowerCase().includes(p.toLowerCase()));
        let getPriority = (lineName) => {
            if (!rule.line_order || !lineName) return 9999; // 默认低优先级
            let lowerLine = lineName.toLowerCase();
            let exactMatchIndex = rule.line_order.findIndex(
                pattern => pattern.toLowerCase() === lowerLine
            );
            if (exactMatchIndex >= 0) return exactMatchIndex;
            let partialMatchIndex = rule.line_order.findIndex(
                pattern => lowerLine.includes(pattern.toLowerCase())
            );
            if (partialMatchIndex >= 0) return partialMatchIndex;
            return 9999;
        };
        let playlist = json.vod_play_list
            .filter(item => item.player_info?.show && !isBadLine(item.player_info.show))
            .map(item => ({
                ...item,
                _priority: getPriority(item.player_info.show), // 计算优先级
                _show: item.player_info.show // 保留原始名称
            }))
            .sort((a, b) => a._priority - b._priority); // 按优先级升序排序
        let playform = [],
            playurls = [],
            playmap = {};
        playlist.forEach(item => {
            let {
               show,
               parse = "",
               parse_type = "",
               player_parse_type = ""
            } = item.player_info;
            playform.push(show);
            let validUrls = item.urls.filter(urlItem => urlItem.url?.trim());
            if (validUrls.length === 0) return;
            let playItems = validUrls.map(urlItem => {
                let {
                   name = "",
                   url,
                   token = "",
                   from = "",
                   nid = ""
                } = urlItem;
                return `${name}$${url}*${parse}*token=${token}*${player_parse_type}*${parse_type}*from=${from}*nid=${nid}`;
            });
            playurls.push(playItems.join('#'));
            playmap[show] = playItems;
        });
        vod.vod_play_from = playform.join('$$$') || '暂无资源';
        vod.vod_play_url = playurls.join('$$$') || '暂无资源$0';
        return vod;
    },

    搜索: async function(wd, quick, pg) {
        let { input, KEY, MY_PAGE } = this;
        try {
            let body = `keywords=${KEY}&type_id=0&page=${MY_PAGE}`;
            if (rule.verify) {
                let list = await verifySearch(body);
                return list;
            }
            let data = await post(input, {
                headers: rule.headers,
                body: body
            });
            let json = JSON.parse(data);
            if (json.code == 0) {
                console.log(json.msg);
            }
            let list = JSON.parse(rule.decrypt(json.data)).search_list;
            if (rule.search_match) {
                list = list.filter(item =>
                    item.vod_name &&
                    new RegExp(wd, "i").test(item.vod_name)
                );
            }
            list = list.filter(item =>
                item.vod_name &&
                !shouldRemoveTitle(item.vod_name, rule.title_remove)
            );
            return list;
        } catch (e) {
            let search = `${rule.host}/index.php/ajax/suggest?mid=1&wd=${KEY}&limit=20`;
            let submitHtml = await request(search);
            let d = [];
            let responseData = JSON.parse(submitHtml);
            let list = responseData.list;
            if (rule.search_match) {
                list = list.filter(item =>
                    item.name &&
                    new RegExp(wd, "i").test(item.name)
                );
            }
            list.forEach(it => {
                d.push({
                    title: it.name,
                    url: it.id,
                    pic_url: it.pic,
                });
            });
            return setResult(d);
        }
    },

    lazy: async function(flag, id, flags) {
        let { input, hostname } = this;
        let [purl, parse, tokenPart] = input.split('*');
        let token = tokenPart.replace('token=', '');
        let PlayRegex = /\.m3u8|\.mp4|\.mkv/i;
        let headers = (rule.lazyheader === "" || !rule.lazyheader) ? rule.headers : rule.lazyheader;
        let isPlayUrl = PlayRegex.test(purl);
        let isHttpParse = parse.startsWith('http');
        if (isHttpParse && !parse.includes('url=')) {
            parse += parse.includes('?') ? '&url=' : '?url=';
        }
        log(`播放链接: ${purl}`);
        let linkCheck = await checkVideoLink(purl);
        try {
            if (isPlayUrl) {
                log(`开始直接播放: ${purl}`);
                return {
                    url: purl,
                    parse: 0,
                    header: headers
                };
            } else if (isHttpParse) {
                log(`开始解析播放: ${purl}`);
                let html = await request(parse + purl);
                let parsedUrl = JSON.parse(html).url;
                let jxUrl = await checkVideoLink(parsedUrl);
                log(`内置解析的链接: ${parse}`);
                log(`内置解析的结果: ${jxUrl.valid}`);
                return !jxUrl.valid ? {
                    jx: 1,
                    parse: 1,
                    url: purl,
                    header: headers
                } : {
                    parse: 0,
                    url: parsedUrl,
                    header: headers
                };
            } else {
                log(`开始解密播放: ${purl}`);
                let encryptedUrl = rule.encrypt(purl);
                let formDatas = [
                    `parse_api=${parse}&url=${encodeURIComponent(encryptedUrl)}&token=${token}`,
                    `parse_api=${parse}&url=${encryptedUrl}&token=${token}`
                ];
                let apiUrl = rule.host + rule.parseUrl;
                for (let i = 0; i < formDatas.length; i++) {
                    try {
                        let html = await request(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: formDatas[i]
                        });
                        let data = JSON.parse(html).data;
                        if (data && !(Array.isArray(data) && data.length === 0)) {
                            let jdata = rule.decrypt(data);
                            let outerData = JSON.parse(jdata);
                            let innerData = JSON.parse(outerData.json);
                            let finalUrl = innerData.url;
                            let jxUrl = await checkVideoLink(finalUrl);
                            return !jxUrl.valid ? {
                                parse: 1,
                                jx: 1,
                                url: purl
                            } : {
                                parse: 0,
                                url: finalUrl
                            };
                        }
                    } catch (e) {
                        console.log(`加密解析错误: ${e.message}`);
                    }
                }
            }
        } catch (e) {
            return {
                parse: 0,
                url: purl,
                header: headers
            };
        }
    },

    encrypt: function(word) {
        let key = CryptoJS.enc.Utf8.parse(rule.key);
        let iv = CryptoJS.enc.Utf8.parse(rule.iv);
        let srcs = CryptoJS.enc.Utf8.parse(word);
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.ciphertext.toString(CryptoJS.enc.Utf8);
    },

    decrypt: function(word) {
        let key = CryptoJS.enc.Utf8.parse(rule.key);
        let iv = CryptoJS.enc.Utf8.parse(rule.iv);
        let decrypted = CryptoJS.AES.decrypt(word, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
};

async function checkVideoLink(url) {
    try {
        let response = await axios.get(url, {
            timeout: 5000,
            headers: {
                'Range': 'bytes=0-1'
            },

            validateStatus: function(status) {
                return status === 200 || status === 206;
            }
        });
        return {
            valid: true,
            status: response.status,
            serverSupportsPartial: response.status === 206,
            contentLength: response.headers['content-length']
        };
    } catch (error) {
        if (error.response) {
            return {
                valid: false,
                status: error.response.status,
                error: `Server responded with ${error.response.status}`,
                serverError: true
            };
        } else if (error.request) {
            return {
                valid: false,
                error: 'No response from server',
                connectionError: true
            };
        } else {
            return {
                valid: false,
                error: error.message
            };
        }
    }
}

function isofficial(url) {
    let flag = new RegExp('qq\.com|iqiyi\.com|youku\.com|mgtv\.com|bilibili\.com|sohu\.com|ixigua\.com|pptv\.com|miguvideo\.com|le\.com|1905\.com|fun\.tv');
    return flag.test(url) && !/url=/.test(url);
}

function generateUUID() {
    let randomBytes = CryptoJS.lib.WordArray.random(16);
    let hexString = randomBytes.toString(CryptoJS.enc.Hex);
    return (
        hexString.substr(0, 8) + "-" +
        hexString.substr(8, 4) + "-" +
        "4" + hexString.substr(12, 3) + "-" +
        (parseInt(hexString.substr(16, 1), 16) & 0x3 | 0x8).toString(16) +
        hexString.substr(17, 3) + "-" +
        hexString.substr(20, 12)
    );
}

function generateDeviceId() {
    let randomBytes = CryptoJS.lib.WordArray.random(17);
    let hexString = randomBytes.toString(CryptoJS.enc.Hex);
    return hexString.substring(0, 33);
}

async function verifySearch(body, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            let key = generateUUID();
            let baseImg = await request(`${rule.host}/${rule.verifyUrl}${key}`, {
                buffer: 2
            });
            let resp = await post(OCR_API, {
                headers: {
                    "Content-Type": "text/plain;charset=UTF-8",
                },
                body: baseImg
            });
            let data = await post(`${rule.searchUrl}`, {
                headers: rule.headers,
                body: `${body}&code=${resp}&key=${key}`
            });
            let json = JSON.parse(data);
            if (json.code !== 1) {
                console.log(`验证失败（${attempt}${maxAttempts}）: ${json.msg}`);
                continue;
            }
            console.log(`验证成功（${attempt}${maxAttempts}）: ${json.msg}`);
            return JSON.parse(rule.decrypt(json.data)).search_list;
        } catch (error) {
            console.log(`请求异常（${attempt}${maxAttempts}）: ${error.message}`);
        }
    }
    console.log('验证失败');
    return [];
}