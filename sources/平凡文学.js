function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670508350,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "平凡文学",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/平凡文学.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/平凡文学.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/平凡文学.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/平凡文学.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/平凡文学.js",
		},
		
		//更新时间
		updateTime: "2022年12月8日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://www.pfwx.com",
	});
}

const header = '';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'http://www.pfwx.com/modules/article/search.php?searchkey=' + encodeURI(key) + '&searchtype=articlename' + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'.tutui').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'h2 > a').text(),
			
			//概览
			summary : jsoup(data,'h3:matchText').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'.tutuiImg > a > img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'h2 > a').attr('href'))
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
		title : jsoup(response,'.jieshaokaishi > h1').text(),
		
		//作者
		author: jsoup(response,'.jieshaokaishi > h2:nth-child(3)').text(),
		
		//日期
		//date : jsoup(response,'li.col-xs-4:nth-child(4)').text(),
		
		//概览
		summary: jsoup(response,'.jieshaokaishi > h3').text(),

		//封面
		cover : ToolUtil.urlJoin(url,jsoup(response,'.jieshaoTu > img').attr('src')),
		
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
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
		
	//章节代码
	var chapters = jsoupArray(response,'.zhangjiekaishi > ul > li').outerHtml();
	
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
		tag: '目录',
		//章节
		chapter : newchapters
	});
	return new_catalogs;
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	const booktext = jsoup(response,'#booktext').outerHtml();
	return booktext.replace(new RegExp('(?=★)(.+)(?=朋友吧！)','g'),'').replace('朋友吧！','');
}

