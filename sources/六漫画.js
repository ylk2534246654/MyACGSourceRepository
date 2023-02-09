function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652779713,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "六漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/六漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/六漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/六漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/六漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/六漫画.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//备份网址sixmh7.com，sixmh6.com，6mh9.com，6mh66.com，此源和七夕漫画相似
	});
}
const baseUrl = "http://m.6mh66.com";
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/search?keyword=' + encodeURI(key) + header);
	const response = httpRequest(url);
	
	var result = [];
    var document = org.jsoup.Jsoup.parse(response,url);
    var elements = document.select("#__layout > div > div > div.search-result > ul > a");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('div > h2').text(),
			
			//概览
			summary: element.selectFirst('div > p:nth-child(5)').text(),
			
			//封面网址
			coverUrl: element.selectFirst('li > img').absUrl('src'),
			
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
	const response = httpRequest(url + header);
    var document = org.jsoup.Jsoup.parse(response,url);
	return JSON.stringify({
		//标题
		title: document.selectFirst('.cartoon-title').text(),
		
		//作者
		author: document.selectFirst('p.author').text(),
		
		//日期
		//date: document.selectFirst('').text(),
		
		//概览
		summary: document.selectFirst('p.introduction').text(),

		//封面网址
		//coverUrl: document.selectFirst('').absUrl('content'),
		
		//目录是否倒序
		isReverseOrder: true,
		
		//目录加载
		catalogs: catalogs(document,url)
	});
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(document,url) {
	//目录元素选择器
	const catalogElements= document.select('dl.cartoon-directory');
	
	//创建目录数组
	var newCatalogs = [];
	
	for (var i = 0;i < catalogElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('div.chapter-list > a');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		
		var vidElement = document.selectFirst('#__layout > div > dl.cartoon-directory.chalist2 > dd');
		if(vidElement != null){
			var catalog_response = httpRequest(ToolUtil.urlJoin(baseUrl,'/bookchapter/') + '@post->id=' + vidElement.attr('data-id') + '&id2=' + vidElement.attr('data-vid') + header);
			JSON.parse(catalog_response).forEach((child) => {
				newChapters.push({
					//章节名称
					name: child.chaptername,
					//章节网址
					url: ToolUtil.urlJoin(url,child.chapterid) + '.html'
				});
			});
		}
		
		newCatalogs.push({
			//目录名称
			name: '目录 ' + (1 + i),
			//章节
			chapters : newChapters
		});
	}
	return newCatalogs;
}
/**
 * 内容
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	eval(ToolUtil.substring(response,'<script type=\"text/javascript\">','</script>'));
	for(var i = 0;i < newImgs.length;i++){
		newImgs[i] = newImgs[i].concat('@header->Referer:');
	}
	return JSON.stringify(newImgs);
}