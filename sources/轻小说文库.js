function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714588,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 50,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "轻小说文库",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/轻小说文库.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704519781,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceOptionList: [
			{
				type: 3,
				key: "baseUrl",
				name: "选择网络类型",
				entries: {
					"非移动网络":	"https://www.wenku8.net",
					"移动网络":	"https://www.wenku8.cc",
				},
				defaultValue: 1
			}
		],

		//分组
		group: ["小说","轻小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"region": {
					"热门": "allvisit",
					"推荐": "allvote",
					"动画化": "anime",
					"今日更新": "lastupdate",
					"新书一览": "postdate",
					"人气": "goodnum"
				}
			},
			"轻小说": ["region"]
		},
		
		//启用用户登录
		enableUserLogin: true,
		
		//用户登录网址
		userLoginUrl: JavaUtils.urlJoin(baseUrl, "/index.php"),
		
		//需要用户登录列表（search，detail，content，find）
		requiresUserLoginList: ["search", "find"],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const baseUrl = JavaUtils.getPreference().getString("baseUrl", "https://www.wenku8.cc");
/**
 * www.wenku8.net
 * www.wenku8.cc
 */

/*
 * 是否完成登录
 * @param {string} url		网址
 * @param {string} responseHtml	响应源码
 * @return {boolean}  登录结果
 */
function isUserLoggedIn(url, responseHtml) {
	if(responseHtml != null && responseHtml.length > 1 && responseHtml.indexOf('登录成功') != -1){
		return true;
	}
	return false;
}
/*
 * 验证完成登录
 * @return {boolean} 登录结果
 */
function verifyUserLoggedIn() {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, "/index.php"));
	if(response.code() == 200){
		var responseHtml = response.body().string();
		if(responseHtml.length > 1 && responseHtml.indexOf('轻小说文库欢迎您') != -1){
			return true;
		}
	}
	return false;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/modules/article/search.php?searchtype=articlename&searchkey=${JavaUtils.encodeURI(key,'GBK')}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var responseHtml = response.body().string();
		if(responseHtml.indexOf('小说目录') != -1){
			result.push({
				//名称
				name: document.selectFirst('#content > div > table > tbody > tr > td > table > tbody > tr > td > span > b').text(),
				
				//概览
				summary: document.selectFirst('#content > div:nth-child(1) > table:nth-child(4) > tbody > tr > td:nth-child(2) > span:nth-child(13)').text(),
				
				//封面网址
				coverUrl: document.selectFirst('#content > div > table > tbody > tr > td > img').absUrl('src'),
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, `/book/${JavaUtils.substring(responseHtml,'bid=','\"')}.htm`)
			});
		}else{
			var elements = document.select("#content > table > tbody > tr > td > div");
			for (var i = 0;i < elements.size();i++) {
				var element = elements.get(i);
				result.push({
					//名称
					name: element.selectFirst('div:nth-child(2) > b > a').text(),
					
					//概览
					summary: element.selectFirst('div:nth-child(2) > p:nth-child(3)').text(),
					
					//封面网址
					coverUrl: element.selectFirst(':nth-child(1) > a > img').absUrl('src'),
					
					//网址
					url: element.selectFirst('div:nth-child(2) > b > a').absUrl('href')
				});
			}
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region) {
	var url = JavaUtils.urlJoin(baseUrl, `/modules/article/toplist.php?sort=${region}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#content > table > tbody > tr > td > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div:nth-child(2) > b > a').text(),
				
				//概览
				summary: element.selectFirst('div:nth-child(2) > p:nth-child(3)').text(),
				
				//封面网址
				coverUrl: element.selectFirst(':nth-child(1) > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('div:nth-child(2) > b > a').absUrl('href')
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
			//标题
			name: document.selectFirst('#content > div:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(1) > span > b').text(),
			
			//作者
			author: document.selectFirst('#content > div:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('dl:nth-child(5) > dd').text(),
			
			//概览
			summary: document.selectFirst('#content > div:nth-child(1) > table:nth-child(4) > tbody > tr > td:nth-child(2) > span:nth-child(13)').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#content > div > table > tbody > tr > td > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document.selectFirst('#content > div:nth-child(1) > div:nth-child(6) > div > span:nth-child(1) > fieldset > div > a').absUrl('href'))
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();

		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = document.select('td.vcss,td.ccss');
		
		var group;//分组记录
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			var href = chapterElement.selectFirst('a').absUrl('href');
			if(!JavaUtils.isNetworkUrl(href)){
				group = chapterElement.selectFirst(':matchText').text();
			}else{
				newChapters.push({
					//章节名称
					name: group + ' ' + chapterElement.selectFirst('a').text(),
					//章节网址
					url: chapterElement.selectFirst('a').absUrl('href')
				});
			}
		}
	}
	return [{
		//目录名称
		name: '目录',
		//章节
		chapters : newChapters
	}];
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return document.selectFirst('#content').outerHtml();
	}
	return null;
}

