function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660897962,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 60,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "嘻嘻动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 6,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新链接
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/嘻嘻动漫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/嘻嘻动漫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/嘻嘻动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1718435686,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: baseUrl,
		
		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64",
			"user-agent-platform": "Win32",
		}
	});
}
const baseUrl = "https://74fan.com";
//站点导航：http://www.xixidm.com/
//备份：http://74fan.com/
//备份：http://www.qdtsdp.com/
//备份：http://ppxdm.com/

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 */
function isEnableAuthenticator(url, responseHtml) {
	if(responseHtml.indexOf('需要输入验证码') != -1){
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
	var url = JavaUtils.urlJoin(baseUrl, '/search/-------------.html@post->wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".lists-content > ul > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('h2').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.note').text(),

				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.lazyload').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.lazyload').absUrl('href')
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
			name: document.selectFirst('.product-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('div:nth-child(8) > span').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.product-header > img').absUrl('src'),
			
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
	//目录元素选择器
	const tagElements = document.select('.playlist');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tagElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tagElements.get(i).select('ul > li');
		
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
			name: '线路 ' + (1 + i),
			//章节
			chapters: newChapters
		});
	}
	return newTocs
}

/**
 * 内容（部分搜索源通用过滤规则）
 * @version 2024/1/15
 * 布米米、嘻嘻动漫、12wo动漫、路漫漫、风车动漫P、樱花动漫P、COCO漫画、Nike、cocoManga
 * @return {string} content
 */
function content(url) {
	var re = new RegExp(
		//https://
		'(^[a-zA-z]+://[^\\s/]+/(' +

		//https://knr.xxxxx.cn/j/140000		#[a-z]{1}\/\d{6}
		'([a-z]{1}/\\d)' +

		//https://xx.xxx.xx/xxx/xxx/0000	#[a-z]{3}\/[a-z]{3}\/\d
		'|([a-z]{3}/[a-z]{3}/\\d)' +

		//https://tg.xxx.com/sc/0000?n=xxxx #[a-z]{2}\/\d{4}\?
		'|([a-z]{2}/\\d{4}\\?)' +

		//https://xx.xxx.xyz/vh1/158051 	#[\w]{3}\/\d{6}$
		'|([\\w]{3}/\\d{6}$)' +

		//https://xx.xx.com/0000/00/23030926631.txt 	#[\d]{4}\/\d{2}\/\d{11}\.txt
		'|([\\d]{4}/\\d{2}/\\d{11}\\.txt)' +

		//https://xxx.com/ba4fa4f070f761b057fbabfb3fd7925d.txt 	#\w{32}\.txt
		'|(\\w{32}\\.txt)' +
		
		//https://zbg.xxx.com/candy14395.js 	#\w{32}\.txt
		'|(candy\\d{5}\\.)' +

		//https://xxxxx.xxxxxx.com/v2/stats/12215/157527 	#[\w]{2}\/\w{5}\/\d{5}\/\d{6}
		'|([\\w]{2}/\\w{5}/\\d{5}/\\d{6})' +

		//https://xxx.xxxxxx.com/sh/to/853	#sh\/[\w]{2}\/\d{3}
		'|(sh/[\\w]{2}/\\d{3})' +

		//https://xxx.rmb.xxxxxxxx.com/xxx/e3c5da206d50f116fc3a8f47502de66d.gif #[\w]{3}\/[\w]{32}\.
		'|([\\w]{3}/[\\w]{32}\\.)' +

		//https://xxxx.xxxx.xx:00000/mnrt/kmrr1.woff
		//https://xxxx.xxxx.xx:00000/kmopef/3.woff # [\w/]+[/km][\w/]+\.woff
		'|([\\w/]+[/km][\\w/]+\\.woff)' +

		//https://aba.xxxxxxx.cn/slot?2377029035902478992-27158		#slot\?[\d-]+$
		'|(slot\\?[\\d-]+$)' +

		//https://xxxx.xxxx.com/o.js # o\.js
		//'|o\\.js' + //无法正常加载

		//https://br.xxxx.com:8891/vh3/3342
		'|([\\w]{3}/[\\d]+$)' +

		//（!易误拦截） 例子过长，无法展示		#[\\w]{3}\?[\\S]{400,}
		'|([\\w]{3}\?[\\S]{400,})' +
		
		'))' +
        //Google
		'|(^[a-zA-z]+://[^\\s/]+doubleclick\\.net/)'
		,
		'i'
	);
	if(!re.test(url)){
		return url;
	}
	return null;
}