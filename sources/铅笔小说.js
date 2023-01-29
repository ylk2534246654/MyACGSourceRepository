function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1674623577,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230122,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 20,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "铅笔小说",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/铅笔小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/铅笔小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/铅笔小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/铅笔小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/铅笔小说.js",
		},
		
		//更新时间
		updateTime: "2023年1月25日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["轻小说","小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//登录授权是否启用
		auth: true,
		
		//登录授权网址
		authUrl:"https://www.23qb.net/login.php",
		
		//需要授权的功能（search，detail，content，find）
		authRequired: ["search"],
	});
}
/*
 * 拦截并验证手动授权数据
 * @params {string} html	网页源码
 * @params {string} url		网址
 * @returns 是否授权
 */
function authCallback(html,url) {
	if(html.length > 1 && html.indexOf('登录成功') != -1){
		return true;
	}
	return false;
}
/*
 * 自动验证授权结果
 * @returns 是否授权
 */
function authVerify() {
	const response = httpRequest("https://www.23qb.net/saerch.php" + header);
	if(response.indexOf('个人中心') != -1){
		return true;
	}
	return false;
}

const baseUrl = "https://www.23qb.net";
const header = '@header->user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.7';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/saerch.php@post->searchkey=' + ToolUtil.encodeURI(key,'gbk') + '&searchtype=all' + header);
	const response = httpRequest(url);
	
	var document = org.jsoup.Jsoup.parse(response,url);
	var result = [];
    var elements = document.select("#sitebox > dl");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('dd > h3 > a').text(),
			
			//概览
			summary: element.selectFirst('#nr > dd.book_des').text(),
			
			//封面
			cover: element.selectFirst('dt > a > img').absUrl('_src'),
			
			//网址
			url: element.selectFirst('dd > h3 > a').absUrl('href')
		});
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalogs:{[{name, chapters:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url + header);
	var document = org.jsoup.Jsoup.parse(response,url);
	return JSON.stringify({
		//标题
		title : document.selectFirst('div.d_title').text(),
		
		//作者
		author: document.selectFirst('#count > ul > li:nth-child(1) > a').text(),
		
		//日期
		date: document.selectFirst('#uptime > span').text(),
		
		//概览
		summary: document.selectFirst('#bookintro').text(),

		//封面
		cover: document.selectFirst('#bookimg > img').absUrl('src'),
		
		//目录是否倒序
		reverseOrder: false,
		
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
	var chapterElements = document.select('#chapterList > li');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		newChapters.push({
            //章节名称
            name: chapterElement.text(),
            //章节网址
            url: chapterElement.selectFirst('a').absUrl('href').replace('.html','_${p}.html') + '@zero->1@start->1'
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
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url);
	var document = org.jsoup.Jsoup.parse(response,url);
	return document.select('#TextContent > p:not(:matches(铅笔小说|阅读模式|继续下一页))').outerHtml();
}