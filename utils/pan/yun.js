import axios from "axios";
import CryptoJS from "crypto-js";
import {ENV} from "../env.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前模块的目录路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 读取 tokenm.json 文件
const configPath = path.join(__dirname, '../../pz/tokenm.json');

class YunDrive {
    constructor() {
        // 正则表达式匹配天翼云盘分享链接
        this.regex = /https:\/\/yun.139.com\/shareweb\/#\/w\/i\/([^&]+)/;
        // AES加密密钥
        this.x = CryptoJS.enc.Utf8.parse("PVGDwmcvfs1uV3d1");
        // API基础URL
        this.baseUrl = 'https://share-kd-njs.yun.139.com/yun-share/richlifeApp/devapp/IOutLink/';
        // 请求头配置
        this.baseHeader = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'hcy-cool-flag': '1',
            'x-deviceinfo': '||3|12.27.0|chrome|131.0.0.0|5c7c68368f048245e1ce47f1c0f8f2d0||windows 10|1536X695|zh-CN|||'
        };
        // 分享链接ID
        this.linkID = '';
        // 验证码
        this.vCode = '';
        // 缓存对象
        this.cache = {};
        // 授权信息
        this.authorization = '';
        // 配置文件
        this.config = null;
        
        this.initConfig();
    }

    // 初始化授权信息
    async init() {
        if (this.cookie) {
            const cookie = this.cookie.split(';');
            if (this.authorization === '') {
                cookie.forEach((item) => {
                    if (item.indexOf('authorization') !== -1) {
                        this.authorization = item.replace('authorization=', '');
                    }
                })
            }
        }
    }

    // 初始化配置文件
    initConfig() {
        try {
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                this.config = JSON.parse(configData);
            }
        } catch (error) {
            // 忽略配置文件读取错误
        }
    }

    // 获取账号
    get account() {
        return this.config?.cloud_account || '';
    }

    // 获取密码
    get password() {
        return this.config?.cloud_password || '';
    }

    // 获取cookie
    get cookie() {
        return this.config?.cloud_cookie || '';
    }

    // AES加密方法
    encrypt(data) {
        let t = CryptoJS.lib.WordArray.random(16), n = "";
        if ("string" == typeof data) {
            const o = CryptoJS.enc.Utf8.parse(data);
            n = CryptoJS.AES.encrypt(o, this.x, {iv: t, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
        } else if (typeof data === 'object' && data !== null) {
            const a = JSON.stringify(data), s = CryptoJS.enc.Utf8.parse(a);
            n = CryptoJS.AES.encrypt(s, this.x, {iv: t, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
        }
        return CryptoJS.enc.Base64.stringify(t.concat(n.ciphertext));
    }

    // AES解密方法
    decrypt(data) {
        const t = CryptoJS.enc.Base64.parse(data), n = t.clone(), i = n.words.splice(4);
        n.init(n.words), t.init(i);
        const o = CryptoJS.enc.Base64.stringify(t),
            a = CryptoJS.AES.decrypt(o, this.x, {iv: n, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}),
            s = a.toString(CryptoJS.enc.Utf8);
        return s.toString();
    }

    // 从URL中提取分享ID和验证码
    async getShareID(url) {
        const cleanUrl = url.trim();
        
        // 提取linkID
        const matches = cleanUrl.match(/([^\/?&]+)(?=\?|#|$)/); 
        if (matches) {
            this.linkID = matches[1];
        }
        
        // 从URL中提取验证码
        this.vCode = this.extractVCode(cleanUrl);
        
        return {
            linkID: this.linkID,
            vCode: this.vCode
        };
    }

    // 从URL中提取验证码
    extractVCode(url) {
        if (!url) return null;
        
        const patterns = [
            /&nbsp;?([a-zA-Z0-9]{4,8})(?:&|$)/i,
            /&nbsp;?pwd=([a-zA-Z0-9]{4,8})/i,
            /[?&](?:pwd|password|pass|code)=([a-zA-Z0-9]{4,8})/i,
            /[?&](?:提取码|密码|验证码)=([a-zA-Z0-9]{4,8})/i,
            /#(?:pwd|password|code)=([a-zA-Z0-9]{4,8})/i,
            /[?&#]([a-zA-Z0-9]{4,8})$/i,
            /&nbsp;?([a-zA-Z0-9]{4})(?:\s|$)/i
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match?.[1]) return match[1];
        }
        
        return null;
    }

    // 获取分享信息
    async getShareInfo(pCaID, vCode = '') {
        if (!this.linkID) {
            return null;
        }
        
        const finalVCode = vCode || this.vCode;
        const cacheKey = `${this.linkID}-${pCaID}-${finalVCode}`;
        
        // 检查缓存
        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }
        
        let requestData = {
            "getOutLinkInfoReq": {
                "account": "",
                "linkID": this.linkID,
                "passwd": finalVCode || "",
                "caSrt": 1,
                "coSrt": 1,
                "srtDr": 0,
                "bNum": 1,
                "pCaID": pCaID,
                "eNum": 200
            },
            "commonAccountInfo": {"account": "", "accountType": 1}
        };
        
        let data = JSON.stringify(this.encrypt(JSON.stringify(requestData)));
        try {
            const resp = await axios.post(this.baseUrl + 'getOutLinkInfoV6', data, {headers: this.baseHeader});
            if (resp.status !== 200) {
                return null;
            }
            const decryptedData = JSON.parse(this.decrypt(resp.data));
            
            // 兼容数字0和字符串"0"
            const successCode = decryptedData.code == 0;
            
            if (successCode && decryptedData.data) {
                // 成功，返回数据并缓存
                const json = decryptedData.data;
                this.cache[cacheKey] = json;
                return json;
            } else {
                return null;
            }
            
        } catch (error) {
            return null;
        }
    }

    // 获取分享数据
    async getShareData(url) {
        if (!url) {
            return {};
        }
        
        const isValidUrl = url.startsWith('http');
        let pCaID = isValidUrl ? 'root' : url;
        
        if (isValidUrl) {
            await this.getShareID(url);
        }
        
        let file = {};
        
        // 首先尝试带验证码的请求
        let fileInfo = await this.getShareFile(pCaID, this.vCode);
        
        // 如果带验证码请求失败，尝试不带验证码
        if ((!fileInfo || fileInfo.length === 0) && this.vCode) {
            fileInfo = await this.getShareFile(pCaID, '');
        }
        
        // 处理文件信息
        if (fileInfo && Array.isArray(fileInfo) && fileInfo.length > 0) {
            fileInfo.forEach(item => {
                if (item.isFile) {
                    // 文件直接添加到结果中
                    if (!file[item.name]) {
                        file[item.name] = [];
                    }
                    file[item.name].push({
                        name: item.name,
                        contentId: item.contentId,
                        linkID: item.linkID,
                        size: item.size,
                        duration: item.duration,
                        thumbnail: item.thumbnail,
                        playUrl: item.playUrl
                    });
                }
            });
        }
        
        // 清理空项
        for (let key in file) {
            if (file[key].length === 0) {
                delete file[key];
            }
        }
        
        return file;
    }

    // 获取分享文件列表（支持文件夹递归）
    async getShareFile(pCaID, vCode = '') {
        if (!pCaID) {
            return null;
        }
        try {
            const isValidUrl = pCaID.startsWith('http');
            pCaID = isValidUrl ? 'root' : pCaID;
            
            const json = await this.getShareInfo(pCaID, vCode);
            if (!json) {
                return [];
            }
            
            const result = [];
            
            // 处理文件夹（递归）
            if (json.caLst && json.caLst.length > 0) {
                const caLst = json.caLst;
                const names = caLst.map(it => it.caName);
                const rootPaths = caLst.map(it => it.path);
                const filterRegex = /App|活动中心|免费|1T空间|免流/;
                
                names.forEach((name, index) => {
                    if (!filterRegex.test(name)) {
                        result.push({name: name, path: rootPaths[index], isFolder: true});
                    }
                });
                
                // 递归获取子文件夹内容
                let subResults = await Promise.all(rootPaths.map(async (path) => this.getShareFile(path, vCode)));
                subResults = subResults.filter(item => item !== undefined && item !== null && item.length > 0);
                result.push(...subResults.flat());
            }
            
            // 处理文件
            if (json.coLst && json.coLst.length > 0) {
                const filteredItems = json.coLst.filter(it => it && it.coType === 3);
                filteredItems.forEach(it => {
                    result.push({
                        name: it.coName,
                        path: it.path,
                        isFile: true,
                        contentId: it.path,
                        linkID: this.linkID,
                        size: it.coSize,
                        duration: it.extInfo?.duration,
                        thumbnail: it.thumbnailURL,
                        playUrl: it.presentURL
                    });
                });
            }
            
            return result;
            
        } catch (error) {
            return [];
        }
    }

    // 获取分享文件URL
    async getShareUrl(pCaID, vCode = '') {
        try {
            const json = await this.getShareInfo(pCaID, vCode);
            if (!json) {
                return null;
            }
            
            const coLst = json.coLst;
            if (coLst !== null && coLst.length > 0) {
                const filteredItems = coLst.filter(it => it && it.coType === 3);
                return filteredItems.map(it => ({
                    name: it.coName,
                    contentId: it.path,
                    linkID: this.linkID,
                    size: it.coSize,
                    duration: it.extInfo?.duration,
                    thumbnail: it.thumbnailURL,
                    playUrl: it.presentURL
                }));
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    // 获取播放地址（不需要验证码）
    async getSharePlay(contentId, linkID) {
        let data = {
            "getContentInfoFromOutLinkReq": {
                "contentId": contentId.split('/')[1],
                "linkID": linkID,
                "account": ""
            },
            "commonAccountInfo": {
                "account": "",
                "accountType": 1
            }
        };
        let resp = await axios.post(this.baseUrl + 'getContentInfoFromOutLink', data, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Content-Type': 'application/json'
            }
        })
        if (resp.status === 200 && resp.data.data !== null) {
            let data = resp.data
            return data.data.contentInfo.presentURL
        }
    }

    // 获取下载地址
    async getDownload(contentId, linkID) {
        await this.init()
        let data = this.encrypt(JSON.stringify({
            "dlFromOutLinkReqV3": {
                "linkID": linkID,
                "account": this.account,
                "coIDLst": {
                    "item": [contentId]
                }
            },
            "commonAccountInfo": {
                "account": this.account,
                "accountType": 1
            }
        }));
        let resp = await axios.post(this.baseUrl + 'dlFromOutLinkV3', data, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
                "Connection": "keep-alive",
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Content-Type": "application/json",
                "accept-language": "zh,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6",
                "authorization": this.authorization,
                "content-type": "application/json;charset=UTF-8",
                'hcy-cool-flag': '1',
                'x-deviceinfo': '||3|12.27.0|chrome|136.0.0.0|189f4426ca008b9cbe9bf9bd79723d77||windows 10|1536X695|zh|||'
            }
        })
        if (resp.status === 200) {
            let json = JSON.parse(this.decrypt(resp.data))
            return json.data.redrUrl
        }
    }
}

export const Yun = new YunDrive();