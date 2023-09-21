function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1675957115,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "红牛资源站",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/红牛资源站.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/红牛资源站.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/红牛资源站.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/红牛资源站.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695275855,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["影视","动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"type": {
					"动漫": "ICCCCS",
					"综艺": "xCCCCS",
					"连续剧": "qCCCCS",
					"电影": "SCCCCS",
				},
			},
			"动漫": ["type"],
		},
	});
}
const baseUrl = "https://hongniuziyuan.com";
//备份：hongniuziyuan.com、www.hongniuzy.com

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
		var elements = document.select(".xing_vb > ul:gt(0):not([style])");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.xing_vb4 > a > :matchText').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('em').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('.xing_vb7').text(),

				//结果分组（实验性）
				group: element.selectFirst('.xing_vb5').text(),
				
				//概览
				summary: element.selectFirst('.desc > :matchText').text(),
				
				//网址
				url: element.selectFirst('.xing_vb4 > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(type) {
	var url = JavaUtils.urlJoin(baseUrl, `/index.php/vod/type/id/${type}.html?ac=detail`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".xing_vb > ul");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.xing_vb4 > a > :matchText').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('em').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('.xing_vb7').text(),

				//结果分组（实验性）
				group: element.selectFirst('.xing_vb5').text(),
				
				//概览
				summary: element.selectFirst('.desc > :matchText').text(),
				
				//网址
				url: element.selectFirst('.xing_vb4 > a').absUrl('href')
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
			name: document.selectFirst('.vodh > h2').text(),
			
			//作者
			author: document.selectFirst('.vodinfobox > ul > li:nth-child(2) > span').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.vodinfobox > ul > li:nth-child(8) > span').text(),
			
			//概览
			summary: document.selectFirst('.playBox > div.vodplayinfo').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.vodImg > img').absUrl('src'),
			
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
	const tocElements = document.select('.vodplayinfo > div > div');
	
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
				name: chapterElement.selectFirst('a').attr('title'),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newTocs.push({
			//目录名称
			name: "线路 " + (i + 1),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}