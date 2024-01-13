function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1675954629,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "稀饭动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/稀饭动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/稀饭动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/稀饭动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/稀饭动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704080044,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//自定义标签，第一个标签作为发现分类
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"genre": {
					"TV动画": "1",
					"BD动画": "2",
					"剧场版": "3"
				},
				"label": ["全部","恋爱","治愈","奇幻","百合","音乐","原创","搞笑","日常","异世界","热血","冒险","科幻","经典","漫画改"],
				"year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005"],
                "order": {
					"时间排序": "time",
					"人气排序": "hits",
					"评分排序": "score",
				},
			},
			"动漫": ["genre", "year", "label", "order"]
		},
	});
}
const baseUrl = "https://dick.xfani.com";
/**
 * 稀饭动漫.com
 * Q群：534319157
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search.html?wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".search-box");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.thumb-txt').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.public-list-prb').text(),
				
				//概览
				summary: element.selectFirst('.thumb-blurb').text(),

				//封面网址
				coverUrl: element.selectFirst('img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.public-list-exp').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(genre, year, label, order) {
	if(genre == "全部")genre = "";
	if(label == "全部")label = "";
	if(year == "全部")year = "";
	
	var result = [];
	const timestamp = Math.round(new Date().getTime() / 1000).toString();
	//DCC147D11943AF75 = EC['Pop']['Uid']
	var url = JavaUtils.urlJoin(baseUrl, `/index.php/api/vod@post->type=${genre}&class=${label}&area=&lang=&version=&state=&letter=&page=1&time=${timestamp}&by=${order}&year=${year}&key=${JavaUtils.bytesToHexString(JavaUtils.encryptMD5(`DS${timestamp}DCC147D11943AF75`), false)}`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.list.forEach((child) => {
			if(child.vod_remarks.indexOf("开播") == -1){//表示已开播作品
				result.push({
					//名称
					name: child.vod_name,
			
					//作者
					author: child.vod_actor,
					
					//最近更新时间
					//lastUpdateTime: ,
	
					//概览
					summary: child.vod_blurb,
			
					//封面网址
					coverUrl: child.vod_pic,
			
					//网址
					url: JavaUtils.urlJoin(baseUrl, `/bangumi/${child.vod_id}.html`)
				});
			}
		});

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
			name: document.selectFirst('.slide-info-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('#height_limit').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.detail-pic > img').absUrl('data-src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
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
	const tagElements = document.select('.anthology-tab > div  > a');
	
	//目录元素选择器
	const catalogElements= document.select('.anthology-list-play');
	
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
			name: tagElements.get(i).selectFirst('a > :matchText').text(),
			//章节
			chapters: newChapters
		});
	}
	return newCatalogs
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
		'^[a-zA-z]+://[^\\s/]+\.xyz','i'
	);
	if(!re.test(url)){
		return url;
	}
	return null;
}