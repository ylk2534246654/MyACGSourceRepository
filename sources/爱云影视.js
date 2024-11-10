function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660912704,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 25,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "爱云影视",

		//搜索源作者
		author: "雨夏",
		
		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/爱云影视.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources%2F爱云影视.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/爱云影视.js",
		},

		//最近更新时间
		lastUpdateTime: 1723277990,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫","影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"state": {
					"全部": "",
					"连载中": "1",
					"已完结": "2",
				},
				"type1": {
					"全部": "",
					"国产": "10186",
					"日本": "10262",
					"日韩": "10182",
					"欧美": "10181",
					"海外": "10188",
					"港台": "10189",
					"其他": "10304",
				},
				"type2": {
					"全部": "",
					"剧情": "10002",
					"动作": "10003",
					"喜剧": "10005",
					"爱情": "10008",
					"科幻": "10006",
					"犯罪": "10255",
					"纪录": "10109",
					"电影解说": "10308",
					"恐怖": "10001",
					"动漫电影": "10251",
					"动画电影": "10261",
					"战争": "10007",
					"奇幻": "10250",
					"悬疑": "10260",
					"记录": "10161",
					"惊悚": "10256",
					"冒险": "10309",
					"微电影": "10183",
				},
				"type3": {
					"全部": "",
					"国产": "10011",
					"大陆": "10306",
					"香港": "10014",
					"港澳": "10305",
					"欧美": "10009",
					"美国": "10249",
					"韩国": "10012",
					"日韩": "10302",
					"港台": "10301",
					"日本": "10015",
					"台湾": "10017",
					"海外": "10016",
					"泰国": "10252",
				},
				"orderBy": {
					"更新日": "update",
					"日点击": "dailyCount",
					"周点击": "weeklyCount",
					"月点击": "monthlyCount",
				},
			},
			"动漫": ["state","type1","orderBy"],
			"电影": ["state","type2","orderBy"],
			"电视剧": ["state","type3","orderBy"],
		},
	})
}

const baseUrl = "https://www.iyunys.com";
//和 cocoManga 同为集云数据

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,`/search?type=1&searchString=${encodeURI(key)}`);
	const response = JavaUtils.httpRequest(url);
	var result= [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.fed-part-layout > dl");
		for (var i = 0; i < elements.size(); i++) {
			var element = elements.get(i);
			result.push({
				//标题
				name: element.selectFirst('dd > h1').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.fed-list-remarks').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('li:nth-child(7) > span').nextSibling().text(),
			
				//概览
				//summary: element.selectFirst('').text(),

				//封面网址
				coverUrl: element.selectFirst('dt > a').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('dt > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(state, type, orderBy) {
	var url = JavaUtils.urlJoin(baseUrl, `/show?status=${state}&mainCategoryId=${type}&orderBy=${orderBy}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".fed-list-info > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				name: element.selectFirst('.fed-list-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.fed-list-remarks').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('.fed-list-desc').text(),
			
				//概览
				//summary: element.selectFirst('').text(),

				//封面网址
				coverUrl: element.selectFirst('.fed-list-pics').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.fed-list-pics').absUrl('href')
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
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: document.selectFirst('h1.fed-part-eone').text(),
			
			//作者
			author: document.selectFirst('dd > ul > li:nth-child(2) > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('dd > ul > li:nth-child(6) > a').text(),
			
			//概览
			summary: document.selectFirst('p.fed-part-both').text(),
	
			//封面网址
			coverUrl: document.selectFirst('a.fed-list-pics:nth-last-child(1)').absUrl('data-original'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	const tagElements = document.select('div.fed-tabs-info > div > div > div > ul > li');
	
	//目录元素选择器
	const tocElements = document.select('div.fed-tabs-item > div > div > div > ul');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('a').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
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