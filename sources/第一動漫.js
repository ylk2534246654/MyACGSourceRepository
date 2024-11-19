function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704291571,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "第一動漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/第一動漫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/第一動漫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/第一動漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1725806100,
		
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
					"全部": "all",
					"ONA": "ona",
					"OVA": "ova",
					"SP": "special",
					"TV": "tv"
				},
				"status": {
					"全部": "all",
					"连载中": "airing",
					"已完结": "completed",
					"未播放": "not-yet-aired",
				},
				"label": ["全部","BL","三角關係","不良少年","偵探","偶像女","偶像男","兒童","冒險","前衛","劇情","動作","可愛","吸血鬼","團隊競技","太空","奇幻","女性向","寵物","少女","少年","後宮","御宅族","心理","性別轉變","恐怖","懸疑","戲仿","推理","搞笑","搞笑喜劇","擬人化","教育","日常","時間旅行","校園","格鬥運動","機甲","武士","武術","歷史","治癒","浪漫","浪漫潛台詞","演藝圈","熟男女","生存","異世界","異性裝扮","百合","神話","科幻","策略遊戲","紳士番","組織犯罪","網路遊戲","美食","職場生活","肉番","育兒","血腥虐殺","表演藝術","裏番","視覺藝術","賭博","賽車","超能力","超自然","軍事","輪迴","逆後宮","運動","醫學","青年","音樂"],
				"year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2006","2005","2004"],
				"order": {
					"时间排序": "update",
					"人气排序": "viewed",
				},
			},
			"动漫": ["genre","status","label","year","order"]
		},
		
		//启用用户登录
		enableUserLogin: true,
		
		//用户登录网址
		userLoginUrl: JavaUtils.urlJoin(baseUrl, "/登入頁面/"),
		
		//需要用户登录的功能（search，detail，content，find）
		requiresUserLoginList: ["content"],
	});
}
/*
 * 是否完成登录
 * @param {string} url		网址
 * @param {string} responseHtml	响应源码
 * @return {boolean}  登录结果
 */
function isUserLoggedIn(url, responseHtml) {
	if(!JavaUtils.isEmpty(responseHtml) && responseHtml.indexOf('個人資料') != -1){
		return true;
	}
	return verifyUserLoggedIn();
}
/*
 * 验证完成登录
 * @return {boolean} 登录结果
 */
function verifyUserLoggedIn() {
	var d1_lscache_vary = JavaUtils.getCookie(baseUrl, "d1_lscache_vary");
	if(!JavaUtils.isEmpty(d1_lscache_vary)){
		return true;
	}
	return false;
}

const baseUrl = "https://d1-dm.online";
/**
 * contact@d1-dm.online
 * discord.gg/d3cWu5v
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/advanced-search/?s_keyword=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".col-span-full > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.justify-between > a').text(),

				//概览
				summary: element.selectFirst('.text-xs').text(),

				//封面网址
				coverUrl: element.selectFirst('[data-src]').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.justify-between > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(genre, status, label, year, order) {
	if(label == "全部")label = "all";
	if(year == "全部")year = "all";
	var result = [];
	var url = JavaUtils.urlJoin(baseUrl, `/advanced-search/?s_keyword=&s_type=${genre}&s_status=${status}&s_season=all&s_year=${year}&s_orderby=${order}&s_genre=${encodeURI(label)}`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".col-span-full > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.justify-between > a').text(),

				//概览
				summary: element.selectFirst('.text-xs').text(),

				//封面网址
				coverUrl: element.selectFirst('[data-src]').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.justify-between > a').absUrl('href')
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
			name: document.selectFirst('.text-4xl').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('[property="og:description"]').attr("content"),
	
			//封面网址
			coverUrl: document.selectFirst('[property="og:image"]').absUrl('content'),
			
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
	//创建章节数组
	var newChapters = [];
	//章节元素选择器
	var chapterElements = document.select('.custom-scrollbar > a');
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('.text-base > :matchText').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters: newChapters
	}]
}