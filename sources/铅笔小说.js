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

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/铅笔小说.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/铅笔小说.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/铅笔小说.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1766338018,
		
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
					"全部": "0",
					"言情小说": "1",
					"都市小说": "2",
					"耽美百合": "3",
					"穿越转生": "4",
					"青春校园": "5",
					"玄幻魔法": "6",
					"修真武侠": "7",
					"历史军事": "8",
					"游戏竞技": "9",
					"科幻空间": "10",
					"悬疑惊悚": "11",
					"同人小说": "12",
					"官场职场": "13"
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
					"200-300万": "5",
					"400万以上": "6",
				},
				"status": {
					"全部": "0",
					"连载": "1",
					"完本": "5",
				}
			},
			"小说": ["order","label","size","status"]
		},

		
		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				regexUrl: baseUrl,//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				maxRequests: 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				period: 5000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
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
	var url = JavaUtils.urlJoin(baseUrl, `/search.html?searchkey=${JavaUtils.encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".module-search-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('[title]').attr("title"),
				
				//概览
				summary: element.selectFirst('.novel-info-main > div > div').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.module-item-pic > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('[title]').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(order, label, size, status) {
	var url = JavaUtils.urlJoin(baseUrl, `/book/${order}_0_${label}_0_${size}_0_0_${status}_1_0.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".module-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.module-item-title').attr("title"),
				
				//作者
				author: element.selectFirst('.module-item-text').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.module-item-pic > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.module-item-title').absUrl('href')
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
			name: document.selectFirst('.page-title').text(),
			
			//作者
			author: document.selectFirst('.novel-tag-icon').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.itemtitle').text(),
			
			//概览
			summary: document.selectFirst('.novel-info-content').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.module-item-pic > img').absUrl('data-src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document.selectFirst('.catalog-more').absUrl('href'))
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
	//创建章节数组
	var newChapters = [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		//章节元素选择器
		var chapterElements = document.select('.module-row-info');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('.module-row-title').text(),
				//章节网址
				url: chapterElement.selectFirst('.module-row-text').absUrl('href')
			});
		}
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
		return document.select('.article-content').outerHtml();
	}
}