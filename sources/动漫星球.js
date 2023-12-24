function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652945404,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 60,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "动漫星球",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 7,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫星球.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫星球.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/动漫星球.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/动漫星球.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703412181,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["影视", "动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				"regexUrl": "\/vodsearch\/",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				"maxRequests": 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				"period": 4000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//发现
		findList: {
			category: {
				"dy_region": ["全部","大陆","香港","台湾","美国","日本","韩国","英国","法国","德国","印度","泰国","丹麦","瑞典","巴西","加拿大","俄罗斯","意大利","比利时","爱尔兰","西班牙","澳大利亚"],
				"dm_region": ["全部","大陆","日本","欧美","其他"],
				"zy_region": ["全部","YouTube","脱口秀","真人秀","选秀","八卦","访谈","情感","生活","晚会","搞笑","音乐","时尚","游戏","少儿","体育","纪实","科教","曲艺","歌舞","财经","汽车","播报","其他"],
				"dy_label": ["全部","Netflix","仙侠","剧情","科幻","动作","喜剧","爱情","冒险","儿童","歌舞","音乐","奇幻","动画","恐怖","惊悚","丧尸","战争","传记","纪录","犯罪","悬疑","西部","灾难","古装","武侠","家庭","短片","校园","文艺","运动","青春","同性","励志","人性","美食","女性","治愈","历史","真人秀","脱口秀"],
				"dsj_label": ["全部","Netflix","剧情","丧尸","仙侠","穿越","惊悚","恐怖","言情","科幻","动作","喜剧","爱情","偶像","都市","军旅","谍战","罪案","宫廷","冒险","儿童","歌舞","音乐","奇幻","动画","战争","传记","记录","犯罪","悬疑","西部","灾难","古装","武侠","家庭","短片","校园","文艺","运动","青春","同性","励志","人性","美食","女性","治愈","历史","真人秀","脱口秀"],
				"dm_label": ["全部","Netflix","热血","科幻","美少女","魔幻","经典","励志","少儿","冒险","搞笑","推理","恋爱","治愈","幻想","校园","动物","机战","亲子","儿歌","运动","悬疑","怪物","战争","益智","青春","童话","竞技","动作","社会","友情","真人版","电影版","OVA版","TV版","新番动画","完结动画"],
				"zy_label": ["全部","脱口秀","真人秀","选秀","八卦","访谈","情感","生活","晚会","搞笑","音乐","时尚","游戏","少儿","体育","纪实","科教","曲艺","歌舞","财经","汽车","播报","旅游","美食","纪实","求职","其他"],
				"year": ["全部","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007"],
				"dm_year": ["全部","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","更早"],
				"order": {
					"按最新": "time",
					"按最热": "hits",
					"按评分": "score",
				},
			},
			"电影": ["20","dy_region","dy_label","year","order"],
			"电视剧": ["21","dy_region","dsj_label","year","order"],
			"动漫": ["22","dm_region","dm_label","dm_year","order"],
			"综艺": ["23","zy_region","zy_label","year","order"]
		}
	});
}

const baseUrl = "https://www.dmxq.me";

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 */
function isEnableAuthenticator(url, responseHtml) {
	if(responseHtml.indexOf('点击开始验证') != -1){
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
	var url = JavaUtils.urlJoin(baseUrl, '/vodsearch/-------------.html?wd=' + encodeURI(key));
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
function find(type, region, label, year, order) {
	if(region == "全部")region = "";
	if(label == "全部")label = "";
	if(year == "全部")year = "";
	
	var url = JavaUtils.urlJoin(baseUrl, `/vodshow/${type}-${region}-${order}-${label}--------${year}.html`);
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
			coverUrl: document.selectFirst('div.module-info-poster > div > div > img').absUrl('src'),
			
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
		newTocs.push({
			//目录名称
			name: text,
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

/**
 * 内容(InterceptRequest)
 * @returns {string} content
 */
function content(url) {
	var re = /vpic/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}