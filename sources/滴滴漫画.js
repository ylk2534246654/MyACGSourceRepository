function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660913240,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,
		
		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "滴滴漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/滴滴漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/滴滴漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/滴滴漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703407068,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}
const baseUrl = "http://www.txydd.com";
const imgBaseUrl = "http://ima.qdjljy.com";
const header = '@header->User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.54';

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/api/front/index/search@post->key=' + encodeURI(key) + header);
	const response = HttpRequest(url);
	var result = [];
	if(response.code() == 200){
		const $ = JSON.parse(response.html());
		if($.code != 1){//此处和七夕漫画相似
			$.data.forEach((child) => {
				result.push({
					//标题
					name: child.name,
			
					//概览
					summary: child.content,
			
					//封面网址
					coverUrl: ToolUtil.urlJoin(imgBaseUrl,child.banner_cover),
			
					//网址
					url: ToolUtil.urlJoin(url,child.info_url)
				})
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
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		return JSON.stringify({
			//标题
			name: document.selectFirst('.content > .title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.desc-tag').text(),

			//封面网址
			//coverUrl: document.selectFirst('').absUrl('src'),
			
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
	//创建目录数组
	var newTocs = [];
	
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
	newTocs.push({
		//目录名称
		name: '目录',
		//章节
		chapters: newChapters
	});
	return newTocs
}
/**
 * 内容
 * @param {string} url
 * @return {string} content
 */
function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		var imgs = document.select('#img-box > div');
		var newImgs= [];
		for (var ci=0;ci<imgs.size();ci++) {
			var imgElement = imgs.get(ci);
			var src = imgElement.selectFirst('img').absUrl('src')
			newImgs.push(src.replace('images.qdjljy.com/','') + '@header->Referer:@header->user-agent:');
		}
		
		return JSON.stringify(newImgs);
	}
	return null;
}