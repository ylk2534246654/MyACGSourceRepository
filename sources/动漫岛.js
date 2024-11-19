function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704249735,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "动漫岛",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫岛.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/动漫岛.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/动漫岛.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1725783801,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//自定义标签，第一个标签作为发现分类
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: JavaUtils.getPreference().getString("baseUrl", defaultBaseUrl),
		
		//发现
		findList: {
			category: {
				"label1": {
					"全部":"0",
					"冒险":"1",
					"热血":"2",
					"奇幻":"3",
					"恋爱":"4",
					"校园":"5",
					"后宫":"6",
					"搞笑":"7",
					"青春":"8",
					"百合":"9",
					"科幻":"14",
					"推理":"13",
					"魔法":"12",
					"神魔":"11",
					"治愈":"10",
					"竞技":"59",
					"悬疑":"60",
					"战争":"62",
					"萝莉":"63",
					"魔幻":"64",
					"战斗":"65",
					"歌舞":"98",
					"历史":"99",
					"励志":"108",
					"偶像":"118",
					"职场":"121"
				},
				"label3": {
					"全部":"0",
					"冒险":"36",
					"热血":"37",
					"奇幻":"38",
					"恋爱":"39",
					"校园":"40",
					"后宫":"41",
					"搞笑":"42",
					"治愈":"43",
					"神魔":"44",
					"魔法":"45",
					"百合":"46",
					"推理":"47",
					"科幻":"48",
					"竞技":"49",
					"悬疑":"66",
					"战争":"68",
					"萝莉":"69",
					"魔幻":"70",
					"战斗":"71",
					"青春":"72",
					"历史":"100",
					"歌舞":"101",
					"恐怖":"104",
					"职场":"107",
					"励志":"109",
					"偶像":"119",
				},
				"label4": {
					"全部":"0",
					"冒险":"50",
					"热血":"51",
					"武侠":"52",
					"奇幻":"53",
					"玄幻":"54",
					"竞技":"55",
					"魔幻":"56",
					"科幻":"57",
					"恋爱":"58",
					"历史":"73",
					"战斗":"74",
					"搞笑":"75",
					"神魔":"76",
					"战争":"97",
					"古风":"111",
					"少女":"112",
					"萝莉":"113",
					"治愈":"114",
					"日常":"115",
					"歌舞":"116",
					"偶像":"120",
					"职场":"123",
					"仙侠":"125"
				},
				"label16": {
					"全部":"0",
					"冒险":"77",
					"热血":"78",
					"奇幻":"79",
					"恋爱":"80",
					"校园":"81",
					"后宫":"82",
					"搞笑":"83",
					"青春":"84",
					"百合":"85",
					"治愈":"86",
					"神魔":"87",
					"魔法":"88",
					"推理":"89",
					"科幻":"90",
					"竞技":"91",
					"悬疑":"92",
					"战争":"93",
					"萝莉":"94",
					"魔幻":"95",
					"战斗":"96",
					"历史":"102",
					"歌舞":"103",
					"恐怖":"105",
					"职场":"106",
					"励志":"110",
					"偶像":"117",
					"职场":"124",
				},
				"year": ["全部","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003","2002","2001","2000"],
				"order": {
					"时间排序": "time",
					"人气排序": "hits",
					"评分排序": "score",
				},
			},
			"动漫": {
				"新番连载":["1","label1","year","order"],
				"完结日漫":["3","label3","year","order"],
				"热门国漫":["4","label3","year","order"],
				"剧场动漫":["16","label16","year","order"],
			}
		},
		
		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Edg/120.0.0.0",
		}
	});
}
const defaultBaseUrl = "http://www.dmd77.com";
/**
 * 发布页
 * https://rentry.org/dmd8
 * http://www.dmand5.com
 */

function UpdateBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("https://rentry.org/dmd8");
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
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/index.php?m=vod-search@post->wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".list_3 > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('a > h5').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('p > font:nth-child(2)').text(),

				//封面网址
				coverUrl: element.selectFirst('img').absUrl('src'),
				
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
	var result = [];
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/vod-list-id-${region}-pg-1-order--by-${order}-class-${label}-year-${year}-letter--area--lang-.html`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".book-li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.book-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('span > font').text(),

				//封面网址
				coverUrl: element.selectFirst('.book-cover').absUrl('src'),
				
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
			name: document.selectFirst('#book-cont > h1').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('#wrap').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#book-cont > img').absUrl('data-original'),
			
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
	const tagElements = document.select('.arconix-toggle-title');
	
	//目录元素选择器
	const catalogElements= document.select('.arconix-toggle-content');
	
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
			name: tagElements.get(i).text(),
			//章节
			chapters: newChapters
		});
	}
	return newCatalogs
}