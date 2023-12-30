function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652608955,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,
		
		//优先级 1~100，数值越大越靠前
		priority: 10,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "jpm1234",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/jpm1234.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703913451,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"region": {
					"全部": "0",
					"日本": "1",
					"港台": "3",
					"欧美": "4",
					"国产": "5",
					"其它": "2"
				},
				"label": {
					"全部": "0",
					"冒险": "1",
					"搞笑": "2",
					"格斗": "3",
					"科幻": "4",
					"爱情": "5",
					"侦探": "6",
					"竞技": "7",
					"魔法": "8",
					"东方神鬼": "9",
					"校园": "10",
					"恐怖": "11",
					"四格": "12",
					"生活": "13",
					"亲情": "14",
					"百合": "15",
					"伪娘": "16",
					"悬疑": "17",
					"热血": "18",
					"后宫": "19",
					"历史": "20",
					"战争": "21",
					"萌系": "22",
					"宅男腐女": "23",
					"治愈": "24",
					"励志": "25",
					"武侠": "26",
					"机战": "27",
					"音乐舞蹈": "28",
					"美食": "29",
					"职场": "30",
					"西方魔幻": "31",
					"高清单行本": "32",
					"性转换": "33",
					"东方": "34",
					"扶她": "35",
					"魔幻": "36",
					"奇幻": "37",
					"节操": "38",
					"轻小说": "39",
					"颜艺": "40",
					"其他": "41"
				},
				"label2": {
					"全部": "0",
					"少女": "3",
					"少年": "1",
					"青年": "2"
				},
				"status": {
					"全部": "0","连载": "2","完结": "1"
				},
				"order": {
					"最新发布": "bid",
					"最新更新": "lastpost",
					"人气最旺": "click"
				}
			},
			"漫画": ["region", "label", "label2", "status", "order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const baseUrl = "http://www.jpm1234.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/Search/Keyword/' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#contList > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('p.ell > a').text(),
				
				//概览
				summary: element.selectFirst('span.tt').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('p.ell > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region, label, label2, status, order) {
	var url = JavaUtils.urlJoin(baseUrl, `/All/${label2}/${label}/0/${region}/${status}/${order}/`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("#contList > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('p.ell > a').text(),
				
				//概览
				summary: element.selectFirst('span.tt').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('p.ell > a').absUrl('href')
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
			name: document.selectFirst('.book-title > h1').text(),
			
			//作者
			author: document.selectFirst('ul.detail-list > li:nth-child(2) > span > a:nth-child(2)').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('#intro-all').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.book-cover > p > img').absUrl('src'),
			
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
	var chapterElements = document.select('div.chapter-list > ul > li');
	
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
		chapters: newChapters
	}]
}
/**
 * 内容
 * @param {string} url
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const html = String(response.body().string());
		var host = 'http://img4.jpm1234.com/uploads';
		eval('var cInfo' + JavaUtils.substring(html, 'var cInfo','</script>'));
		if(html.indexOf('configsa')!=-1){
			host = 'http://img2.jpm1234.com/uploads';
		};
		if(html.indexOf('configsb')!=-1){
			host = 'http://img3.jpm1234.com/uploads';
		};
		for(var i = 0;i < cInfo.fs.length;i++){
			cInfo.fs[i] = host + cInfo.fs[i];
		}
		return JSON.stringify(cInfo.fs);
	}
	return null;
}
