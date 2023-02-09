function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1675957115,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 80,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "红牛资源站",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/红牛资源站.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/红牛资源站.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/红牛资源站.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/红牛资源站.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/红牛资源站.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签，第一个标签作为发现分类
		group: ["影视","动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			"电影": {
				"最近更新": ToolUtil.urlJoin(baseUrl,"/index.php/vod/type/id/SCCCCS.html?ac=detail")
			},
			"动漫": {
				"最近更新": ToolUtil.urlJoin(baseUrl,"/index.php/vod/type/id/ICCCCS.html?ac=detail")
			},
			"动漫": {
				"剧场版": 	ToolUtil.urlJoin(baseUrl,"/index.php/vod/type/id/uCCCCS.html?ac=detail")
			},
			"综艺": {
				"最近更新": ToolUtil.urlJoin(baseUrl,"/index.php/vod/type/id/xCCCCS.html?ac=detail")
			}
		},
	});
}
const baseUrl = "https://www.hongniuzy.com";
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/index.php/vod/search.html?wd=') + encodeURI(key) + header;
	const response = httpRequest(url);
	
	var result = [];
	var document = org.jsoup.Jsoup.parse(response,url);
	var elements = document.select(".xing_vb > ul:gt(0):not([style])");
	for (var i = 0;i < elements.size();i++) {
	  var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('.xing_vb4 > a > :matchText').text(),
			
			//概览
			summary: element.selectFirst('em').text(),
			
			//封面网址
			//coverUrl: element.selectFirst('img[data-original]').absUrl('data-original'),
			
			//网址
			url: element.selectFirst('.xing_vb4 > a').absUrl('href')
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
	var elements = document.select(".xing_vb > ul:gt(0):not([style])");
	for (var i = 0;i < elements.size();i++) {
		var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('.xing_vb4 > a > :matchText').text(),
			
			//概览
			summary: element.selectFirst('em').text(),
			
			//封面网址
			//coverUrl: element.selectFirst('img[data-original]').absUrl('data-original'),
			
			//网址
			url: element.selectFirst('.xing_vb4 > a').absUrl('href')
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
		title: document.selectFirst('.vodh > h2').text(),
		
		//作者
		author: document.selectFirst('.vodinfobox > ul > li:nth-child(2) > span').text(),
		
		//日期
		date: document.selectFirst('.vodinfobox > ul > li:nth-child(8) > span').text(),
		
		//概览
		summary: document.selectFirst('.playBox > div.vodplayinfo').text(),

		//封面网址
		coverUrl: document.selectFirst('.vodImg > img').absUrl('src'),
		
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
	//目录元素选择器
	const catalogElements= document.select('.vodplayinfo > div > div');
	
	//创建目录数组
	var newCatalogs = [];
	
	for (var i = 0;i < catalogElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').attr('title'),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newCatalogs.push({
			//目录名称
			name: catalogElements.get(i).selectFirst('h3').text(),
			//章节
			chapters: newChapters
		});
	}
	return newCatalogs
}