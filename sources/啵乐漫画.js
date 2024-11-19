function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670670509,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 10,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "啵乐漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/啵乐漫画.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/啵乐漫画.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/啵乐漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1713245520,
		
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
				"region": ["全部","百合","热血","灵异","搞笑","校园","恐怖","悬疑","纯爱","玄幻","穿越","总裁","都市","古风","恋爱","耽美"],
			},
			"漫画": ["region"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

const baseUrl = "http://www.bolebl.com";
/**
 * http://www.6k6.cc
 * http://www.bolebl.com
 * 导航：http://www.404ms.top
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search?keyword=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".acgn-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.acgn-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.acgn-desc').text(),

				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				//summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img').attr('style').match(/\url\(['|](.*?)['|]\)/)[1],
				
				//网址
				url: element.selectFirst('.acgn-thumbnail').absUrl('href')
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
	var url = JavaUtils.urlJoin(baseUrl, `/sort?cate=${label}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".acgn-item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.acgn-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.acgn-desc').text(),

				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				//summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img').attr('style').match(/\url\(['|](.*?)['|]\)/)[1],
				
				//网址
				url: element.selectFirst('.acgn-thumbnail').absUrl('href')
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
			name: document.selectFirst('div.content > h1').text(),
			
			//作者
			author: document.selectFirst('div.content > p > span:nth-child(4)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.update').text(),
			
			//概览
			summary: document.selectFirst('.desc-content').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.detail-cover > img').attr('style').match(/\url\(['|](.*?)['|]\)/)[1],
			
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
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('.chapter-list > li');
	
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
 * @param {string} url
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var imgList = [];
		var imgElements = document.select('img[referrerpolicy]');
		for (var i2 = 0;i2 < imgElements.size();i2++) {
			var imgElement = imgElements.get(i2);
			imgList.push(imgElement.attr('src'));
		}
		return JSON.stringify(imgList);
	}
}