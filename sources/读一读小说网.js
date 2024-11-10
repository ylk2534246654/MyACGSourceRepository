function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670506310,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "读一读小说网",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/读一读小说网.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/读一读小说网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/读一读小说网.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1694705301,
		
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
					"玄幻": "xuanhuanxiaoshuo",
					"修真": "xiuzhenxiaoshuo",
					"都市": "dushixiaoshuo",
					"穿越": "chuanyuexiaoshuo",
					"网游": "wangyouxiaoshuo",
					"科幻": "kehuanxiaoshuo",
					"言情": "yanqingxiaoshuo",
					"同人": "tongrenxiaoshuo",
				}
			},
			"小说": ["label"]
		},
	});
}

const baseUrl = "http://www.b520.cc";
//备用：duyidu.net、du1du.org

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/modules/article/search.php?searchkey=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("tbody > tr:not([align=center])");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('td:nth-child(1)').text(),

				//作者
				author: element.selectFirst('td:nth-child(3)').text(),

				//最后章节名称
				lastChapterName: element.selectFirst('td:nth-child(2)').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('td:nth-child(5)').text(),
				
				//封面网址
				//coverUrl: element.selectFirst('').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('td:nth-child(1) > a').absUrl('href')
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
	var url = JavaUtils.urlJoin(baseUrl, `/${label}/`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".ll > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('dt > span').text(),

				//作者
				author: element.selectFirst('dt > a').text(),

				//概览
				summary: element.selectFirst('dl > dd').text(),

				//封面网址
				coverUrl: element.selectFirst('.image > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.image > a').absUrl('href')
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
			//名称
			name: document.selectFirst('meta[property="og:title"]').attr('content'),
			
			//作者
			author: document.selectFirst('meta[property="og:novel:author"]').attr('content'),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('#info > p:nth-child(5)').text(),
			
			//概览
			summary: document.selectFirst('#intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('meta[property="og:image"]').absUrl('content'),
			
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
	var newChapters= [];
	
	//章节元素选择器
	var chapterElements = document.select('#list> dl > dd+dt ~dd');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		newChapters.push({
            //章节名称
            name: chapterElement.text(),
            //章节网址
            url: chapterElement.selectFirst('a').absUrl('href')
        });
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters: newChapters
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
		return document.select(`#content:not(:matches(唐三中文网|${baseUrl}))`).outerHtml();
	}
	return null;
}