function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660661201,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "蓝光影院",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/蓝光影院.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/蓝光影院.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/蓝光影院.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695372702,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫","影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//和动漫星球结构相似

		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				"regexUrl": "\/vodsearch\/",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				"maxRequests": 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				"period": 3000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//发现
		findList: {
			"影视": {
				"最近更新": "/label/new.html"
			}
		},
	});
}

//相似网站模板：蓝光影院、555电影网、动漫星球
const baseUrl = "https://www.lgyy.vip";
/**
 * www.6446.tv
 * www.lgyy.cc
 * www.lgyy.tv
 * www.lgyy.vip
 */

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 */
function isEnableAuthenticator(url, responseHtml) {
	if(responseHtml.indexOf('安全验证') != -1){
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
	var url = JavaUtils.urlJoin(baseUrl, `/vodsearch/${encodeURI(key)}-------------.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.module-items > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.module-card-item-title > a').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.module-item-note').text(),

				//概览
				summary: element.selectFirst('.module-card-item-info > div:nth-child(3) > div').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img[data-original]').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div > a[href]').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @param string url
 * @returns {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	url = JavaUtils.urlJoin(baseUrl, url);
	const response = JavaUtils.httpRequest(url);
	var result= [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".module-main > div > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.module-poster-item-title').text(),
				
				//概览
				summary: element.selectFirst('.module-item-note').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.module-item-pic > img').absUrl('data-original'),
				
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
			name: document.selectFirst('div.module-info-heading > h1').text(),
			
			//作者
			//author: document.selectFirst('li:nth-child(5) > span.detail_imform_value').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('div.module-info-items > div:nth-child(4) > div').text(),
			
			//概览
			summary: document.selectFirst('div.module-info-introduction > div > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.module-info-poster > div > div > img').absUrl('data-original'),
			
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
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	const tagElements = document.select('div.tab-item');
	
	//目录元素选择器
	const catalogElements= document.select('div.module-list');
	
	//创建目录数组
	var newTocs = [];
	
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
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('span').text(),
			//章节
			chapters: newChapters
		});
	}
	return newTocs
}

/**
 * 内容(InterceptRequest)
 * @returns {string} content
 */
function content(url) {
	var re = /vpic|yximgs/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}