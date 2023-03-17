function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652592780,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230317,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "ESJ Zone",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ESJZone.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ESJZone.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ESJZone.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/ESJZone.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ESJZone.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/ESJZone.js",
		},
		
		//更新时间
		updateTime: "2023年3月17日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["小说","轻小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//如果失效建议贴吧搜索最新网址
	});
}
const baseUrl = "https://www.esjzone.me";
/**
 * 网站记录
 * www.esjzone.net
 */
const header = '';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/tags/' + encodeURI(key) + header);
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select("div > div.row > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('h5.card-title > a').text(),
				
				//概览
				summary: element.selectFirst('div.card-ep').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.main-img > div').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('h5.card-title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @return {[{title, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		return JSON.stringify({
			//标题
			title: document.selectFirst('div.book-detail > h2.text-normal').text(),
			
			//作者
			author: document.selectFirst('ul.book-detail > li:nth-child(2) > a').text(),
			
			//日期
			update: document.selectFirst('ul.book-detail > li:nth-child(3) > :matchText').text(),
			
			//概览
			summary: document.selectFirst('div.description').text(),

			//封面网址
			coverUrl: document.selectFirst('div.product-gallery > a > img').absUrl('src'),
			
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
	var chapterElements = document.select('#chapterList > p,#chapterList > a');
		
	var group = '';//分组记录
	for (var ci = 0;ci < chapterElements.size(); ci++) {
		var chapterElement = chapterElements.get(ci);
		
		var aElement = chapterElement.selectFirst('a').text();
		if(String(aElement).length > 0){
			newChapters.push({
				//章节名称
				name: group + chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
				//url: chapterElement.selectFirst('a').absUrl('href').replace('.html','_${p}.html') + '@zero->1@start->1'
			});
		}else{
			group = chapterElement.selectFirst(':matchText').text() + ' ';
		}
	}
	return [{
		//目录名称
		tag: '目录',
		//章节
		chapter : newChapters
	}];
}

/**
 * 内容
 * @return {string} content
 */
function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		return response.document().selectFirst('.forum-content,#content').outerHtml();
	}
	return null;
}