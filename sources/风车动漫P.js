function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660803657,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 70,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "风车动漫P",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 7,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/风车动漫P.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/风车动漫P.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/风车动漫P.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/风车动漫P.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/风车动漫P.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//备份：https://m.dm530p.info/ ，和樱花动漫P同一模板
		
		//发现
		findList: {
			"每日推荐": "https://m.dm530p.com/recommend/",
			"最近更新": "https://m.dm530p.com/list/?region=%E6%97%A5%E6%9C%AC",
			"剧场版": "https://m.dm530p.com/list/?region=%E6%97%A5%E6%9C%AC&genre=%E5%89%A7%E5%9C%BA%E7%89%88",
			"完结": "https://m.dm530p.com/list/?region=%E6%97%A5%E6%9C%AC&status=%E5%AE%8C%E7%BB%93"
		},
	});
}
const baseUrl = "https://m.dm530p.com";
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/s_all?ex=1&kw='+ encodeURI(key) + header);
	const response = httpRequest(url);
	
	var result = [];
    var document = org.jsoup.Jsoup.parse(response,url);
    var elements = document.select("div.list > ul > li");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('a.itemtext').text(),
			
			//概览
			summary: element.selectFirst('div.itemimgtext').text(),
			
			//封面网址
			coverUrl: ToolUtil.urlJoin(url,ToolUtil.substring(element.selectFirst('div.imgblock').attr('style'),'\'','\'')),
			
			//网址
			url: element.selectFirst('a.itemtext').absUrl('href')
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
    var elements = document.select("div.list > ul > li");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('a.itemtext').text(),
			
			//概览
			summary: element.selectFirst('div.itemimgtext').text(),
			
			//封面网址
			coverUrl: ToolUtil.urlJoin(url,ToolUtil.substring(element.selectFirst('div.imgblock').attr('style'),'\'','\'')),
			
			//网址
			url: element.selectFirst('a.itemtext').absUrl('href')
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
		title: document.selectFirst('div:nth-child(2) > div > h1').text(),
		
		//作者
		author: document.selectFirst('div.info-sub > p:nth-child(1)').text(),
		
		//日期
		//date: document.selectFirst('').text(),
		
		//概览
		summary: document.selectFirst('div.info').text(),

		//封面网址
		coverUrl: document.selectFirst('div.show > img').absUrl('src'),
		
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
	const tagElements = document.select('#menu0 > li');
	
	//目录元素选择器
	const catalogElements= document.select('#main0 > div.movurl');
	
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
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newCatalogs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('li').text(),
			//章节
			chapters: newChapters
		});
	}
	return newCatalogs
}

/**
 * 内容（部分动漫搜索源通用规则）
 * @returns {string} content
 */
function content(url) {
	//浏览器请求结果处理，布米米，嘻嘻动漫，12wo动漫，路漫漫，风车动漫P，樱花动漫P 相似
	var re = /[a-z]+:\/\/[\w.]+\/([a-z]{1}\/\d|[a-z]{3}\/[a-z]{3}\/\d|[a-z]{2}\/\d{4}\?)/i;
	
	//这种格式均为广告网址
	//https://knr.xxxxx.cn/j/140000		#[a-z]{1}\/\d
	//https://xx.xxx.xx/xxx/xxx/0000	#[a-z]{3}\/[a-z]+\/\d
	//https://tg.xxx.com/sc/0000?n=xxxx #[a-z]{2}\/\d{4}\?
	
	if(!re.test(url)){
		return url;
	}
	return null;
}