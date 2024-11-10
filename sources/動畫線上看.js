function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704258756,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 60,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "動畫線上看",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/動畫線上看.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/動畫線上看.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/動畫線上看.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704269710,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//自定义标签，第一个标签作为发现分类
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			//"user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Edg/120.0.0.0",
		}
	});
}
const baseUrl = "https://anime1.me";
/**
 * twitter.com/Anime1Me
 * t.me/anime1notify
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/?s=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".site-main > article");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.cat-links > a').text(),
				
				//最近更新时间
				//lastUpdateTime: element.selectFirst('.entry-date').text(),

				//封面网址
				//coverUrl: element.selectFirst('img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.cat-links > a').absUrl('href')
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
			name: document.selectFirst('#book-cont > h1').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('#wrap').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#book-cont > img').absUrl('data-original'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(document)
		});
	}
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	var doc = document;
	//创建章节数组
	var newChapters = [];
	var documents = []
	while(doc != null){
		documents.push(doc)
		var previous = doc.selectFirst('.nav-previous > a');
		doc = null;
		if(previous != null){
			var href = previous.absUrl('href');
			if(!JavaUtils.isEmpty(href)){
				const response = JavaUtils.httpRequest(href);
				if(response.code() == 200){
					doc = response.body().cssDocument();
				}
			}
		}
	}
	for(var i = 0;i < documents.length; i++){
		//章节元素选择器
		var chapterElements = documents[i].select('.entry-title');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			var a = chapterElement.selectFirst('a').text();
			var name = JavaUtils.substring(a,"[","]");
			if(JavaUtils.isEmpty(name)){
				name = a;
			}
			newChapters.push({
				//章节名称
				name: name,
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters: newChapters
	}]
}
/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	//浏览器请求结果处理
	//hpttnp2dj2t8\.xyz|kdjb\.xyz|afwefdsa\.xyz
	var re = new RegExp(
		//https://
		'^[a-zA-z]+://[^\\s/]+\.xyz|\.gif$','i'
	);
	if(!re.test(url)){
		return url;
	}
	return null;
}