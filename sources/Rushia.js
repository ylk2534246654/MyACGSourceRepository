function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652594943,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "Rushia",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Rushia.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Rushia.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Rushia.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/Rushia.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Rushia.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问{url}，1：对链接处理{url}，2：对内部浏览器拦截的请求处理{url}，3：对内部浏览器拦截的框架处理{html}
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情界面的基本网址
		baseUrl: "https://www.rushia.me",
		
		//发现
		findList: {
			"热门": "https://www.rushia.me/label/top/",
		},
		
		//登录授权是否启用
		auth: true,
		
		//登录授权链接
		authUrl:"https://www.rushia.me/user/login/@callback->个人中心",
		
		//需要授权的功能（search，detail，content，find）
		authRequired: ["content"],
		
	});
}

function auth() {
	const response = httpRequest("https://www.rushia.me");
	if(response.indexOf('个人中心') != -1){
		return true;
	}
	return false;
}

const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.rushia.me/vodsearch/-------------/?wd='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'article.post-list').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div.entry-title').text(),
			
			//概览
			summary : jsoup(data,'div.entry-summary').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'div.search-image > a > img').attr('src')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'div.entry-title > a').attr('href'))
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
	const list = jsoupArray(response,'ul.mod-list > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div.product-title').text(),
			
			//概览
			summary : jsoup(data,'div.product-desc').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'div.product-image > img').attr('data-url')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'a').attr('href'))
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
		title : jsoup(response,'.entry-title').text(),
		
		//作者
		//author: jsoup(response,'li:nth-child(5) > span.detail_imform_value').text(),
		
		//概览
		summary: jsoup(response,'div.entry-content > div > :matchText').text(),

		//封面
		cover : jsoup(response,'div.entry-content> div > div> div> img').attr('src'),
		
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
	//目录代码
	const boxs = jsoupArray(response,'div.play-pannel-box').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<boxs.length;i++) {
	    var catalog = boxs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'div.play-pannel-list > ul > li').outerHtml();
		
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
			tag: jsoup(boxs[i],'div.play-pannel_hd').text(),
			//章节
			chapter : newchapters
			});
	}
	return new_catalogs
}