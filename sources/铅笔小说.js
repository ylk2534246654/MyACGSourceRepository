function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1674623577,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "铅笔小说",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/铅笔小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/铅笔小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/铅笔小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/铅笔小说.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703988234,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["轻小说","小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"label": {
					"网络小说": "0",
					"言情女生": "1",
					"玄幻奇幻": "2",
					"都市青春": "3",
					"武侠仙侠": "4",
					"耽美同人": "5",
					"科幻灵异": "6",
					"轻小说の": "7",
					"历史军事": "8"
				},
				"order": {
					"全部": "quanben",
					"总点击": "allvisit",
					"月点击": "monthvisit",
					"周点击": "weekvisit",
					"日点击": "dayvisit",
					"总推荐": "allvote",
					"月推荐": "monthvote",
					"周推荐": "weekvote",
					"日推荐": "dayvote",
					"总收藏": "goodnum",
					"字数": "size",
					"入站时间": "postdate",
					"更新时间": "lastupdate"
				},
				"size": {
					"全部": "0",
					"30万以下": "1",
					"30万-50万": "2",
					"50万-100万": "3",
					"100万-200万": "4",
					"200万以上": "5",
				},
				"status": {
					"全部": "0",
					"连载": "1",
					"完本": "2",
				}
			},
			"小说": ["label","order","size","status"]
		},

		//启用用户登录
		enableUserLogin: true,
		
		//用户登录网址
		userLoginUrl: JavaUtils.urlJoin(baseUrl, "/login.php"),
		
		//需要用户登录列表（search，detail，content，find）
		requiresUserLoginList: ["search"],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

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
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, JavaUtils.urlJoin(baseUrl, "/saerch.php")));
	if(response.code() == 200){
		if(response.body().string().indexOf('个人中心') != -1){
			return true;
		}
	}
	return false;
}

/**
 * https://www.23qb.net
 */
const baseUrl = "https://www.23qb.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/saerch.php@post->searchkey=${JavaUtils.encodeURI(key,'gbk')}&searchtype=all`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#sitebox > dl");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('dd > h3 > a').text(),
				
				//概览
				summary: element.selectFirst('#nr > dd.book_des').text(),
				
				//封面网址
				coverUrl: element.selectFirst('dt > a > img').absUrl('_src'),
				
				//网址
				url: element.selectFirst('dd > h3 > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(label, order, size, status) {
	var url = JavaUtils.urlJoin(baseUrl, `/book/${label}-${order}-0-${size}-0-0-${status}-0-1.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#sitebox > dl");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('dd > h3 > a').text(),
				
				//概览
				summary: element.selectFirst('#nr > dd.book_des').text(),
				
				//封面网址
				coverUrl: element.selectFirst('dt > a > img').absUrl('_src'),
				
				//网址
				url: element.selectFirst('dd > h3 > a').absUrl('href')
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
			name: document.selectFirst('div.d_title').text(),
			
			//作者
			author: document.selectFirst('#count > ul > li:nth-child(1) > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('#uptime > span').text(),
			
			//概览
			summary: document.selectFirst('#bookintro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#bookimg > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//创建章节数组
	var newChapters= [];
	
	//章节元素选择器
	var chapterElements = document.select('#chapterList > li');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		newChapters.push({
            //章节名称
            name: chapterElement.text(),
            //章节网址
            url: chapterElement.selectFirst('a').absUrl('href').replace('.html','_{1}.html')
        });
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters: newChapters
	}];
}

/**
 * 内容
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return document.select('#TextContent > p:not(:matches(铅笔小说|阅读模式|继续下一页))').outerHtml();
	}
}