function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1731236040,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "网飞猫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/网飞猫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/网飞猫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/网飞猫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1732432038,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫","影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}
const baseUrl = "https://www.ncat1.app";
/**
 * https://www.nca21.com
 * https://www.nca22.com
 * https://www.nca23.com
 * https://www.kkys01.com
 * https://www.kkys02.com
 * https://www.kkys03.com
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search?os=pc&k=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".search-result-list > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.title:not(:containsOwn(数据支持))').text(),
				
				//最后章节名称
				//lastChapterName: element.selectFirst('').text(),
				
				//概览
				summary: element.selectFirst('.desc').text(),

				//封面网址
				coverUrl: JavaUtils.urlJoin("https://vres.jxlfl.cn",element.selectFirst('.search-result-item-pic > [title]').attr('data-original')),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
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
			name: document.selectFirst('.detail-title > strong:not(:containsOwn(𝕔))').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.detail-desc > p').text(),
	
			//封面网址
			//coverUrl: document.selectFirst('.detail-pic > img').absUrl('data-src'),
			
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
	const tagElements = document.select('.swiper-wrapper > .source-swiper-slide');
	
	//目录元素选择器
	const catalogElements= document.select('.episode-box-main > .episode-list');
	
	//创建目录数组
	var newCatalogs = [];
	
	for (var i = 0;i < tagElements.size();i++) {
		var tag = tagElements.get(i).selectFirst('a > span:not(:containsOwn(提供))').text();
		if(tag.indexOf("高峰不卡") != -1){
			continue;
		}
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('.episode-list > a');
		
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
			name: tag,
			//章节
			chapters: newChapters
		});
	}
	return newCatalogs
}
/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	//浏览器请求结果处理
	//hpttnp2dj2t8\.xyz|kdjb\.xyz|afwefdsa\.xyz
	var re = new RegExp(
		//https://
		'^[a-zA-z]+://[^\\s/]+\.xyz','i'
	);
	if(!re.test(url)){
		return url;
	}
	return null;
}