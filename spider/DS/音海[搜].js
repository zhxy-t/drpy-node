/*
@header({
searchable: 2,
filterable: 0,
quickSearch: 0,
title: '影搜',
lang: 'dr2'
})
*/


globalThis.h_ost = 'https://sou.makifx.com/';

var rule = {
    title: '影搜',
    host: h_ost,
    searchUrl: '/?kw=**',
    searchable: 1,
    quickSearch: 1,
    headers: {
        'User-Agent': 'PC_UA',
    },
    timeout: 5000,
    play_parse: true,
    search_match: true,
    lazy: async function() {
        let {
            input
        } = this;
        let url = input.startsWith('push://') ? input : 'push://' + input;
        return {
            parse: 0,
            url: url
        };
    },
    推荐: async function() {
        let d = [{
            url: 'only_search',
            title: '这是个纯搜索源哦',
            desc: '这是个纯搜索源哦',
            img: 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/网盘.png'
        }]
        return setResult(d)
    },

    一级: async function () {
    return this.推荐();
    },
    二级: async function() {
        let {
            input
        } = this;
        VOD = {};
        VOD.vod_play_from = "網盤";
        VOD.vod_remarks = input;
        VOD.vod_actor = "沒有二級，只有一級鏈接直接推送播放";
        VOD.vod_content = input;
        VOD.vod_play_url = "網盤$" + 'push://' + input;
        return VOD
    },


    搜索: async function() {
        let {input,KEY} = this;
        let d = [];
        let html = await request(input);
        let data = JSON.parse(html).data.merged_by_type;
        const platformRes = Object.values(data);

        platformRes.forEach(resList => {
            resList.forEach(resource => {
                let link = resource.url;
                let imageLink = '';
                if (link.includes('uc')) {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/UC.png';
                } else if (link.includes('quark')) {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/夸克.png';
                } else if (link.includes('ali')) {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/阿里.png';
                } else if (link.includes('yun')) {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/移动.png';
                } else if (link.includes('cloud.189')) {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/天翼.png';
                } else if (link.includes('baidu')) {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/百度.png';
                } else if (link.includes('www.123')) {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/img/123.png';
                } else {
                    imageLink = 'https://cnb.cool/zhyadc/YsBox/-/git/raw/main/images/icon_cookie/网盘.png'
                }

                d.push({
                    title: resource.note,
                    url: 'push://' + resource.url,
                    img: imageLink,
                    desc: resource.datetime
                });
            });
        });
        if (rule.search_match) {
            const reg = new RegExp(KEY, 'i');
            d = d.filter(item => item.title && reg.test(item.title));
        }
        d = d.slice(0, 50);

        return setResult(d);
    }

}