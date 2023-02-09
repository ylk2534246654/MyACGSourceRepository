function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652945404,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "动漫星球",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/动漫星球.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫星球.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫星球.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/动漫星球.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/动漫星球.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/动漫星球.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签，第一个标签作为发现分类
		group: ["影视","动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.dmxq.me",
		
		//是否启用登录授权
		auth: true,
		
		//登录授权网址
		authUrl:"https://www.dmxq.me/vodsearch/-------------.html?wd=" + header,
		
		//需要授权的功能（search，detail，content，find）
		authRequire: ["search"],
		
		//发现
		findList: {
			"影视": {
				"最近更新": "https://www.dmxq.me/label/new.html"
			}
		},
	});
}
/*
 * 拦截并验证手动授权数据
 * @params {string} html	网页源码
 * @params {string} url		网址
 * @returns 是否授权
 */
function authCallback(html,url) {
	if(html.length > 1 && html.indexOf('验证') == -1){
		return true;
	}
	return false;
}
/*
 * 自动验证授权结果
 * @returns 是否授权
 */
function authVerify() {
	const response = httpRequest("https://www.dmxq.me/vodsearch/-------------.html?wd=" + header);
	if(response.indexOf('验证') == -1){
		return true;
	}
	return false;
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = 'https://www.dmxq.me/vodsearch/-------------.html?wd='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	var result = [];
    var document = org.jsoup.Jsoup.parse(response,url);
    var elements = document.select("div.module-items > div");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('div.module-card-item-title > a').text(),
			
			//概览
			summary: element.selectFirst('div.module-info-item-content').text(),
			
			//封面网址
			coverUrl: element.selectFirst('img[data-original]').absUrl('data-original'),
			
			//网址
			url: element.selectFirst('div > a[href]').absUrl('href')
		});
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @params string url
 * @returns {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	const response = httpRequest(url + header);
	
	var result = [];
    var document = org.jsoup.Jsoup.parse(response,url);
    var elements = document.select(".module-main > div > a");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('.module-poster-item-title').text(),
			
			//概览
			summary: element.selectFirst('.module-item-note').text(),
			
			//封面网址
			coverUrl: element.selectFirst('.module-item-pic > img').absUrl('data-original'),
			
			//网址
			url: element.selectFirst('a').absUrl('href')
		});
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @returns {[{title, author, date, summary, coverUrl, isReverseOrder, catalogs:{[{name, chapters:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url + header);
    var document = org.jsoup.Jsoup.parse(response,url);
	return JSON.stringify({
		//标题
		title: document.selectFirst('div.module-info-heading > h1').text(),
		
		//作者
		//author: document.selectFirst('').text(),
		
		//日期
		date: document.selectFirst('div.module-info-items > div:nth-child(4) > div').text(),
		
		//概览
		summary: document.selectFirst('div.module-info-introduction > div > p').text(),

		//封面网址
		coverUrl: document.selectFirst('div.module-info-poster > div > div > img').absUrl('src'),
		
		//目录是否倒序
		isReverseOrder: false,
		
		//目录加载
		catalogs: catalogs(document)
	});
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(document) {
	const tagElements = document.select('div.tab-item');
	
	//目录元素选择器
	const catalogElements= document.select('div.module-list');
	
	//创建目录数组
	var newCatalogs = [];
	
	for (var i = 0;i < catalogElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('div.module-play-list > div > a');
		
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
			name: tagElements.get(i).selectFirst('span').text(),
			//章节
			chapters: newChapters
		});
	}
	return newCatalogs
}

/**
 * 内容(InterceptRequest)
 * @returns {string} content
 */
function content(url) {
	//浏览器请求结果处理，嘻嘻动漫，12wo动漫，路漫漫，风车动漫P，樱花动漫P 相似
	var re = /vpic/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}