function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1651504057,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 20,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "36漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/36漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/36漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/36漫画.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/36漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/36漫画.js"
		},
		
		//更新时间
		updateTime: "2022年6月15日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问{url}，1：对链接处理{url}，2：对内部浏览器拦截的请求处理{url}，3：对内部浏览器拦截的框架处理{html}
		contentType: 1,
		
		//自定义标签
		tag: ["漫画"],
		
		//@NonNull 详情界面的基本网址
		baseUrl: "http://m.36man.cc",
		
		//发现
		findList: {
			"完结": "http://m.36man.cc/list/wanjie/",
			"后宫": "http://m.36man.cc/list/hougong/",
			"穿越": "http://m.36man.cc/list/chuanyue/"
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
	var url = 'http://m.36man.cc/search/?keywords=' + encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'.se-list> div > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a.pic > div > h3').text(),
			
			//概览
			summary : jsoup(data,'a.tool').text(),
			
			//封面
			cover : jsoup(data,'a.pic > img').attr('src'),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'a.pic').attr('href'))
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
	const list = jsoupArray(response,'.se-list> div > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a.pic > div > h3').text(),
			
			//概览
			summary : jsoup(data,'a.tool').text(),
			
			//封面
			cover : jsoup(data,'a.pic > img').attr('src'),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'a.pic').attr('href'))
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
		//标题
		title : jsoup(response,'div.pic > div > h3').text(),
		
		//作者
		author: jsoup(response,'div.pic > div > p:nth-child(2) > a').text(),
		
		//日期
		date : jsoup(response,'div.pic > div > p:nth-child(6) > a').text(),
		
		//概览
		summary: jsoup(response,'#detail_block > div > p').text(),

		//封面
		cover : jsoup(response,'#cover_pic').attr('src'),
		
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
 * @returns {tag, chapter:{[{group, name, url}]}}
 */
function catalog(response,url) {
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
	
	//章节代码
	var chapters = jsoupArray(response,'.chapter-body > ul > li').outerHtml();
	
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
		tag: "目录",
		//章节
		chapter : newchapters
		});
	return new_catalogs
}

/**
 * 内容
 * @params {string} url
 * @returns {[{url}]}
 */
function content(url) {
	const response = httpRequest(url+ header);
	var chapterImages = '';
	var chapterImageHost = '';
	var pageImage = '';
	var chapterPath = '';
	
	eval(ToolUtil.substring(response,'<script>;','</script>'));
	if(chapterImageHost.length < 1){
		chapterImageHost = pageImage;
	}
	const urlPath = ToolUtil.urlJoin(chapterImageHost,'/' + chapterPath);
	for(var i = 0;i < chapterImages.length;i++){
		chapterImages[i] = ToolUtil.urlJoin(urlPath,chapterImages[i]);
	}
	return JSON.stringify(chapterImages);
}
