function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1679808678,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230317,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 20,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "无错小说网",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/无错小说网.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/无错小说网.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/无错小说网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/无错小说网.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/无错小说网.js",
		},
		
		//更新时间
		updateTime: "2023年3月26日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		groupName: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			"女生": '/sort-1-1/',
			"玄幻": '/sort-2-1/',
			"奇幻": '/sort-3-1/',
			"武侠": '/sort-4-1/',
			"仙侠": '/sort-5-1/',
			"都市": '/sort-6-1/',
			"历史": '/sort-7-1/',
			"军事": '/sort-8-1/',
			"游戏": '/sort-9-1/',
			"科幻": '/sort-10-1/',
			"完结": '/quanben/',
			"排行": '/top-allvisit/',
		},
	});
}
const baseUrl = "https://www.wucuoxs.com";
const header = '@header->user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.7';

/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/api/search?q=' + encodeURI(key) + header);
	const response = HttpRequest(url);
	var result = [];
	if(response.code() == 200){
		const $ = JSON.parse(response.html());
		$.data.search.forEach((child) => {
			result.push({
				//标题
				title: child.book_name,
		
				//概览
				summary: child.author,
		
				//封面网址
				coverUrl: ToolUtils.urlJoin(url, child.cover),
		
				//网址
				url: ToolUtils.urlJoin(url, child.book_detail_url),
			});
		});
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @param string url
 * @return {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	url = ToolUtils.urlJoin(baseUrl, url + header);
	const response = HttpRequest(url);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select("table > tbody > tr:gt(0)");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('td:nth-child(1) > a[target="_blank"]').text(),
				
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
 * @return {[{title, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		return JSON.stringify({
			//标题
			//title : document.selectFirst('').text(),
			
			//作者
			author: document.selectFirst('tbody > tr:nth-child(1) > td:nth-child(4)').text(),
			
			//日期
			date: document.selectFirst('tbody > tr:nth-child(2) > td:nth-child(6)').text(),
			
			//概览
			summary: document.selectFirst('#content > dd > p:not([class],[style])').text(),
	
			//封面网址
			coverUrl: document.selectFirst('a.hst > img').absUrl('src'),
			
			//目录是否倒序
			isReverseOrder: false,
			
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
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
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
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		return document.select('#htmlContent').outerHtml();
	}
	return null;
}