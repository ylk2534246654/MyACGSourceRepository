function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1682766107,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,

		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "嘶哩嘶哩",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/嘶哩嘶哩.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources%2F嘶哩嘶哩.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/嘶哩嘶哩.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703913935,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceList: [
			{
				type: 2,
				key: "isPcUserAgent",
				name: "使用电脑端 UA 模式",
				defaultValue: false
			}
		],
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"year": ["全部","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004"],
				"order": {
					"时间排序": "time",
					"热门排序": "hits",
					"评分排序": "score",
				},
			},
			"动漫": {
				"新番日漫": ["year","order"],
				"新番国漫": ["year","order"],
			}
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": userAgent
		}
	});
}

const baseUrl = "https://www.silisilifun.com";
/**
 * weibass.github.io
 */

var userAgent;
if(JavaUtils.getPreference().getBoolean("isPcUserAgent", false)){
	userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183";
}else {
	userAgent = "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/115.0.0.0"
}

/**
 * 备份：
 * https://weibass.github.io
 * 
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	if(JavaUtils.getPreference().getBoolean("isPcUserAgent", false)){
		return pc_search(key);
	}else{
		return android_search(key);
	}
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function android_search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/vodsearch/?wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".hl-list-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.hl-item-title').text(),
				
				//概览
				summary: element.selectFirst('.hl-pic-text').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.hl-item-thumb').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.hl-item-title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function pc_search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/vodsearch/?wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".post-list");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.entry-title').text(),
				
				//概览
				summary: element.selectFirst('.entry-summary').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.search-image > a > img').absUrl('srcset'),
				
				//网址
				url: element.selectFirst('.entry-title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}


/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(year, order) {
	if(JavaUtils.getPreference().getBoolean("isPcUserAgent", false)){
		return pc_find(year, order);
	}else{
		return android_find(year, order);
	}
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function android_find(year, order) {
	if(year == "全部")genre = "";
	var url = JavaUtils.urlJoin(baseUrl, `/vodshow/by/${order}/id/xinfanriman/year/${year}/`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".hl-list-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.hl-item-title').text(),
				
				//概览
				summary: element.selectFirst('.hl-pic-text').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.hl-item-thumb').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.hl-item-title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function pc_find(year, order) {
	if(year == "全部")genre = "";
	var url = JavaUtils.urlJoin(baseUrl, `/vodshow/by/${order}/id/xinfanriman/year/${year}/`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".bg_cl");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.entry-title > a > :matchText').text(),
				
				//概览
				summary: element.selectFirst('.entry-summary').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.entry-media > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.entry-title > a').absUrl('href')
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
	if(JavaUtils.getPreference().getBoolean("isPcUserAgent", false)){
		return pc_detail(url);
	}else{
		return android_detail(url);
	}
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function android_detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('.hl-dc-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.hl-full-box > ul > li:nth-child(11)').text(),
			
			//概览
			summary: document.selectFirst('.hl-content-text').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.hl-dc-pic > span').absUrl('data-original'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: android_tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function android_tocs(document) {
	//目录标签元素选择器
	const tagElements = document.select('.hl-tabs-btn');
	
	//目录元素选择器
	const tocElements = document.select('.hl-tabs-box');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('.hl-plays-list > li');
		
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
			name: tagElements.get(i).text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function pc_detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('.entry-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.v_sd_r > p:nth-child(4) > :matchText').text(),
			
			//概览
			summary: document.selectFirst('.v_cont > :matchText').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.v_sd_l > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: pc_tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function pc_tocs(document) {
	//目录元素选择器
	const tocElements = document.select('.play-pannel-box');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul.stui-content__playlist > li');
		
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
			name: tocElements.get(i).selectFirst('.widget-title').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}