function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652949783,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230428,

		//编译版本
		compileVersion: JavaUtils.JS_VERSION_1_7,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 50,//加载速度慢
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "包子漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 10,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/包子漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/包子漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
		},
		
		//更新时间
		updateTime: "2023年4月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentProcessType: 1,

		/*内容加载选项
		contentLoadingOptionList: {
			pageMode: 1,
			pageModeReverseOrder: false,
		},
		*/
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			"推荐": "/classify",
		},
		
		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}
const baseUrl = "https://cn.baozimh.com";
/**
 * 备用
 * https://cn.baozimh.com
 * https://cn.webmota.com
 * https://cn.kukuc.co
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/search?q='+ encodeURI(key));
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select("div.search > div.pure-g > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.comics-card__title').text(),
				
				//概览
				summary: element.selectFirst('small.tags').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a > amp-img').absUrl('src'),
				
				//网址
				url: element.selectFirst('a.text-decoration-none').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @param {string} url
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(url) {
	var url = JavaUtils.urlJoin(baseUrl, url);
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select(".classify-items > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.comics-card__title').text(),
				
				//概览
				summary: element.selectFirst('small.tags').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a.text-decoration-none > amp-img').absUrl('src'),
				
				//网址
				url: element.selectFirst('a.text-decoration-none').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: document.selectFirst('h1.comics-detail__title').text(),
			
			//作者
			author: document.selectFirst('h2.comics-detail__author').text(),
			
			//更新时间
			//update: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('div.l-content > div > div > div > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.l-content > div > div > amp-img').absUrl('data-media'),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
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
	var newChapters= [];
	
	//章节元素选择器
	var chapterElements = document.select('#chapter-items > div,#chapters_other_list > div');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		var aElement = chapterElement.selectFirst('a');
		var href = aElement.absUrl('href');
		newChapters.push({
			//章节名称
			name: aElement.text(),

			//章节网址
			url: 'https://cn.webmota.com/comic/chapter/' + JavaUtils.substring(href,'comic_id=','&') + '/0_' + JavaUtils.substring(href + '&','chapter_slot=','&') + '_{1}.html'
		});
	}
	if(newChapters.length < 1){//最新章节
		chapterElements = document.select('.comics-chapters');
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			var aElement = chapterElement.selectFirst('a');
			var href = aElement.absUrl('href');
			newChapters.push({
				//章节名称
				name: aElement.text(),

				//章节网址
				url: 'https://cn.webmota.com/comic/chapter/' + JavaUtils.substring(href,'comic_id=','&') + '/0_' + JavaUtils.substring(href + '&','chapter_slot=','&') + '_{1}.html'
			});
		}
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
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		//创建漫画数组
		var result = [];
		//漫画列表代码
		var document = response.body().cssDocument();
		var contentElements = document.select('[[src]],.comic-contain__item');
		for (var i2 = 0;i2 < contentElements.size();i2++) {
			var contentElement = contentElements.get(i2);

			var imageWidth = contentElement.selectFirst('[width]').attr('width');
			var imageHeight = contentElement.selectFirst('[height]').attr('height');

			var imageElement = contentElement.selectFirst('[src]');
			if(imageElement != null){
				result.push(imageElement.absUrl('src') + '@imageWidth->' + imageWidth + '@imageHeight->' + imageHeight);
			}
		}
		return JSON.stringify(result);
	}
	return null;
}