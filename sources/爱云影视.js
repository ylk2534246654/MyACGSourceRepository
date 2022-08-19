function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660912704,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 25,//加载较慢
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "爱云影视",

		//搜索源作者
		author: "雨夏",
		
		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/爱云影视.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/爱云影视.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/爱云影视.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/爱云影视.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/爱云影视.js",
		},

		//更新时间
		updateTime: "2022年8月19日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		tag: ["动漫","影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.iyunys.com",
		//和cocoManga同为集云数据
	})
}
const setting = "@rateLimitHost->1:5000";
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.iyunys.com/search?type=1&searchString=' + encodeURI(key) + setting;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'div.fed-part-layout > dl').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'dd > h1').text(),
			
			//概览
			summary : jsoup(data,'.fed-list-remarks').text(),
			
			//封面
			cover : jsoup(data,'dt > a').attr('data-original') + '@header->Referer:https://www.cocomanga.com/',
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'dt > a').attr('href'))
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
	const response = httpRequest(url + setting);
	return JSON.stringify({
		//标题
		title : jsoup(response,'h1.fed-part-eone').text(),
		
		//作者
		author: jsoup(response,'dd > ul > li:nth-child(2) > a').text(),
		
		//更新时间
		date: jsoup(response,'dd > ul > li:nth-child(3) > a').text(),
		
		//概览
		summary: jsoup(response,'p.fed-part-both').text(),

		//封面
		cover: jsoup(response,'a.fed-list-pics:nth-last-child(1)').attr('data-original') + '@header->Referer:https://www.cocomanga.com/',
		
		//目录是否倒序
		reverseOrder: true,
		
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
	//目录标签代码
	const tabs = jsoupArray(response,'div.fed-tabs-info > div > div > div > ul > li').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'div.fed-tabs-item > div > div > div > ul').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'li').outerHtml();
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			newchapters.push({
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节网址
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href')) + setting
			});
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