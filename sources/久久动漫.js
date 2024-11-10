function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660759710,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 60,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "久久动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/久久动漫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources%2F久久动漫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/久久动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1725783292,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: JavaUtils.getPreference().getString("baseUrl", defaultBaseUrl),

		//发现
		findList: {
			category: {
				"label1": {
					"全部": "",
					"冒险": "1",
					"热血": "2",
					"奇幻": "3",
					"恋爱": "4",
					"校园": "5",
					"后宫": "6",
					"搞笑": "7",
					"青春": "8",
					"百合": "9",
					"科幻": "14",
					"推理": "13",
					"魔法": "12",
					"神魔": "11",
					"治愈": "10",
					"竞技": "59",
					"悬疑": "60",
					"战争": "62",
					"萝莉": "63",
					"魔幻": "64",
					"战斗": "65",
					"歌舞": "98",
					"历史": "99",
					"励志": "108",
					"偶像": "118",
					"职场": "121",
				},
				"label3": {
					"全部": "",
					"冒险": "36",
					"热血": "37",
					"奇幻": "38",
					"恋爱": "39",
					"校园": "40",
					"后宫": "41",
					"搞笑": "42",
					"治愈": "43",
					"神魔": "44",
					"魔法": "45",
					"百合": "46",
					"推理": "47",
					"科幻": "48",
					"竞技": "49",
					"悬疑": "66",
					"战争": "68",
					"萝莉": "69",
					"魔幻": "70",
					"战斗": "71",
					"青春": "72",
					"历史": "100",
					"歌舞": "101",
					"恐怖": "104",
					"职场": "107",
					"励志": "109",
					"偶像": "119",
				},
				"label4": {
					"全部": "",
					"冒险": "50",
					"热血": "51",
					"武侠": "52",
					"奇幻": "53",
					"玄幻": "54",
					"竞技": "55",
					"魔幻": "56",
					"科幻": "57",
					"恋爱": "58",
					"历史": "73",
					"战斗": "74",
					"搞笑": "75",
					"神魔": "76",
					"战争": "97",
					"古风": "111",
					"少女": "112",
					"萝莉": "113",
					"治愈": "114",
					"日常": "115",
					"歌舞": "116",
					"偶像": "120",
					"职场": "123",
					"仙侠": "125",
				},
				"year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003","2002","2001","2000"],
				"order": {
					"时间排序": "time",
					"人气排序": "hit",
					"评分排序": "score",
				},
			},
			"动漫": {
				"新番": ["1","label1","year","order"],
				"日本": ["3","label3","year","order"],
				"国产": ["4","label4","year","order"],
			}
		},
	});
}

const defaultBaseUrl = "http://www.995dm.com";

function UpdateBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("https://rentry.org/995dm");
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
 * https://my.cbox.ws/dm99
 * www.995dm.com,rentry.org/995dm
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	UpdateBaseUrl()
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/index.php?m=vod-search@post->wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".mb");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.name').text(),

				//作者
				//author: element.selectFirst('.zy').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.bz').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.img > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region, label, year, order) {
	UpdateBaseUrl()
	if(year == "全部")year = "0";
	
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/vod-list-id-${region}-pg-1-order--by-${order}-class-${label}-year-${year}-letter--area--lang-.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("ul > .mb");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.name').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.bz').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.img > img').absUrl('data-original'),
				
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
	UpdateBaseUrl()
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
			summary: document.selectFirst('.des2').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.pic > img').absUrl('data-src'),
			
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
	const tagElements = document.select('ul > li[id]');
	
	//目录元素选择器
	const tocElements = document.select('.taba-down > div[id]');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul > div');
		
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
			name: tagElements.get(i).selectFirst('li').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	var re = /\.gif|\/game\//i;
	if(!re.test(url)){
		return url;
	}
	return null;
}