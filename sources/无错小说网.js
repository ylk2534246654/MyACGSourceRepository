function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1679808678,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "无错小说网",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/无错小说网.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/无错小说网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/无错小说网.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/无错小说网.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695374379,
		
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
					"女生": '1',
					"玄幻": '2',
					"奇幻": '3',
					"武侠": '4',
					"仙侠": '5',
					"都市": '6',
					"历史": '7',
					"军事": '8',
					"游戏": '9',
					"科幻": '10',
					"其他": '11'
				}
			},
			"小说": ["label"]
		},
		
		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				regexUrl: "/search",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				maxRequests: 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				period: 3100,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

const baseUrl = "https://www.wucuoxs.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/api/search?q=' + encodeURI(key));
	const response = JavaUtils.httpRequest(url);
	var result = [];
	if(response.code() == 200){
		const $ = JSON.parse(response.html());
		$.data.search.forEach((child) => {
			result.push({
				//标题
				name: child.book_name,
		
				//作者
				author: child.author,
		
				//最后章节名称
				lastChapterName: child.latest_chapter_name,

				//最近更新时间
				lastUpdateTime: child.uptime,

				//封面网址
				coverUrl: JavaUtils.urlJoin(url, child.cover),
		
				//网址
				url: JavaUtils.urlJoin(url, child.book_detail_url),
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(label) {
	url = JavaUtils.urlJoin(baseUrl, `/sort-${label}-1/`);
	const response = JavaUtils.httpRequest(url);
	var result = [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("table > tbody > tr:gt(0)");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				name: element.selectFirst('td:nth-child(1) > a[target="_blank"]').text(),
				
				//概览
				summary: element.selectFirst('td:nth-child(3)').text(),
				
				//封面网址
				//coverUrl: element.selectFirst('').absUrl('src'),
				
				//网址
				url: element.selectFirst('td:nth-child(1) > a[title]').absUrl('href')
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
			//name: document.selectFirst('').text(),
			
			//作者
			author: document.selectFirst('tbody > tr:nth-child(1) > td:nth-child(4)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('tbody > tr:nth-child(2) > td:nth-child(6)').text(),
			
			//概览
			summary: document.selectFirst('#content > dd > p:not([class],[style])').text(),
	
			//封面网址
			coverUrl: document.selectFirst('a.hst > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录网址/非外链无需使用
			tocs: tocs(document.selectFirst('p.btnlinks > a.read').absUrl('href'))
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		//创建章节数组
		var newChapters= [];
		
		//章节元素选择器
		var chapterElements = document.select('tbody > tr > td');
		
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
			name: "目录",
			//章节
			chapters: newChapters
		}];
	}
	return null;
}

/**
 * 内容
 * @returns {string} content
*/
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return document.select('#htmlContent').outerHtml();
	}
	return null;
}