function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1703989084,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "布丁动画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/布丁动画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/布丁动画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/布丁动画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/布丁动画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1710060433,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				regexUrl: "/search.php",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				maxRequests: 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				period: 5100,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//发现
		findList: {
			"动漫": "/acg/",
			"电视剧": "/tv/",
			"电影": "/mov/",
			"综艺": "/zongyi/"
		},
	});
}
const baseUrl = "https://buding3.com";
/**
 * buding2.com
 * buding3.com
 * buding6.com
 * buding20.com
 * 站长 elizabethholmes3740@gmail.com
 * 
 * 和奇奇动漫相似
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	//没找到相关视频,请缩短关键词重新搜索,宁可少字,不可错字,如"你和我的倾城时光",只需输入"你和我的"
	if(key.replace(/[^\x00-\xff]/g, "00").length > 30){
		return null;
	}
	var url = JavaUtils.urlJoin(baseUrl, '/search.php@enabledFrameSource->true@post->searchword=' + key);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("ul > .mb");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.name').text(),
				
				//概览
				summary: element.selectFirst('.bz').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.img > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.li-hv').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(url) {
	var result = [];
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, url));
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("ul > li.mb");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.name').text(),
				
				//概览
				summary: element.selectFirst('.bz').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img.lazy').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.li-hv').absUrl('href')
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
			name: document.selectFirst('dt.name').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('#quanjq > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.pic > img').absUrl('data-original'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录元素选择器
	const tocElements = document.select('.urlli');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul > li');
		
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
			name: '线路 '+ (i + 1),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

/**
 * 内容（部分搜索源通用过滤规则）
 * @version 2024/3/15
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

		//https://xxxx.xxxxx.xxx:8004/d/0000?c=1&n=xxxx
		//https://tg.xxx.com/sc/0000?n=xxxx #[a-z]{2}\/\d{4}\?
		'|([a-z]{1,2}/\\d{4}\\?)' +

		//https://xx.xxx.xyz/vh1/158051				#[\w]{3}\/\d{6}$
		//https://br.xxxx.com:8891/vh3/3342			#[\w]{3}/[\d]+$
		//https://xxx.xxxxxx.xxx/v1jik8t6k/14395	#v[\\w]+/[\\d]+$
		//https://xxxx.xxxxx.xxx/vjkit2/14395		#v[\\w]+/[\\d]+$
		'|(v[\\w]+/[\\d]{2,6}$)' +

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

		//https://xxx.xxxxxxx.cn/slot?2377029035902478992-27158		#slot\?[\d-]+$
		'|(slot\\?[\\d-]+$)' +

		//https://xxxx.xxx/co/8656d6f784ebbaa5e141eb142a8ce579?t=0.06966902110642081&d=1&m=1&h=B**8
		'|([a-zA-z]{2}/[\\w]{32}\\?t=)' +

		//https://xxxxx.xxxx.xxx/uploads/m3u8/clnu9xc1t0002jxas9wfic5jq.ts
		'|(uploads/m3u8/[\\w]{25}\\.ts)' +

		//https://xxxx.xxxx.com/o.js # o\.js
		//'|o\\.js' + //无法正常加载

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