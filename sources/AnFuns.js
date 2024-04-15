function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704335635,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 50,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "AnFuns",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/AnFuns.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/AnFuns.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/AnFuns.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704335635,
		
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
                    "新旧番剧": "1",
                    "蓝光无修": "2",
                    "剧场版": "3",
                },
				"region": ["全部","大陆","日本","欧美"],
				"label": ["全部","原创","搞笑","日常","运动","励志","热血","战斗","竞技","校园","青春","偶像","爱情","恋爱","冒险","后宫","百合","治愈","致郁","胃痛","萝莉","魔法","悬疑","猎奇","推理","奇幻","科幻","游戏","神魔","恐怖","血腥","机战","战争","犯罪","历史","社会","职场","剧情","伪娘","耽美","童年","教育","亲子","真人","歌舞","肉番","美少女","吸血鬼","女性向","漫画改","小说改","异世界","泡面番","欢乐向","游戏改","NTR"],
				"year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003","2002","2001","2000"],
				"order": {
					"时间排序": "time",
					"人气排序": "hits",
					"评分排序": "score",
				},
			},
			"动漫": ["genre","region","label","year","order"]
		},
	});
}
const baseUrl = "https://www.anfuns.cc";
/**
 * 
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
		var elements = document.select(".hl-list-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.hl-item-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.hl-pic-text').text(),
				
				//概览
				summary: element.selectFirst('.hl-item-sub.hl-lc-2').text(),

				//封面网址
				coverUrl: element.selectFirst('.hl-item-thumb').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.hl-item-thumb').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(genre, region, label, year, order) {
	if(region != "全部"){
        region = "/area/" + region
    }else{
        region = ""
    }
	if(year == "全部")year = "";
	if(label == "全部")label = "";
	var url = JavaUtils.urlJoin(baseUrl, `/show/${genre}-${label}--${year}${region}/by/${order}.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".hl-list-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.hl-item-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.hl-pic-text').text(),
				
				//概览
				summary: element.selectFirst('.hl-item-sub.hl-lc-2').text(),

				//封面网址
				coverUrl: element.selectFirst('.hl-item-thumb').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.hl-item-thumb').absUrl('href')
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
			name: document.selectFirst('.hl-dc-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.hl-content-text').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.content_thumb > .vodlist_thumb').absUrl('data-original'),
			
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
	const tagElements = document.select('.hl-tabs-btn');
	
	//目录元素选择器
	const catalogElements= document.select('.hl-plays-list');
	
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