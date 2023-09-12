function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1655214571,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

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
		version: 8,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔咪动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1694518508,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫", "影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
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
const baseUrl = getBaseUrl();
/**
 * http://bimiacg4.net
 * http://bimiacg5.net
 * http://bimiacg10.net
 * http://bimiacg.one
 * 
 * 导航：https://bimiacg.icu
 */
function getBaseUrl() {
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
				_baseUrl = "http://www." + String(_baseUrl).replace(/a@b/g, '.');
				edit.putString("baseUrl", _baseUrl);//更新基础网址
			}
		}
		edit.putLong("baseUrlTime", time).apply();//更新时间
	}
	return preference.getString("baseUrl", "https://www.bimiacg10.net");
}

//网页浏览时不需要，所以未使用 httpRequestHeaderList
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/vod/search/@post->wd='+ encodeURI(key));
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
	var result = [];
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, url) + header);
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
 * 内容(InterceptRequest)
 * @return {string} content
 */
function content(url) {
	if(url.length > 500){
		return null;
	}
	//浏览器请求结果处理
	var re = /sohu|hm\.|\.gov|\.qq|\.alpha|\.xyz|cpv|360buyimg|suning|knmer|qqmail_head|adInnovationResource|[a-z]+:\/\/[\w.]+\/[a-z]{1}\/[a-z]{1}\?|WASE\/[\w-]+\/\w+/i;
	
	//https://api.simi0000.com/s/a?_=000000000000000000
	//https://d.xxxxxxx.xyz/WASE/Z-13289-G-227/ODqpbVmd4324097374 # WASE\/[\w-]\/\w

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
 */
function webPageLoadJavaScript(url, isStart) {
	if(!isStart){
		return `document.write(document.querySelector("#playleft > iframe").outerHTML);`;
	}
	return null;
}