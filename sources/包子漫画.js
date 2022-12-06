function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652949783,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,//加载速度慢
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "包子漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/包子漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/包子漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
		},
		
		//更新时间
		updateTime: "2022年12月6日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://cn.baozimh.com",//https://cn.webmota.com/
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://cn.baozimh.com/search?q=' + encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'div.search > div.pure-g > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div.comics-card__title').text(),
			
			//概览
			summary : jsoup(data,'small.tags').text(),
			
			//封面
			cover : jsoup(data,'a > amp-img').attr('src'),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'a.text-decoration-none').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalog:{[{tag, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
	return JSON.stringify({
		//标题
		title: jsoup(response,'h1.comics-detail__title').text(),
		
		//作者
		author: jsoup(response,'h2.comics-detail__author').text(),
		
		//概览
		summary: jsoup(response,'div.l-content > div > div > div > p').text(),

		//封面
		cover : jsoup(response,'div.l-content > div > div > amp-img').attr('data-media'),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录加载
		catalog: catalog(response,url)
	})
}

/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {[{tag, chapter:{[{name, url}]}}]}
 */
function catalog(response,url) {
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
	
	//章节代码
	var chapters = jsoupArray(response,'#chapter-items > div,#chapters_other_list > div').outerHtml();
	
	for (var ci=0;ci<chapters.length;ci++) {
		var chapter = chapters[ci];
		
		newchapters.push({
			//章节名称
			name: jsoup(chapter,'a').text(),
			//章节网址
			url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
		});
	}
	if(newchapters.length < 1){//最新章节
		//章节代码
		var chapters2 = jsoupArray(response,'.comics-chapters').outerHtml();
		
		for (var ci = chapters2.length;ci > 0;ci--) {
			var chapter = chapters2[ci];
			
			newchapters.push({
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节网址
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
			});
		}
	}
	//添加目录
	new_catalogs.push({
		//目录名称
		tag: "目录",
		//章节
		chapter : newchapters
		});
	return new_catalogs
}
/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content

function content(url) {
	return url;
}
/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	//创建漫画数组
	var chapterImages= [];
	//漫画列表代码
	var contents = jsoupArray(response,'[[src]],.comic-contain__item').outerHtml();
	for (var ci=0;ci<contents.length;ci++) {
		var content = contents[ci];
		chapterImages.push(jsoup(content,'[src]').attr('src'));
	}
	return JSON.stringify(chapterImages);
}