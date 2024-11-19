function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654507793,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "哔哩轻小说",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 10,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔哩轻小说.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/哔哩轻小说.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔哩轻小说.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1714378836,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["轻小说","小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"order": {
					"月点击榜":"monthvisit",
					"周点击榜":"weekvisit",
					"月推荐榜":"monthvote",
					"周推荐榜":"weekvote",
					"月鲜花榜":"monthflower",
					"周鲜花榜":"weekflower",
					"月鸡蛋榜":"monthegg",
					"周鸡蛋榜":"weekegg",
					"最近更新":"lastupdate",
					"最新入库":"postdate",
					"收藏榜":"goodnum",
					"新书榜":"newhot",
				}
			},
			"轻小说": ["order"]
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
			"user-agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/116.0.0.0"
		}
	});
}

const baseUrl = "https://www.bilinovel.com";
/**
 * https://www.bilinovel.com
 * https://www.linovelib.com
 * https://w.linovelib.com
 */

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 * @return {boolean} 返回结果
 */
function isEnableAuthenticator(url, responseHtml) {
	//对框架进行拦截，检索关键字，
	if(responseHtml != null && responseHtml.length > 1 && responseHtml.indexOf('检查站点连接是否安全') != -1){
		return true;
	}
	return false;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	JavaUtils.webViewEvalJS(JavaUtils.urlJoin(baseUrl, "/login.php"), "")
	var url = JavaUtils.urlJoin(baseUrl, `/search.html?searchkey=${encodeURI(key)}@enableFrameSource->true`);
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
					
					//作者
					author: element.selectFirst('.book-author').text(),
					
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
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(order) {
	var url = JavaUtils.urlJoin(baseUrl, `/top/${encodeURI(order)}/1.html`);
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
				
				//作者
				author: element.selectFirst('.book-author').text(),
				
				//概览
				summary: element.selectFirst('.book-intro').text(),

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
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
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
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.book-meta-r > p').text(),
			
			//概览
			summary: document.selectFirst('#bookSummary').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.module-book-cover > div > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
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