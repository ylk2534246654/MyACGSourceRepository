function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652589052,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "EDD动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/EDD动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/EDD动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/EDD动漫.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/EDD动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/EDD动漫.js",
		},
		
		//更新时间
		updateTime: "2022年6月18日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问{url}，1：对链接处理{url}，2：对内部浏览器拦截的请求处理{url}，3：对内部浏览器拦截的框架处理{html}
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情界面的基本网址
		baseUrl: "https://www.hdddex.com",
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.hdddex.com/index.php?s=home-search-index.html@post->wd='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'#content > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		
		var info= jsoup(data,'ul.info').text();
		var title;
		if(info.indexOf('《') != -1 && info.indexOf('》') != -1){
			title = ToolUtil.substring(info,'《','》');
		}else{
			title = jsoup(data,'ul.info > li:nth-child(1) > span').text();
		}
		array.push({
			//标题
			title : title,
			
			//概览
			summary : jsoup(data,'ul.info > li:nth-child(12)').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'a.video-pic').attr('data-original')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'ul.info > li:nth-child(1) > a').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{author, summary, cover, upDate, reverseOrder, catalog}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
	return JSON.stringify({
		//作者
		author: jsoup(response,'div.drama-data > div:nth-child(1) > label').text(),
		
		//更新时间
		date: jsoup(response,'ul.info > li:nth-child(12) > :matchText').text(),
		
		//概览
		summary: jsoup(response,'span.details-content-default').text(),

		//封面
		cover : jsoup(response,'div.details-pic > img').attr('src'),
		
		//目录是否倒序
		reverseOrder: true,
		
		//目录链接/非外链无需使用
		catalog: catalog(response,url)
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {tag, chapter:{[{group, name, url}]}}
 */
function catalog(response,url) {
	//目录标签代码
	const tabs = jsoupArray(response,'ul.hidden-sm.nav-tabs> li:gt(0)').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'div.playlist > ul').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'ul > li').outerHtml();
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			var name = jsoup(chapter,'a').text();
			if(name.indexOf('迅雷') == -1){
				newchapters.push({
					//章节名称
					name: name,
					//章节链接
					url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
				});
			}
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsoup(tabs[i],'a').text(),
			//章节
			chapter : newchapters
			});
	}
	return new_catalogs
}

