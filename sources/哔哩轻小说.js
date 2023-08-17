function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654507793,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230815,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "哔哩轻小说",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 7,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔哩轻小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔哩轻小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔哩轻小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔哩轻小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哔哩轻小说.js",
		},
		
		//更新时间
		updateTime: "2023年8月15日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//分组
		group: ["轻小说","小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": ["恋爱","后宫","百合","校园","穿越","龙傲天","欢乐向","女性视角","人外","奇幻","冒险","青春","异世界","妹妹","病娇","性转","NTR","青梅竹马","战斗","魔法","黑暗","伪娘","悬疑","转生","大小姐","战争","科幻","复仇","斗智","纯爱","猎奇","经营","异能","JK","职场","惊悚","机战","轻文学","末日","女儿","旅行","纯爱?","美食","耽美","大逃杀","推理","治愈","萝莉","游记","游戏","犯罪","男性向","音乐","末世","爱情","群像","恐怖","JC","宅文化","间谍","日本文学","脑洞","温馨","救赎","竞技","哲学","灵异","爱情悬疑","神怪","热血","浪漫","心理","神话","格斗","越","策略","伤痛","都市","短篇集","社团"]
			},
			"轻小说": ["label"]
		},
		
		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				regexUrl: "search.html",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				maxRequests: 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				period: 11000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}
const baseUrl = "https://www.bilinovel.com";
/**
 * https://www.bilinovel.com
 * https://www.linovelib.com
 */

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 * @return {boolean} 返回结果
 */
function isEnabledAuthenticator(url, responseHtml) {
	//对框架进行拦截，检索关键字，
	if(responseHtml.length > 1 && responseHtml.indexOf('检查站点连接是否安全') != -1){
		return true;
	}
	return false;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/search.html@post->searchkey=${encodeURI(key)}&searchtype=all`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var responseHtml = response.body().string();
		if(responseHtml.indexOf('开始阅读') != -1){
			result.push({
				//名称
				name: document.selectFirst('.book-title').text(),
				
				//概览
				summary: document.selectFirst('#bookSummary').text(),
				
				//封面网址
				coverUrl: document.selectFirst('.module-book-cover > div > img').absUrl('src'),
				
				//网址
				url: document.selectFirst("[property='og:url']").absUrl('content')
			});
		}else{
			var elements = document.select(".book-li");
			for (var i = 0;i < elements.size();i++) {
				var element = elements.get(i);
				result.push({
					//名称
					name: element.selectFirst('.book-title').text(),
					
					//概览
					summary: element.selectFirst('.book-desc').text(),
					
					//封面网址
					coverUrl: element.selectFirst('img').absUrl('data-src'),
					
					//网址
					url: element.selectFirst('a').absUrl('href')
				});
			}
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(label) {
	var url = JavaUtils.urlJoin(baseUrl, `https://www.bilinovel.com/tagarticle/${encodeURI(label)}/1.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".book-li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.book-title').text(),
				
				//概览
				summary: element.selectFirst('.book-desc').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('.book-title').text(),
			
			//作者
			author: document.selectFirst('.book-rand-a > span > a').text(),
			
			//更新时间
			update: document.selectFirst('.book-meta-r > p').text(),
			
			//概览
			summary: document.selectFirst('#bookSummary').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.module-book-cover > div > img').absUrl('src'),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document.selectFirst('.book-meta.book-status').absUrl('href'))
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
		var chapterElements = document.select('.chapter-bar,.chapter-li');
		
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
 * @return {string} content
 */
function content(url) {
	var re = /google/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}