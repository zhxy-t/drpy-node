/*
@header({
  searchable: 2,
  filterable: 1,
  quickSearch: 0,
  title: '奇米动漫',
  lang: 'dr2'
})
*/

var rule={
	title:'奇米动漫',
	host:'http://www.qimiqimi.net',
	url:'/show/fyclassfyfilter.html',
	filterable:1,//是否启用分类筛选,
	filter_url:'{{fl.area}}{{fl.by}}{{fl.class}}{{fl.letter}}/page/fypage{{fl.year}}',
	filter: {
		"xinfan":[{"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"冒险","v":"/class/冒险"},{"n":"热血","v":"/class/热血"},{"n":"奇幻","v":"/class/奇幻"},{"n":"恋爱","v":"/class/恋爱"},{"n":"校园","v":"/class/校园"},{"n":"后宫","v":"/class/后宫"},{"n":"搞笑","v":"/class/搞笑"},{"n":"治愈","v":"/class/治愈"},{"n":"神魔","v":"/class/神魔"},{"n":"魔法","v":"/class/魔法"},{"n":"百合","v":"/class/百合"},{"n":"推理","v":"/class/推理"},{"n":"科幻","v":"/class/科幻"},{"n":"竞技","v":"/class/竞技"},{"n":"悬疑","v":"/class/悬疑"},{"n":"青春","v":"/class/青春"},{"n":"战争","v":"/class/战争"},{"n":"萝莉","v":"/class/萝莉"},{"n":"魔幻","v":"/class/魔幻"},{"n":"战斗","v":"/class/战斗"},{"n":"日常","v":"/class/日常"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"日本","v":"/area/日本/"},{"n":"大陆","v":"/area/中国/"},{"n":"欧美","v":"/area/欧美/"},{"n":"韩国","v":"/area/韩国/"},{"n":"港台","v":"/area/港台/"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"/year/2025"},{"n":"2024","v":"/year/2024"},{"n":"2023","v":"/year/2023"},{"n":"2022","v":"/year/2022"},{"n":"2021","v":"/year/2021"},{"n":"2020","v":"/year/2020"},{"n":"2019","v":"/year/2019"},{"n":"2018","v":"/year/2018"},{"n":"2017","v":"/year/2017"},{"n":"2016","v":"/year/2016"},{"n":"2015","v":"/year/2015"},{"n":"2014","v":"/year/2014"},{"n":"2013","v":"/year/2013"},{"n":"2012","v":"/year/2012"},{"n":"2011","v":"/year/2011"},{"n":"2010","v":"/year/2010"},{"n":"2009","v":"/year/2009"},{"n":"2008","v":"/year/2008"},{"n":"2007","v":"/year/2007"},{"n":"2006","v":"/year/2006"},{"n":"2005","v":"/year/2005"},{"n":"2004","v":"/year/2004"},{"n":"2003","v":"/year/2003"},{"n":"2002","v":"/year/2002"},{"n":"2001","v":"/year/2001"},{"n":"2000","v":"/year/2000"}]},{"key":"letter","name":"字母","value":[{"n":"字母","v":""},{"n":"A","v":"/letter/A"},{"n":"B","v":"/letter/B"},{"n":"C","v":"/letter/C"},{"n":"D","v":"/letter/D"},{"n":"E","v":"/letter/E"},{"n":"F","v":"/letter/F"},{"n":"G","v":"/letter/G"},{"n":"H","v":"/letter/H"},{"n":"I","v":"/letter/I"},{"n":"J","v":"/letter/J"},{"n":"K","v":"/letter/K"},{"n":"L","v":"/letter/L"},{"n":"M","v":"/letter/M"},{"n":"N","v":"/letter/N"},{"n":"O","v":"/letter/O"},{"n":"P","v":"/letter/P"},{"n":"Q","v":"/letter/Q"},{"n":"R","v":"/letter/R"},{"n":"S","v":"/letter/S"},{"n":"T","v":"/letter/T"},{"n":"U","v":"/letter/U"},{"n":"V","v":"/letter/V"},{"n":"W","v":"/letter/W"},{"n":"X","v":"/letter/X"},{"n":"Y","v":"/letter/Y"},{"n":"Z","v":"/letter/Z"},{"n":"0-9","v":"/letter/0-9"}]},{"key":"by","name":"排序","value":[{"n":"时间","v":"/by/time"},{"n":"人气","v":"/by/hits"},{"n":"评分","v":"/by/score"}]}],
		"riman":[{"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"冒险","v":"/class/冒险"},{"n":"热血","v":"/class/热血"},{"n":"奇幻","v":"/class/奇幻"},{"n":"恋爱","v":"/class/恋爱"},{"n":"校园","v":"/class/校园"},{"n":"后宫","v":"/class/后宫"},{"n":"搞笑","v":"/class/搞笑"},{"n":"治愈","v":"/class/治愈"},{"n":"神魔","v":"/class/神魔"},{"n":"魔法","v":"/class/魔法"},{"n":"百合","v":"/class/百合"},{"n":"推理","v":"/class/推理"},{"n":"科幻","v":"/class/科幻"},{"n":"竞技","v":"/class/竞技"},{"n":"悬疑","v":"/class/悬疑"},{"n":"青春","v":"/class/青春"},{"n":"战争","v":"/class/战争"},{"n":"萝莉","v":"/class/萝莉"},{"n":"魔幻","v":"/class/魔幻"},{"n":"战斗","v":"/class/战斗"},{"n":"日常","v":"/class/日常"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"日本","v":"/area/日本/"},{"n":"大陆","v":"/area/中国/"},{"n":"欧美","v":"/area/欧美/"},{"n":"韩国","v":"/area/韩国/"},{"n":"港台","v":"/area/港台/"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"/year/2025"},{"n":"2024","v":"/year/2024"},{"n":"2023","v":"/year/2023"},{"n":"2022","v":"/year/2022"},{"n":"2021","v":"/year/2021"},{"n":"2020","v":"/year/2020"},{"n":"2019","v":"/year/2019"},{"n":"2018","v":"/year/2018"},{"n":"2017","v":"/year/2017"},{"n":"2016","v":"/year/2016"},{"n":"2015","v":"/year/2015"},{"n":"2014","v":"/year/2014"},{"n":"2013","v":"/year/2013"},{"n":"2012","v":"/year/2012"},{"n":"2011","v":"/year/2011"},{"n":"2010","v":"/year/2010"},{"n":"2009","v":"/year/2009"},{"n":"2008","v":"/year/2008"},{"n":"2007","v":"/year/2007"},{"n":"2006","v":"/year/2006"},{"n":"2005","v":"/year/2005"},{"n":"2004","v":"/year/2004"},{"n":"2003","v":"/year/2003"},{"n":"2002","v":"/year/2002"},{"n":"2001","v":"/year/2001"},{"n":"2000","v":"/year/2000"}]},{"key":"letter","name":"字母","value":[{"n":"字母","v":""},{"n":"A","v":"/letter/A"},{"n":"B","v":"/letter/B"},{"n":"C","v":"/letter/C"},{"n":"D","v":"/letter/D"},{"n":"E","v":"/letter/E"},{"n":"F","v":"/letter/F"},{"n":"G","v":"/letter/G"},{"n":"H","v":"/letter/H"},{"n":"I","v":"/letter/I"},{"n":"J","v":"/letter/J"},{"n":"K","v":"/letter/K"},{"n":"L","v":"/letter/L"},{"n":"M","v":"/letter/M"},{"n":"N","v":"/letter/N"},{"n":"O","v":"/letter/O"},{"n":"P","v":"/letter/P"},{"n":"Q","v":"/letter/Q"},{"n":"R","v":"/letter/R"},{"n":"S","v":"/letter/S"},{"n":"T","v":"/letter/T"},{"n":"U","v":"/letter/U"},{"n":"V","v":"/letter/V"},{"n":"W","v":"/letter/W"},{"n":"X","v":"/letter/X"},{"n":"Y","v":"/letter/Y"},{"n":"Z","v":"/letter/Z"},{"n":"0-9","v":"/letter/0-9"}]},{"key":"by","name":"排序","value":[{"n":"时间","v":"/by/time"},{"n":"人气","v":"/by/hits"},{"n":"评分","v":"/by/score"}]}],
		"guoman":[{"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"冒险","v":"/class/冒险"},{"n":"热血","v":"/class/热血"},{"n":"奇幻","v":"/class/奇幻"},{"n":"恋爱","v":"/class/恋爱"},{"n":"校园","v":"/class/校园"},{"n":"后宫","v":"/class/后宫"},{"n":"搞笑","v":"/class/搞笑"},{"n":"治愈","v":"/class/治愈"},{"n":"神魔","v":"/class/神魔"},{"n":"魔法","v":"/class/魔法"},{"n":"百合","v":"/class/百合"},{"n":"推理","v":"/class/推理"},{"n":"科幻","v":"/class/科幻"},{"n":"竞技","v":"/class/竞技"},{"n":"悬疑","v":"/class/悬疑"},{"n":"青春","v":"/class/青春"},{"n":"战争","v":"/class/战争"},{"n":"萝莉","v":"/class/萝莉"},{"n":"魔幻","v":"/class/魔幻"},{"n":"战斗","v":"/class/战斗"},{"n":"日常","v":"/class/日常"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"日本","v":"/area/日本/"},{"n":"大陆","v":"/area/中国/"},{"n":"欧美","v":"/area/欧美/"},{"n":"韩国","v":"/area/韩国/"},{"n":"港台","v":"/area/港台/"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"/year/2025"},{"n":"2024","v":"/year/2024"},{"n":"2023","v":"/year/2023"},{"n":"2022","v":"/year/2022"},{"n":"2021","v":"/year/2021"},{"n":"2020","v":"/year/2020"},{"n":"2019","v":"/year/2019"},{"n":"2018","v":"/year/2018"},{"n":"2017","v":"/year/2017"},{"n":"2016","v":"/year/2016"},{"n":"2015","v":"/year/2015"},{"n":"2014","v":"/year/2014"},{"n":"2013","v":"/year/2013"},{"n":"2012","v":"/year/2012"},{"n":"2011","v":"/year/2011"},{"n":"2010","v":"/year/2010"},{"n":"2009","v":"/year/2009"},{"n":"2008","v":"/year/2008"},{"n":"2007","v":"/year/2007"},{"n":"2006","v":"/year/2006"},{"n":"2005","v":"/year/2005"},{"n":"2004","v":"/year/2004"},{"n":"2003","v":"/year/2003"},{"n":"2002","v":"/year/2002"},{"n":"2001","v":"/year/2001"},{"n":"2000","v":"/year/2000"}]},{"key":"letter","name":"字母","value":[{"n":"字母","v":""},{"n":"A","v":"/letter/A"},{"n":"B","v":"/letter/B"},{"n":"C","v":"/letter/C"},{"n":"D","v":"/letter/D"},{"n":"E","v":"/letter/E"},{"n":"F","v":"/letter/F"},{"n":"G","v":"/letter/G"},{"n":"H","v":"/letter/H"},{"n":"I","v":"/letter/I"},{"n":"J","v":"/letter/J"},{"n":"K","v":"/letter/K"},{"n":"L","v":"/letter/L"},{"n":"M","v":"/letter/M"},{"n":"N","v":"/letter/N"},{"n":"O","v":"/letter/O"},{"n":"P","v":"/letter/P"},{"n":"Q","v":"/letter/Q"},{"n":"R","v":"/letter/R"},{"n":"S","v":"/letter/S"},{"n":"T","v":"/letter/T"},{"n":"U","v":"/letter/U"},{"n":"V","v":"/letter/V"},{"n":"W","v":"/letter/W"},{"n":"X","v":"/letter/X"},{"n":"Y","v":"/letter/Y"},{"n":"Z","v":"/letter/Z"},{"n":"0-9","v":"/letter/0-9"}]},{"key":"by","name":"排序","value":[{"n":"时间","v":"/by/time"},{"n":"人气","v":"/by/hits"},{"n":"评分","v":"/by/score"}]}],
		"jcdm":[{"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"冒险","v":"/class/冒险"},{"n":"热血","v":"/class/热血"},{"n":"奇幻","v":"/class/奇幻"},{"n":"恋爱","v":"/class/恋爱"},{"n":"校园","v":"/class/校园"},{"n":"后宫","v":"/class/后宫"},{"n":"搞笑","v":"/class/搞笑"},{"n":"治愈","v":"/class/治愈"},{"n":"神魔","v":"/class/神魔"},{"n":"魔法","v":"/class/魔法"},{"n":"百合","v":"/class/百合"},{"n":"推理","v":"/class/推理"},{"n":"科幻","v":"/class/科幻"},{"n":"竞技","v":"/class/竞技"},{"n":"悬疑","v":"/class/悬疑"},{"n":"青春","v":"/class/青春"},{"n":"战争","v":"/class/战争"},{"n":"萝莉","v":"/class/萝莉"},{"n":"魔幻","v":"/class/魔幻"},{"n":"战斗","v":"/class/战斗"},{"n":"日常","v":"/class/日常"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"日本","v":"/area/日本/"},{"n":"大陆","v":"/area/中国/"},{"n":"欧美","v":"/area/欧美/"},{"n":"韩国","v":"/area/韩国/"},{"n":"港台","v":"/area/港台/"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"/year/2025"},{"n":"2024","v":"/year/2024"},{"n":"2023","v":"/year/2023"},{"n":"2022","v":"/year/2022"},{"n":"2021","v":"/year/2021"},{"n":"2020","v":"/year/2020"},{"n":"2019","v":"/year/2019"},{"n":"2018","v":"/year/2018"},{"n":"2017","v":"/year/2017"},{"n":"2016","v":"/year/2016"},{"n":"2015","v":"/year/2015"},{"n":"2014","v":"/year/2014"},{"n":"2013","v":"/year/2013"},{"n":"2012","v":"/year/2012"},{"n":"2011","v":"/year/2011"},{"n":"2010","v":"/year/2010"},{"n":"2009","v":"/year/2009"},{"n":"2008","v":"/year/2008"},{"n":"2007","v":"/year/2007"},{"n":"2006","v":"/year/2006"},{"n":"2005","v":"/year/2005"},{"n":"2004","v":"/year/2004"},{"n":"2003","v":"/year/2003"},{"n":"2002","v":"/year/2002"},{"n":"2001","v":"/year/2001"},{"n":"2000","v":"/year/2000"}]},{"key":"letter","name":"字母","value":[{"n":"字母","v":""},{"n":"A","v":"/letter/A"},{"n":"B","v":"/letter/B"},{"n":"C","v":"/letter/C"},{"n":"D","v":"/letter/D"},{"n":"E","v":"/letter/E"},{"n":"F","v":"/letter/F"},{"n":"G","v":"/letter/G"},{"n":"H","v":"/letter/H"},{"n":"I","v":"/letter/I"},{"n":"J","v":"/letter/J"},{"n":"K","v":"/letter/K"},{"n":"L","v":"/letter/L"},{"n":"M","v":"/letter/M"},{"n":"N","v":"/letter/N"},{"n":"O","v":"/letter/O"},{"n":"P","v":"/letter/P"},{"n":"Q","v":"/letter/Q"},{"n":"R","v":"/letter/R"},{"n":"S","v":"/letter/S"},{"n":"T","v":"/letter/T"},{"n":"U","v":"/letter/U"},{"n":"V","v":"/letter/V"},{"n":"W","v":"/letter/W"},{"n":"X","v":"/letter/X"},{"n":"Y","v":"/letter/Y"},{"n":"Z","v":"/letter/Z"},{"n":"0-9","v":"/letter/0-9"}]},{"key":"by","name":"排序","value":[{"n":"时间","v":"/by/time"},{"n":"人气","v":"/by/hits"},{"n":"评分","v":"/by/score"}]}]
	},
	searchable:2,//是否启用全局搜索,
	headers:{//网站的请求头,完整支持所有的,常带ua和cookies
		'User-Agent': 'PC_UA',
	},
	class_parse: '#nav li;a&&Text;a&&href;.*/(\\w+).html',
	cate_exclude:'番组专题|最近更新',
	play_parse: true,
	search_match: true, //精准搜索
	lazy:`js:
		var html = JSON.parse(request(input).match(/r player_.*?=(.*?)</)[1]);
		var url = html.url;
		if (html.encrypt == '1') {
			url = unescape(url)
		} else if (html.encrypt == '2') {
			url = unescape(base64Decode(url))
		}
		if (/\\.m3u8|\\.mp4/.test(url)) {
			input = {
				jx: 0,
				url: url,
				parse: 0
			}
		} else {
			input
		}
	`,
	limit:6,
	推荐:'*;*;*;.text&&Text;*',
	一级:'.img-list li;a&&title;img&&src;i&&Text;a&&href',
	二级:{
		"title":"h1&&Text;dl.fn-left:eq(3)&&Text",
		"img":".detail-pic&&img&&src",
		"desc":"dl.fn-left:eq(2)&&Text;;;.nyzhuy--dt&&Text;.fn-right:eq(0)--dt&&Text",
		"content":".tjuqing&&Text",
		"tabs":".down-title h2",
		"lists":".video_list:eq(#id) a"
	},
	searchUrl:'/index.php/ajax/suggest?mid=1&wd=**&limit=50',
	detailUrl:'/detail/fyid.html', 
	//非必填,二级详情拼接链接
	//搜索:'json:list;name;pic;;id',
	搜索: $js.toString(() => {
        let d = [];
        let html =  request(input);
        let data = JSON.parse(html).list;
        if (rule.search_match) {
            data = data.filter(it => {
                let title = it.name;
                return title && new RegExp(KEY, "i").test(title);
            });
        }
        data.forEach((it) => {
            d.push({
                title: it.name,
                img: it.pic,
                year: it.author,
                desc: it.type,
                url: it.id
            });
        });
         setResult(d);
    }),
}