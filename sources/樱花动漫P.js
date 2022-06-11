function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652947579,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "樱花动漫P",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/樱花动漫P.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/樱花动漫P.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/樱花动漫P.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/樱花动漫P.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/樱花动漫P.js",
		},
		
		//更新时间
		updateTime: "2022年6月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： 0：链接处理并浏览器访问{url}，1：链接处理{url}，2：浏览器拦截请求{url}，3：浏览器拦截框架{html}
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: "https://m.yhdmp.live",//备份https://www.yhdmp.net/
		
		//发现
		findList: {
			"每日推荐": "https://m.yhdmp.live/recommend/",
			"最近更新": "https://m.yhdmp.live/list/?region=%E6%97%A5%E6%9C%AC",
			"剧场版": "https://m.yhdmp.live/list/?region=%E6%97%A5%E6%9C%AC&genre=%E5%89%A7%E5%9C%BA%E7%89%88",
			"完结": "https://m.yhdmp.live/list/?region=%E6%97%A5%E6%9C%AC&status=%E5%AE%8C%E7%BB%93"
		},
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://m.yhdmp.live/s_all?ex=1&kw='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'div.list > ul > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a.itemtext').text(),
			
			//概览
			summary : jsoup(data,'div.itemimgtext').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,ToolUtil.substring(jsoup(data,'div.imgblock').attr('style'),'\'','\'')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'a.itemtext').attr('href'))
			});
	}
	return JSON.stringify(array);
}

/**
 * 发现
 * @params string html
 * @returns {[{title, introduction, cover, url}]}
 */
function find(url) {
	const response = httpRequest(url + header);
	//目录标签代码
	const list = jsoupArray(response,'div.list > ul > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a.itemtext').text(),
			
			//概览
			summary : jsoup(data,'div:nth-child(7) > span.cell_imform_value').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,ToolUtil.substring(jsoup(data,'div.imgblock').attr('style'),'\'','\'')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'a.itemtext').attr('href'))
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
		author: jsoup(response,'div.info-sub > p:nth-child(1)').text(),
		
		//概览
		summary: jsoup(response,'div.info').text(),

		//封面
		cover : jsoup(response,'div.show > img').attr('src'),
		
		//目录是否倒序
		reverseOrder: false,
		
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
	const tabs = jsoupArray(response,'#menu0 > li').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'#main0 > div.movurl').outerHtml();
	
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
			
			newchapters.push({
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节链接
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsoup(tabs[i],'li').text(),
			//章节
			chapter : newchapters
			});
	}
	return new_catalogs
}

/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {[{url}]}
 */
function content(url) {
	//浏览器请求结果处理
	var re = /yhbsk|viplp|tianvip|yangshengzu|mtyrvc|studylabs|hongmao|cslpf|mmstat|\.png|\.jpg|\.svg|\.ico|\.webp|\.jpeg/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}