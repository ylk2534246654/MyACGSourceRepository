function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704380600,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "MuteFun",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/MuteFun.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/MuteFun.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/MuteFun.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1725793905,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: JavaUtils.getPreference().getString("baseUrl", defaultBaseUrl),
		
		//发现
		findList: {
			category: {
                "dm_label": ["全部","百合","校园","治愈","卖肉","恋爱","漫改","游戏改","日常","催泪","励志","萝莉","悬疑","科幻","异世界","穿越","纯爱","机战","惊悚","无下限","偶像","歌剧","后宫","战斗","搞笑","血腥","龙傲天","推理","治郁","轻改","泡面","热血","奇幻","歌剧","冒险","扭曲","胃疼","运动","腐","萝莉","萌"],
				"dm_year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","更早"],
				"order": {
					"更新排序": "time",
					"人气排序": "hits",
					"评分排序": "score",
				},
			},
			"动漫": ["20","dm_label","dm_year","order"]
		}
	});
}
/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 */
function isEnableAuthenticator(url, responseHtml) {
	if(responseHtml.indexOf('系统安全验证') != -1){
		return true;
	}
	return false;
}

const defaultBaseUrl = "https://www.2kdm.com"
/**
 * 发布页：https://www.mutefun.cn
 * 邮箱：mutefun@outlook.com
 * qq频道：pd.qq.com/s/97isp2qty
 * www.mutefun.tv
 */
function UpdateBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("https://www.mutefun.cn");
		var edit = preference.edit();
		if(response.code() == 200){
			var _baseUrl = response.body().cssDocument().selectFirst("nav > ul > li > a").absUrl('href');
			if(JavaUtils.isNetworkUrl(_baseUrl)){
				edit.putString("baseUrl", _baseUrl);//更新基础网址
			}
		}
		edit.putLong("baseUrlTime", time).apply();//更新时间
	}
	JavaUtils.getManifest().setBaseUrl(preference.getString("baseUrl", defaultBaseUrl));
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	UpdateBaseUrl()
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/vodsearch/-------------.html?wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.module-items > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.module-card-item-title > a').text(),
				
				//概览
				summary: element.selectFirst('div.module-info-item-content').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img[data-original]').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div > a[href]').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(type, label, year, order) {
	UpdateBaseUrl()
	if(label == "全部")label = "";
	if(year == "全部")year = "";
	
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/vodshow/${type}--${order}-${label}--------${year}.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".module-items > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.module-poster-item-title').text(),
				
				//概览
				summary: element.selectFirst('.module-item-note').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.module-item-pic > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
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
	UpdateBaseUrl()
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('div.module-info-heading > h1').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('div.module-info-items > div:nth-child(4) > div').text(),
			
			//概览
			summary: document.selectFirst('div.module-info-introduction > div > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.module-info-poster > div > div > img').absUrl('data-original'),
			
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
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录标签元素选择器
	const tagElements = document.select('div.tab-item');
	
	//目录元素选择器
	const tocElements = document.select('div.module-list');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('div.module-play-list > div > a');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		var text = "线路 " + i;
		if(i < tagElements.size()){
			text = tagElements.get(i).selectFirst('span').text();
		}
        if(text.indexOf("APP") == -1){
            newTocs.push({
                //目录名称
                name: text,
                //章节
                chapters : newChapters
            });
        }
	}
	return newTocs;
}