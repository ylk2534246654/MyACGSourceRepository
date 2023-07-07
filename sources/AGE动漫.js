function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714123,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230428,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 80,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "AGE动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/AGE动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/AGE动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/AGE动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/AGE动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/AGE动漫.js",
		},
		
		//更新时间
		updateTime: "2023年7月7日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//备用http://age.tv
		
		//发现
		findList: {
			"最近更新": "/catalog/all-all-all-all-all-time-1-%E6%97%A5%E6%9C%AC-all-all",
			"最近完结": "/catalog/all-all-all-all-all-time-1-%E6%97%A5%E6%9C%AC-all-%E5%AE%8C%E7%BB%93",
			"剧场版": "/catalog/%E5%89%A7%E5%9C%BA%E7%89%88-all-all-all-all-time-1-%E6%97%A5%E6%9C%AC-all-all",
			"每日推荐": {
				"url": "/recommend",
				"function": "find2"
			},
			"每日推荐": {
				"url": "/recommend",
				"function": "find2"
			}
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			//"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}
const baseUrl = "https://www.agemys.org";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search?&query=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#cata_video_list > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-title').text(),
				
				//概览
				summary: element.selectFirst('div.video_cover > div > span').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.video_cover > div > a > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.card-title > a').absUrl('href')
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
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("#cata_video_list > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-title').text(),
				
				//概览
				summary: element.selectFirst('div.video_cover > div > span').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.video_cover > div > a > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.card-title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现2
 * @param {string} url
 * @return {[{name, summary, coverUrl, url}]}
 */
function find2(url) {
	var url = JavaUtils.urlJoin(baseUrl, url);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.video_item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.video_item-title > a').text(),
				
				//概览
				summary: element.selectFirst('.video_item--image > span').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.video_item--image > img').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.video_item-title > a').absUrl('href')
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
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('.video_detail_title').text(),
			
			//作者
			author: document.selectFirst('li:nth-child(5) > span.detail_imform_value').text(),
			
			//更新时间
			update: document.selectFirst('li:nth-child(7) > span.detail_imform_value').text(),
			
			//概览
			summary: document.selectFirst('div.video_detail_desc').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.video_detail_cover > img').absUrl('data-original'),
			
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
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录标签元素选择器
	const tagElements = document.select('.nav-item');
	
	//目录元素选择器
	const catalogElements= document.select('.tab-pane');
	
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
			name: tagElements.get(i).selectFirst('li').text(),
			//章节
			chapters : newChapters
		});
	}
	return newCatalogs;
}

