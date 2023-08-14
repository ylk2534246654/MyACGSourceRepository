function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654757510,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230811,

		//优先级 1~100，数值越大越靠前
		priority: 1,//加载速度慢，经常无法连接
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "Fantuan",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Fantuan.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Fantuan.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Fantuan.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Fantuan.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/Fantuan.js",
		},
		
		//更新时间
		updateTime: "2023年8月11日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//备份
		
		//发现
		findList: {
			"动漫": {
				"最近更新": "/index.php/label/recent.html",
				"剧场版":"/index.php/label/topmovie.html"
			}
		},
	});
}
const baseUrl = getBaseUrl();
/**
 * https://acgfantuan.com
 * 
 * 导航：https://fantuantv.com
 */
function getBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("https://fantuantv.com");
		var edit = preference.edit();
		if(response.code() == 200){
			const document = response.body().cssDocument();
			var _baseUrl = document.selectFirst(".enter > a,.enter_address > a").absUrl('href');
			JavaUtils.log("baseUrl -> " + _baseUrl);
			edit.putString("baseUrl", _baseUrl);//更新基础网址
		}
		edit.putLong("baseUrlTime", time).apply();//更新时间
	}
	return preference.getString("baseUrl", "https://acgfta.com");
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/index.php/vod/search.html?wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".anime-card");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.stretched-link').text(),
				
				//概览
				summary: element.selectFirst('.semibold').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.anime-cover').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.stretched-link').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(url) {
	var url = JavaUtils.urlJoin(baseUrl, url);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".anime-card");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.stretched-link').text(),
				
				//概览
				summary: element.selectFirst('.semibold').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.anime-cover').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.stretched-link').absUrl('href')
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
			name: document.selectFirst('.detail-anime-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//更新时间
			update: document.selectFirst('.detail-anime-info > p:nth-child(1)').text(),
			
			//概览
			summary: document.selectFirst('.detail-anime-intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.anime-cover').absUrl('data-src'),
			
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
	const tagElements = document.select('.nav-pills > li');
	
	//目录元素选择器
	const tocElements = document.select('.anime-episode');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('a');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}