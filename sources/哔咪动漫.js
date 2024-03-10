function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1655214571,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 0,//资源大部分无法播放，考虑列为失效搜索源
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "哔咪动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 10,

		//自述文件网址
		readmeUrlList: [
			"https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔咪动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1710060433,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫", "影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: JavaUtils.getPreference().getString("baseUrl", defaultBaseUrl),
		
		//发现
		findList: {
			"动漫": {
				"新番放送": "/type/riman/",
				"大陆动漫": "/type/guoman/",
				"番组计划": "/type/fanzu/",
				"剧场动画": "/type/juchang/",
			},
			"电视剧": "/type/dianshiju/",
			"电影": "/type/move/"
		},
	});
}
const defaultBaseUrl = "https://www.bimiacg10.net";
/**
 * http://bimiacg4.net
 * http://bimiacg5.net
 * http://bimiacg10.net
 * http://bimiacg.one
 * 
 * 导航：https://bimiacg.icu
 */
function UpdateBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("https://bimiacg.icu");
		var edit = preference.edit();
		if(response.code() == 200){
			var _baseUrl = JavaUtils.substring(response.body().string(),"www.","\"");
			if(_baseUrl != null){
				_baseUrl = "https://www." + String(_baseUrl).replace(/a@b/g, '.');
				edit.putString("baseUrl", _baseUrl);//更新基础网址
			}
		}
		edit.putLong("baseUrlTime", time).apply();//更新时间
	}
	JavaUtils.getManifest().setBaseUrl(preference.getString("baseUrl", defaultBaseUrl));
}

//网页浏览时不需要，所以未使用 httpRequestHeaderList
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	UpdateBaseUrl();
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/vod/search/@post->wd='+ encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url + header);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("ul.tab-cont > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.info > a').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('div.info > p').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img.lazy').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div.info > a').absUrl('href')
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
	UpdateBaseUrl();
	var result = [];
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), url) + header);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("ul.tab-cont > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.info > a').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('div.info > p').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img.lazy').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div.info > a').absUrl('href')
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
	UpdateBaseUrl();
	const response = JavaUtils.httpRequest(url + header);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: document.selectFirst('div.tit > h1').text(),
			
			//作者
			author: document.selectFirst('div.txt_intro_con > ul > li:nth-child(4) > storng > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('div.txt_intro_con > ul > li:nth-child(10) > :matchText').text(),
			
			//概览
			summary: document.selectFirst('li.li_intro > p:nth-child(3)').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.v_pic > img.lazy').absUrl('src'),
			
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
	//目录标签元素选择器
	const tagElements = document.select('.play_source_tab > a');
	
	//目录元素选择器
	const tocElements= document.select('.player_list');
	
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
			name: tagElements.get(i).selectFirst('a').text(),
			//章节
			chapters: newChapters
		});
	}
	return newTocs
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

/**
 * 对网页注入 JS 脚本（contentProcessType == 2）
 * @return  {string} url
 * @param  {boolean} isStart：运行时机{true：页面加载前，false：页面加载完成后}
 * @return  {string} js 代码
function webPageLoadJavaScript(url, isStart) {
	if(!isStart){
		return `document.write(document.querySelector("#playleft > iframe").outerHTML);`;
	}
	return null;
} 
*/