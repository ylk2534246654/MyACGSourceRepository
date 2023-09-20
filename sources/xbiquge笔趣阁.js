function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714426,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 10,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "香书小说",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/xbiquge笔趣阁.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/xbiquge笔趣阁.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/xbiquge笔趣阁.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/xbiquge笔趣阁.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695148521,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"玄幻": "xuanhuanxiaoshuo",
					"修真": "xiuzhenxiaoshuo",
					"都市": "dushixiaoshuo",
					"穿越": "chuanyuexiaoshuo",
					"网游": "wangyouxiaoshuo",
					"科幻": "kehuanxiaoshuo",
				}
			},
			"小说": ["label"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const baseUrl = "https://www.ibiquges.org";
//备用：www.xbiquge.la,www.ibiquge.la,www.ibiquges.org

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/modules/article/waps.php@post->searchkey=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("tbody > tr:nth-child(n+2)");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('a:not([href~=html])').text(),
				
				//作者
				author: element.selectFirst('td:nth-child(3)').text(),

				//最后章节名称
				lastChapterName: element.selectFirst('td:nth-child(2) > a').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('td:nth-child(4)').text(),
				
				//封面网址
				//coverUrl: element.selectFirst('').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('a:nth-child(1)').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(label) {
	var url = JavaUtils.urlJoin(baseUrl, `/${label}/`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".ll > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('dt > span').text(),

				//作者
				author: element.selectFirst('dt > a').text(),

				//概览
				summary: element.selectFirst('dl > dd').text(),

				//封面网址
				coverUrl: element.selectFirst('.image > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.image > a').absUrl('href')
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
			name: document.selectFirst('#info > h1').text(),
			
			//作者
			author: document.selectFirst('info > p:nth-child(2)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('#info > p:nth-child(4)').text(),
			
			//概览
			summary: document.selectFirst('#intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#fmimg > img').absUrl('src'),
			
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
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('#list > dl > dd');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
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
		return document.select(`#content:not(:matches(${baseUrl})):matchText`).outerHtml();
	}
}

