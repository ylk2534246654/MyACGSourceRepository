function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654760124,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "天使动漫",//天使动漫，酷动漫

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/天使动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/天使动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/天使动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/天使动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/天使动漫.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://www.sbdm.net",
		//导航页：http://www.kudm.vip/
		//同布局备份：http://tv.kudm.net/
		//备份：https://www.gqdm.net/ ，http://ysjdm.net/

		//发现
		findList: {
			"动漫": {
				"最近更新": "https://www.sbdm.net/index.php/map/index.html"
			}
		},
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var result = [];

	var url = 'http://www.sbdm.net/search.asp@post->searchword=' + ToolUtil.encodeURI(key,'gb2312') + '&submit=%CB%D1%CB%F7' + header;
	var response = httpRequest(url);
	var document = org.jsoup.Jsoup.parse(response,url);
	var elements = document.select("div.movie-chrList > ul > li");
	if(elements.size() > 0){
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('div.cover > a > img').attr('alt'),
				
				//概览
				summary: element.selectFirst('div.intro > em:nth-child(4)').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.cover > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('div.intro > h6 > a').absUrl('href')
			});
		}
	}else{
		var url = 'http://www.sbdm.net/index.php/vod/search.html?wd=' + encodeURI(key) + header;
		var response = httpRequest(url);
		var document = org.jsoup.Jsoup.parse(response,url);
		var elements = document.select(".searchlist_item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('.vodlist_title > a > :matchText').text(),
				
				//概览
				summary: element.selectFirst('.pic_text').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.vodlist_thumb').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.vodlist_thumb').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @params string url
 * @returns {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	const response = httpRequest(url + header);
	
	var result = [];
    var document = org.jsoup.Jsoup.parse(response,url);
    var elements = document.select(".ranklist_item");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('.title').text(),
			
			//概览
			summary: element.selectFirst('p > .vodlist_sub').text(),
			
			//封面网址
			coverUrl: element.selectFirst('.ranklist_thumb').absUrl('data-original'),
			
			//网址
			url: element.selectFirst('a').absUrl('href')
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @returns {[{title, author, date, summary, coverUrl, isReverseOrder, catalogs:{[{name, chapters:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
    var document = org.jsoup.Jsoup.parse(response,url);
	try{
		return JSON.stringify({
			//标题
			title: document.selectFirst('div.m-info > div.mtext > ul > li:nth-child(1) > h1').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//日期
			//date: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('div.m-intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.m-info > div > img').absUrl('src'),
			
			//目录是否倒序
			isReverseOrder: false,
			
			//目录加载
			catalogs: catalogs(document)
		});
	}catch(error){
		return JSON.stringify({
			//标题
			title: document.selectFirst('h2.title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//日期
			//date: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.content_desc > span').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.content_thumb.fl > a').absUrl('data-original'),
			
			//目录是否倒序
			isReverseOrder: false,
			
			//目录加载
			catalogs: catalogs(document)
		});
	}
}
/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(document) {
	//创建目录数组
	var newCatalogs = [];
	
	//目录元素选择器
	var catalogElements= document.select('div.playurl');
	if(catalogElements.size() > 0){
		for (var i = 0;i < catalogElements.size();i++) {
			//创建章节数组
			var newChapters = [];
			
			//章节元素选择器
			var chapterElements = catalogElements.get(i).select('ul > ul > li > ul > li');
			
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
				name: '线路 '+ (i + 1),
				//章节
				chapters: newChapters
			});
		}
	}else{
		//目录元素选择器
		var catalogElements = document.select('.playlist_full > .content_playlist');
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
				name: '线路 '+ (i + 1),
				//章节
				chapters: newChapters
			});
		}
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
	var re = /aqours|yangshengzu|\.png|\.jpg|\.svg|\.ico|\.gif|\.webp|\.jpeg/i;
	if(!re.test(url)){
		return url;
	}
	return null;
} 