function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660658044,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "漫岛动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/漫岛动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/漫岛动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/漫岛动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703913935,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"region": {
					"日本": "1",
					"国产": "2",
					"欧美": "3",
				},
				"label": ["全部","热血","科幻","悬疑","战斗","恋爱","冒险","少女","后宫","校园","搞笑","奇幻","治愈","神魔","竞技","运动","机战","日常","励志","百合","耽美","剧情"],
				"year": ["全部","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","更早"],
				"order": {
					"时间排序": "time",
					"人气排序": "hit",
				},
			},
			"动漫": ["region","label","year","order"]
		},
	});
}
const baseUrl = "https://www.mddm.tv";
/**
 * https://www.mandao.tv
 * https://www.mddm.tv
 * https://www.cosdao.com
 * 站长 mddmlianxi@hotmail.com, dmlianxi#hotmail.com
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search.php@post->searchword=' + encodeURI(key));
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
				coverUrl: element.selectFirst('div.img > img').absUrl('data-original'),
				
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
function find(region, label, year, order) {
	if(label == "全部")label = "";
	if(year == "全部")year = "";
	
	var url = JavaUtils.urlJoin(baseUrl, `/search.php?searchtype=5&order=${order}&tid=${region}&jq=${label}&year=${year}`);
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
				
				//概览
				summary: element.selectFirst('.bz').text(),
				
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
			coverUrl: document.selectFirst('.pic > img').absUrl('src'),
			
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