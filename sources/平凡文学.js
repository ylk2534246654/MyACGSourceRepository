function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670508350,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "平凡文学",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/平凡文学.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/平凡文学.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/平凡文学.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695218158,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"仙侠": "1",
					"玄幻": "2",
					"历史": "3",
					"都市": "4",
					"科幻": "5",
					"网游": "6",
					"其他": "7",
				}
			},
			"小说": ["label"]
		},
	});
}

const baseUrl = "http://www.pfwx.com";
//备份：http://www.pksge.info,http://www.pksge.org

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/modules/article/search.php?searchkey=${encodeURI(key)}&searchtype=articlename`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".tutui");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('h2 > a').text(),
				
				//作者
				author: element.selectFirst('h3:matchText').text(),

				//最后章节名称
				lastChapterName: element.selectFirst('h3 > a').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.tutuiImg > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('h2 > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(label) {
	var url = JavaUtils.urlJoin(baseUrl, `/pf${label}/1.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("tr.odd");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('td:nth-child(2) > a').text(),

				//作者
				author: element.selectFirst('td:nth-child(4)').text(),

				//最后章节名称
				lastChapterName: element.selectFirst('td:nth-child(3) > a').text(),
				
				//最近更新时间
				lastUpdateTime: document.selectFirst('td:nth-child(5)').text(),
				
				//网址
				url: element.selectFirst('td:nth-child(2) > a').absUrl('href')
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
			name: document.selectFirst('.jieshaokaishi > h1').text(),
			
			//作者
			author: document.selectFirst('.jieshaokaishi > h2:nth-child(3)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.jieshaokaishi > h2:nth-child(4)').text(),
			
			//概览
			summary: document.selectFirst('.jieshaokaishi > h3').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.jieshaoTu > img').absUrl('src'),
			
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
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('.zhangjiekaishi > ul > li');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
	}
	return [{
		//目录名称
		name: '目录',
		//章节
		chapters : newChapters
	}];
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const booktext = document.select(`#booktext:not(:matches(${baseUrl}))`).outerHtml();
		return String(booktext).replace(new RegExp('(?=★)(.+)(?=朋友吧！)','g'),'').replace('朋友吧！','');
	}
}