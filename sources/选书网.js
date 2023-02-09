function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1656609292,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "选书网",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/选书网.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/选书网.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/选书网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/选书网.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/选书网.js",
		},
		
		//更新时间
		updateTime: "2023年1月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}

const baseUrl = "https://www.ixuanshu.org";//失效：https://www.xuanshu.com
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.70';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/search.php@post->searchkey=' + encodeURI(key) + header);
	const response = httpRequest(url);
	
	var document = org.jsoup.Jsoup.parse(response,url);
	var result = [];
    var elements = document.select("#content > table > tbody > tr:has(> td)");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('.even > a').text(),
			
			//概览
			summary: element.selectFirst('.even:not(:has(a))').text(),
			
			//封面网址
			//coverUrl: ,
			
			//网址
			url: element.selectFirst('.even > a').absUrl('href')
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
		title : document.selectFirst('div.info_des > h1').text(),
		
		//作者
		author: document.selectFirst('div.info_des > dl:nth-child(2)').text(),
		
		//日期
		date: document.selectFirst('div.info_des > dl:nth-child(4)').text(),
		
		//概览
		summary: document.selectFirst('div.info_des > div').text(),

		//封面网址
		coverUrl: document.selectFirst('div.tupian > a > img').absUrl('src'),
		
		//目录是否倒序
		isReverseOrder: false,
		
		//目录网址/非外链无需使用
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
	var chapterElements = document.select('.pc_list > ul > li');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		newChapters.push({
            //章节名称
            name: chapterElement.text(),
            //章节网址
            url: chapterElement.selectFirst('a').absUrl('href')
        });
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
	var document = org.jsoup.Jsoup.parse(response,url);
	return document.select('#content1 > :matchText').outerHtml();
}