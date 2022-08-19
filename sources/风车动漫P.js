function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660803657,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 70,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "风车动漫P",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/风车动漫P.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/风车动漫P.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/风车动漫P.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/风车动漫P.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/风车动漫P.js",
		},
		
		//更新时间
		updateTime: "2022年8月18日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://m.dm530p.cc",//备份：https://m.dm530p.info/ ，和樱花动漫P同一模板
		
		//发现
		findList: {
			"每日推荐": "https://m.dm530p.cc/recommend/",
			"最近更新": "https://m.dm530p.cc/list/?region=%E6%97%A5%E6%9C%AC",
			"剧场版": "https://m.dm530p.cc/list/?region=%E6%97%A5%E6%9C%AC&genre=%E5%89%A7%E5%9C%BA%E7%89%88",
			"完结": "https://m.dm530p.cc/list/?region=%E6%97%A5%E6%9C%AC&status=%E5%AE%8C%E7%BB%93"
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
	var url = 'https://m.dm530p.cc/s_all?ex=1&kw='+ encodeURI(key) + header;
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
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'a.itemtext').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 发现
 * @params string url
 * @returns {[{title, summary, cover, url}]}
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
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'a.itemtext').attr('href'))
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
		title : jsoup(response,'div:nth-child(2) > div > h1').text(),
		
		//作者
		author: jsoup(response,'div.info-sub > p:nth-child(1)').text(),
		
		//概览
		summary: jsoup(response,'div.info').text(),

		//封面
		cover :  ToolUtil.urlJoin(url,jsoup(response,'div.show > img').attr('src')),
		
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
 * @returns {[{tag, chapter:{[{name, url}]}}]}
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
 * @returns {string} content
 */
function content(url) {
	//浏览器请求结果处理，路漫漫，风车动漫P，樱花动漫P 相似
	//var re = /kme.whpfl.cn|knr.qjxys.cn|hft.ofooe.cn/i;
	var re = /[a-z]+:\/\/[a-z]*.[a-z]*.[a-z]*\/[a-z]\/\d/i;
	//(https:\/\/.*\..*\..*/.*/.*)
	//https:\/\/knr.qjxys.cn/j\/142610
	//https:\/\/kme.whpfl.cn/k\/151964
	//https:\/\/hft.ofooe.cn/j\/142625
	//这种格式均为广告
	if(!re.test(url)){
		return url;
	}
	return null;
}