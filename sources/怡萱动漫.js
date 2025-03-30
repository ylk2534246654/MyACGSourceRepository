function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704245698,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 60,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "怡萱动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/怡萱动漫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/怡萱动漫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/怡萱动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1743328942,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//自定义标签，第一个标签作为发现分类
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: JavaUtils.getPreference().getString("baseUrl", defaultBaseUrl),
		
		//发现
		findList: {
			category: {
				"region": ["全部","日本","欧美"],
				"genre": ["全部","TV","剧场版","OVA","其他"],
				"status": ["全部","连载中","已完结","未播放"],
				"label": ["全部","冒险","热血","爱情","搞笑","后宫","校园","机战","幻想","科幻","竞技","百合","耽美","悬疑","剧情","战争","恐怖","运动","动作","童话","历史","真人","女性向","泡面番"],
				"year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","更早"],
				"order": {
					"时间排序": "pubdate",
					"人气排序": "click",
				},
			},
			"动漫": ["region", "genre", "year", "status", "label", "order"]
		},
	});
}
const defaultBaseUrl = "https://www.iyxdm.com";
/**
 * rentry.org/yxdm
 * acgfans.org/pub.html
 * www.iyxdm.com
 * www.iyxdm.cc
 * www.yxdm.tv
 */
function UpdateBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("https://rentrys.cc/yxdm");
		var edit = preference.edit();
		if(response.code() == 200){
			var _baseUrl = response.body().cssDocument().selectFirst("blockquote > p > a").absUrl('href');
			if(JavaUtils.isNetworkUrl(_baseUrl)){
				edit.putString("baseUrl", _baseUrl);//更新基础网址
			}
		}
		edit.putLong("baseUrlTime", time).apply();//更新时间
	}
	JavaUtils.getManifest().setBaseUrl(preference.getString("baseUrl", defaultBaseUrl));
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	UpdateBaseUrl()
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/search.html?title=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".dhnew > ul > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('p:nth-child(3) > a').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('p:nth-child(4) > a').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('p:nth-child(5) > font').text(),

				//封面网址
				coverUrl: element.selectFirst('a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region, genre, year, status, label, order) {
	UpdateBaseUrl()
	if(region == "全部")region = "";
	if(genre == "全部")genre = "";
	if(status == "全部")status = "";
	if(label == "全部")label = "";
	if(year == "全部")year = "";

	var result = [];
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/category.html?channel=17&year=${year}&zhonglei=${genre}&status=${status}&jqlx=${label}&orderby=${order}&area=${region}`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".dhnew > ul > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('p:nth-child(2) > a').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('p:nth-child(4)').text(),

				//封面网址
				coverUrl: element.selectFirst('a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	UpdateBaseUrl()
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('.anime-img > h1').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.info1-left > li:nth-child(3) > p').text(),
			
			//概览
			summary: document.selectFirst('#box > p > :matchText').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.anime-img > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document)
		});
	}
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	const tagElements = document.select('.ol-select > ul > li');
	
	//目录元素选择器
	const catalogElements= document.select('.ol-content');
	
	//创建目录数组
	var newCatalogs = [];
	
	for (var i = 0;i < catalogElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newCatalogs.push({
			//目录名称
			name: tagElements.get(i).selectFirst(':matchText').text(),
			//章节
			chapters: newChapters
		});
	}
	return newCatalogs
}
/**
 * 内容（部分搜索源通用过滤规则）
 * @version 2024/1/15
 * 布米米、嘻嘻动漫、12wo动漫、路漫漫、风车动漫P、樱花动漫P、COCO漫画、Nike、cocoManga
 * @return {string} content
 */
function content(url) {
	var re = new RegExp(
		//https://
		'(^[a-zA-z]+://[^\\s/]+/(' +

		//https://knr.xxxxx.cn/j/140000		#[a-z]{1}\/\d{6}
		'([a-z]{1}/\\d)' +

		//https://xx.xxx.xx/xxx/xxx/0000	#[a-z]{3}\/[a-z]{3}\/\d
		'|([a-z]{3}/[a-z]{3}/\\d)' +

		//https://tg.xxx.com/sc/0000?n=xxxx #[a-z]{2}\/\d{4}\?
		'|([a-z]{2}/\\d{4}\\?)' +

		//https://xx.xxx.xyz/vh1/158051 	#[\w]{3}\/\d{6}$
		'|([\\w]{3}/\\d{6}$)' +

		//https://xx.xx.com/0000/00/23030926631.txt 	#[\d]{4}\/\d{2}\/\d{11}\.txt
		'|([\\d]{4}/\\d{2}/\\d{11}\\.txt)' +

		//https://xxx.com/ba4fa4f070f761b057fbabfb3fd7925d.txt 	#\w{32}\.txt
		'|(\\w{32}\\.txt)' +
		
		//https://zbg.xxx.com/candy14395.js 	#\w{32}\.txt
		'|(candy\\d{5}\\.)' +

		//https://xxxxx.xxxxxx.com/v2/stats/12215/157527 	#[\w]{2}\/\w{5}\/\d{5}\/\d{6}
		'|([\\w]{2}/\\w{5}/\\d{5}/\\d{6})' +

		//https://xxx.xxxxxx.com/sh/to/853	#sh\/[\w]{2}\/\d{3}
		'|(sh/[\\w]{2}/\\d{3})' +

		//https://xxx.rmb.xxxxxxxx.com/xxx/e3c5da206d50f116fc3a8f47502de66d.gif #[\w]{3}\/[\w]{32}\.
		'|([\\w]{3}/[\\w]{32}\\.)' +

		//https://xxxx.xxxx.xx:00000/mnrt/kmrr1.woff
		//https://xxxx.xxxx.xx:00000/kmopef/3.woff # [\w/]+[/km][\w/]+\.woff
		'|([\\w/]+[/km][\\w/]+\\.woff)' +

		//https://aba.xxxxxxx.cn/slot?2377029035902478992-27158		#slot\?[\d-]+$
		'|(slot\\?[\\d-]+$)' +

		//https://xxxx.xxxx.com/o.js # o\.js
		//'|o\\.js' + //无法正常加载

		//https://br.xxxx.com:8891/vh3/3342
		'|([\\w]{3}/[\\d]+$)' +

		//（!易误拦截） 例子过长，无法展示		#[\\w]{3}\?[\\S]{400,}
		'|([\\w]{3}\?[\\S]{400,})' +
		
		'))' +
        //Google
		'|(^[a-zA-z]+://[^\\s/]+doubleclick\\.net/)'
		,
		'i'
	);
	if(!re.test(url)){
		return url;
	}
	return null;
}