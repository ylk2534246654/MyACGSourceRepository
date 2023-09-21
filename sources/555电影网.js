function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670407862,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 60,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "555电影网",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/555电影网.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/555电影网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/555电影网.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/555电影网.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695294073,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

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
			category: {
				"type": {
					"电影": "1",
					"电视剧": "2",
					"综艺": "3",
					"动漫": "4",
				},
				"region": ["大陆","日本","欧美","其他"],
				"order": {
					"时间排序": "time",
					"人气排序": "hits",
					"评分排序": "score",
				},
			},
			default: ["type","region","order"],
		},
	});
}

const baseUrl = "https://www.555dd1.com";
/**
 * //导航网址：https://www.555app.cc/
 * 导航网址2：https://www.555kan.net/
 */

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 */
function isEnableAuthenticator(url, responseHtml) {
	if(responseHtml.indexOf('点击开始验证') != -1){
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
	var url = JavaUtils.urlJoin(baseUrl, '/vodsearch/-------------.html?wd=' + encodeURI(key));
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
				summary: element.selectFirst('div.module-info-item-content').text(),
				
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
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(type, region, order) {
	var url = JavaUtils.urlJoin(baseUrl, `/vodshow/${type}-${region}-${order}---------.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".module-main > div > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.module-poster-item-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.module-item-note').text(),

				//概览
				summary: element.selectFirst('div.module-info-item-content').text(),
				
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
			//author: document.selectFirst('').text(),
			
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
 * 对网页请求拦截（contentProcessType == 2）
 * @return  {string} url
 */
function content(url) {
	var re = /vpic/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}

/**
 * 对网页注入 JS 脚本（contentProcessType == 2）
 * @return  {string} url
 * @param  {boolean} isStart：运行时机{true：页面加载前，false：页面加载完成后}
 * @return  {string} js 代码
 */
function loadJavaScript(url, isStart) {
	return null;
}