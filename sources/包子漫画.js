function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652949783,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,//加载速度慢
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "包子漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 6,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/包子漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/包子漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//https://cn.webmota.com/
	});
}
const baseUrl = "https://cn.baozimh.com";
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/search?q='+ encodeURI(key) + header);
	const response = httpRequest(url);
	
	var result = [];
    var document = org.jsoup.Jsoup.parse(response,url);
	var elements = document.select("div.search > div.pure-g > div");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('div.comics-card__title').text(),
			
			//概览
			summary: element.selectFirst('small.tags').text(),
			
			//封面网址
			coverUrl: element.selectFirst('a > amp-img').absUrl('src'),
			
			//网址
			url: element.selectFirst('a.text-decoration-none').absUrl('href')
		});
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @returns {[{title, author, date, summary, coverUrl, isReverseOrder, catalog:{[{tag, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
    var document = org.jsoup.Jsoup.parse(response,url);
	return JSON.stringify({
		//标题
		title: document.selectFirst('h1.comics-detail__title').text(),
		
		//作者
		author: document.selectFirst('h2.comics-detail__author').text(),
		
		//日期
		//date: document.selectFirst('').text(),
		
		//概览
		summary: document.selectFirst('div.l-content > div > div > div > p').text(),

		//封面网址
		coverUrl: document.selectFirst('div.l-content > div > div > amp-img').absUrl('data-media'),
		
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
	//创建章节数组
	var newChapters= [];
	
	//章节元素选择器
	var chapterElements = document.select('#chapter-items > div,#chapters_other_list > div');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		var aElement = chapterElement.selectFirst('a');
		var href = aElement.absUrl('href');
		newChapters.push({
			//章节名称
			name: aElement.text(),
			//章节网址
			url: 'https://cn.webmota.com/comic/chapter/' + ToolUtil.substring(href,'comic_id=','&') + '/0_' + ToolUtil.substring(href + '&','chapter_slot=','&') + '_${p}.html@zero->1@start->1'
		});
	}
	if(newChapters.length < 1){//最新章节
		chapterElements = document.select('.comics-chapters');
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			var aElement = chapterElement.selectFirst('a');
			var href = aElement.absUrl('href');
			newChapters.push({
				//章节名称
				name: aElement.text(),
				//章节网址
				url: 'https://cn.webmota.com/comic/chapter/' + ToolUtil.substring(href,'comic_id=','&') + '/0_' + ToolUtil.substring(href + '&','chapter_slot=','&') + '_${p}.html@zero->1@start->1'
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
	const response = httpRequest(url + header);
	//创建漫画数组
	var result= [];
	//漫画列表代码
    var document = org.jsoup.Jsoup.parse(response,url);
	var contentElements = document.select('[[src]],.comic-contain__item');
	for (var i2 = 0;i2 < contentElements.size();i2++) {
		var contentElement = contentElements.get(i2);

		var srcElement = contentElement.selectFirst('[src]');
		if(srcElement != null){
			result.push(srcElement.absUrl('src'));
		}
	}
	return JSON.stringify(result);
}