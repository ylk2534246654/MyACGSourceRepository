function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654704919,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230122,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "樱花动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 8,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/dmh8樱花动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/dmh8樱花动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/dmh8樱花动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/dmh8樱花动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/dmh8樱花动漫.js",
		},
		
		//更新时间
		updateTime: "2023年1月28日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//登录授权是否启用
		auth: false,
		
		//登录授权网址
		authUrl:"http://www.dm88.me/search.asp?searchword=" + header,//http://www.dmh8.me
		
		//需要授权的功能（search，detail，content，find）
		authRequired: ["search"],
	});
}
const baseUrl = "http://www.dm88.me";//和哆咪动漫类似
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36 iPhone';
/*
 * 拦截并验证手动授权数据
 * @params {string} html	网页源码
 * @params {string} url		网址
 * @returns 是否授权
 */
function authCallback(html,url) {
	if(html.length > 1 && html.indexOf('搜索结果') != -1){
		return true;
	}
	return false;
}
/*
 * 自动验证授权结果
 * @returns 是否授权
 */
function authVerify() {
	const response = httpRequest("http://www.dm88.me/search.asp?searchword=" + header);
	if(response.indexOf('搜索结果') != -1){
		return true;
	}
	return false;
}

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/search.asp?searchword=' + encodeURI(key) + header);
	const response = httpRequest(url);
	
	var result= [];
    var document = org.jsoup.Jsoup.parse(response,baseUrl);
    var elements = document.select("#searchList > li");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('.title').text(),
			
			//概览
			summary: element.selectFirst('div.detail > p.hidden-xs > :matchText').text(),
			
			//封面
			cover: element.selectFirst('div.thumb > a').absUrl('data-original'),
			
			//网址
			url: element.selectFirst('.title > a').absUrl('href')
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @params string url
 * @returns {[{title, summary, cover, url}]}
 */
function find(url) {
	const response = httpRequest(url + header);
	
	var result = [];
	var document = org.jsoup.Jsoup.parse(response,baseUrl);
	var elements = document.select("div.list > ul > li");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('a.itemtext').text(),
			
			//概览
			summary: element.selectFirst('div:nth-child(7) > span.cell_imform_value').text(),
			
			//封面
			cover: ToolUtil.urlJoin(url,ToolUtil.substring(element.selectFirst('div.imgblock').attr('style'),'\'','\'')),
			
			//网址
			url: element.selectFirst('a.itemtext').absUrl('href')
		});
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalog:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url + header);
    var document = org.jsoup.Jsoup.parse(response,baseUrl);
	return JSON.stringify({
		//标题
		title: document.selectFirst('h1.title').text(),
		
		//作者
		//author: ,
		
		//日期
		date: document.selectFirst('p.data > a:nth-child(8)').text(),
		
		//概览
		summary: document.selectFirst('div.content').text(),

		//封面
		cover: document.selectFirst('div.myui-content__thumb > a > img').absUrl('data-original'),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录加载
		catalogs: catalogs(document)
	});
}
/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(document) {
	const tagElements = document.select('ul.nav-tabs > li');
	
	//目录元素选择器
	const catalogElements= document.select('div.tab-pane');
	
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
				url: chapterElement.selectFirst('a').absUrl('href') + header
			});
		}
		newCatalogs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('li').text(),
			//章节
			chapters : newChapters
		});
	}
	return newCatalogs;
}
/**
 * 内容（部分动漫搜索源通用规则）
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	//浏览器请求结果处理，布米米，嘻嘻动漫，12wo动漫，路漫漫，风车动漫P，樱花动漫P，dmh8樱花动漫 相似
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