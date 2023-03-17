function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654507793,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230317,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 20,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "哔哩轻小说",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔哩轻小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔哩轻小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔哩轻小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔哩轻小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哔哩轻小说.js",
		},
		
		//更新时间
		updateTime: "2023年3月17日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		groupName: ["轻小说","小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}
const baseUrl = "https://www.linovelib.com";
const header = '@header->user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.7';

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 * @return {boolean} 返回结果
 */
function isEnabledAuthenticator(url, responseHtml) {
	//对框架进行拦截，检索关键字，
	if(responseHtml.length > 1 && responseHtml.indexOf('检查站点连接是否安全') != -1){
		return true;
	}
	return false;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/S6/@post->searchkey=' + encodeURI(key) + '&searchtype=all' + header);
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		if(response.html().indexOf('开始阅读') != -1){
			result.push({
				//标题
				title : document.selectFirst(".book-name").text(),
				
				//概览
				summary : document.selectFirst("div.book-dec > p").text(),
				
				//封面网址
				cover : document.selectFirst("div.book-img > img").absUrl('src'),
				
				//网址
				url : document.selectFirst("[property='og:url']").absUrl('content')
			});
			return JSON.stringify(result);
		}
		var elements = document.select(".search-result-list");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('.tit').text(),
				
				//概览
				summary: element.selectFirst('div > p').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.tit > a').absUrl('href')
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
			title : document.selectFirst('.book-name').text(),
			
			//作者
			author: document.selectFirst('div.au-name > a').text(),
			
			//日期
			date: document.selectFirst('div.nums > span:nth-child(1)').text(),
			
			//概览
			summary: document.selectFirst('div.book-dec > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.book-img > img').absUrl('src'),
			
			//目录是否倒序
			isReverseOrder: false,
			
			//目录网址/非外链无需使用
			tocs: tocs(document.selectFirst('div.book-info > div.btn-group > a.btn.read-btn').absUrl('href'))
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
		var newTocs= [];
		
		//章节元素选择器
		var chapterElements = document.select('ul.chapter-list > div,ul.chapter-list > li');
		
		var group = '';//分组记录
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			var aElement = chapterElement.selectFirst('a').text();
			if(String(aElement).length > 0){
				newTocs.push({
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
			name: "目录",
			//章节
			chapters: newTocs
		}];
	}
	return null;
}

/**
 * 内容
 * @returns {string} content

function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		return document.select('#TextContent,#acontent').outerHtml();
	}
	return null;
} */