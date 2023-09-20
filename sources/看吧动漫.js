function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654762700,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 70,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "看吧动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/看吧动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/看吧动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/看吧动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/看吧动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695211139,
		
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
					"日本": "21",
					"欧美": "22",
				},
				"label": ["全部","搞笑","经典","热血","催泪","治愈","猎奇","励志","战斗","后宫","机战","恋爱","百合","科幻","奇幻","推理","校园","运动","魔法","历史","伪娘","美少女","萝莉","亲子","青春","冒险","竞技"],
				"year": ["全部","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003","2002","2001","2000","1999","1998"],
				"order": {
					"按时间": "time",
					"按人气": "hits",
					"按评分": "score",
				},
			},
			"动漫": ["region","label","year","order"],
		},
	});
}

const baseUrl = "https://www.qkan9.com";
//备用网址：https://eacg.net | https://my.cbox.ws/qkan8

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/index.php/vod/search.html?wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.fed-main-info > div > div > dl");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.fed-deta-content > h1').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.fed-list-remarks').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.fed-list-pics').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.fed-deta-content > h1 > a').absUrl('href')
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
	if(label == "全部"){
		label = "";
	}else{
		label = "class/" + label;
	}
	if(year == "全部"){
		year = "";
	}else{
		year = "year/" + year;
	}
	var url = JavaUtils.urlJoin(baseUrl, `/index.php/vod/show/by/${order}/${label}/id/${region}/${year}.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".fed-list-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.fed-list-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.fed-list-remarks').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.fed-list-pics').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.fed-list-pics').absUrl('href')
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
			name: document.selectFirst('h1.fed-part-eone > a').text(),
			
			//作者
			author: document.selectFirst('dd.fed-deta-content > ul > li:nth-child(2) > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('dd.fed-deta-content > ul > li:nth-child(6)').text(),
			
			//概览
			summary: document.selectFirst('div.fed-play-data > div > div > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('dt.fed-deta-images > a.fed-list-pics').absUrl('data-original'),
			
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
	const tagElements = document.select('div.fed-drop-info > div > ul > li');
	
	//目录元素选择器
	const tocElements = document.select('div.fed-play-item');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul:nth-child(2) > li');
		
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
 
function content(url) {
	//浏览器请求结果处理
	if(url.indexOf('kwimgs.com') != -1){
		return url;
	}else{
		var re = /\.png|\.jpg|\.svg|\.ico|\.gif|\.webp|\.jpeg/i;
		if(!re.test(url)){
			return url;
		}
	}
	return null;
}
*/