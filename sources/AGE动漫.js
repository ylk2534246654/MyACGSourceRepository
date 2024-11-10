function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714123,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "AGE动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 6,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/AGE动漫.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/AGE动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/AGE动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1710055011,
		
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
				"region": ["全部","日本","欧美"],
				"genre": ["全部","TV","剧场版","OVA"],
				"status": ["全部","连载中","已完结","未播放"],
				"label": ["全部","搞笑","运动","励志","武侠","特摄","热血","战斗","竞技","校园","青春","爱情","冒险","后宫","百合","治愈","萝莉","魔法","悬疑","推理","奇幻","神魔","恐怖","血腥","机战","战争","犯罪","社会","职场","剧情","伪娘","耽美","歌舞","肉番","美少女","吸血鬼","泡面番","欢乐向"],
				"year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003","2002","更早"],
				"resources": ["全部","BDRIP","AGE-RIP"],
				"order": {
					"时间排序": "time",
					"人气排序": "点击量",
				},
			},
			"动漫": {
				default: ["genre","year","label","resources","order","region","status"],
				"每日推荐": {
					"param": "/recommend",
					"function": "find2"
				}
			}
		},

		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				regexUrl: "/search",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				maxRequests: 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				period: 3000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			//"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const defaultBaseUrl = "https://www.agemys.org";
/**
 * 发布页
 * https://github.com/agefanscom/website
 * http://age.tv
 */

function UpdateBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("https://rentry.org/agefans");
		var edit = preference.edit();
		if(response.code() == 200){
			var _baseUrl = response.body().cssDocument().selectFirst("blockquote > p > a").absUrl('href');
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
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/search?&query=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#cata_video_list > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.video_play_status').text(),
				
				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.video_cover > div > a > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.card-title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(genre, year, label, resources, order, region, status) {
	UpdateBaseUrl()
	if(genre == "全部")genre = "all";
	if(year == "全部")year = "all";
	if(year == "更早")year = "2000以前";
	if(label == "全部")label = "all";
	if(resources == "全部")resources = "all";
	if(region == "全部")region = "all";
	if(status == "全部")status = "all";
	
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/catalog/${genre}-${year}-all-${label}-${resources}-${order}-1-${region}-all-${status}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("#cata_video_list > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.video_play_status').text(),

				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.video_cover > div > a > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.card-title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现2
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find2(url) {
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), url);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.video_item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.video_item-title > a').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.video_item--info').text(),

				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.video_item--image > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.video_item-title > a').absUrl('href')
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
			name: document.selectFirst('.video_detail_title').text(),
			
			//作者
			author: document.selectFirst('li:nth-child(5) > span.detail_imform_value').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('li:nth-child(7) > span.detail_imform_value').text(),
			
			//概览
			summary: document.selectFirst('div.video_detail_desc').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.video_detail_cover > img').absUrl('data-original'),
			
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
	const tagElements = document.select('.nav-item');
	
	//目录元素选择器
	const tocElements = document.select('.tab-pane');
	
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
				url: chapterElement.selectFirst('a').absUrl('href').replace("http://","https://")
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('li').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

