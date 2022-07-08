function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652776303,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "二次元动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/二次元动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/二次元动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/二次元动漫.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/二次元动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/二次元动漫.js",
		},
		
		//更新时间
		updateTime: "2022年6月11日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.2animx.com",
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'http://www.2animx.com/search-index?&searchType=1&q=' + encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'ul.liemh.htmls.indliemh > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div[class=tit]').text(),
			
			//概览
			summary : jsoup(data,'a > em').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'a').attr('href'))
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
		title : jsoup(response,'div.main > div.position > strong').text(),
		
		//作者
		author: jsoup(response,'dl.mh-detail > dd > p:nth-child(1) > a').text(),
		
		//概览
		summary: jsoup(response,'div.mh-introduce > p:nth-child(3)').text(),

		//封面
		cover : ToolUtil.urlJoin(url,jsoup(response,'.mh-detail > dt > a >img').attr('src')),
		
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
	var chapters = jsoupArray(response,'#oneCon1 > ul > li').outerHtml();
	
	for (var ci=0;ci<chapters.length;ci++) {
		var chapter = chapters[ci];
		
		newchapters.push({
			//章节名称
			name: jsoup(chapter,'a').text(),
			//章节网址
			url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href') + '-p-${p}@zero->1@start->1' +  header)
		});
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
 * 内容
 * @params {string} url
 * @returns {string} content
 */
 function content(url) {
	const response = httpRequest(url + header);
	return JSON.stringify(jsoup(response,'img[id = ComicPic]').attr('src'));
}
/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content2(url) {//比较耗时的单线程解析方法
	var response = httpRequest(url + header);
	const endid = jsoup(response,'#total').attr('value');
	var obj= [];
	for(var i =1;i <= endid;i++){
		response = httpRequest(url + '-p-' + i + header);
		obj.push(jsoup(response,'img[id = ComicPic]').attr('src'));
	}
	return JSON.stringify(obj);
}