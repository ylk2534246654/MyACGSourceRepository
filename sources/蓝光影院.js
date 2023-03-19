function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660661201,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230320,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 35,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "蓝光影院",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/蓝光影院.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/蓝光影院.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/蓝光影院.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/蓝光影院.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/蓝光影院.js",
		},
		
		//更新时间
		updateTime: "2023年3月18日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		groupName: ["动漫","影视"],
		
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
function isEnabledAuthenticator(url, responseHtml) {
	if(responseHtml.indexOf('安全验证') != -1){
		return true;
	}
	return false;
}
const header = '';

/**
 * 搜索
 * @param {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/vodsearch/' + encodeURI(key) + '-------------.html');
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		Log('源码 -> ' + document.html());
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
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @param string url
 * @returns {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	url = ToolUtils.urlJoin(baseUrl, url);
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
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
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @return {[{title, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
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
			coverUrl: document.selectFirst('div.module-info-poster > div > div > img').absUrl('data-original'),
			
			//目录是否倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			catalogs: catalogs(document)
		});
	}
	return null;
}
/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
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
	var re = /vpic/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}