function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654517761,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 70,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "嘛咪嘛咪",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/嘛咪嘛咪.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/嘛咪嘛咪.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/嘛咪嘛咪.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/嘛咪嘛咪.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/嘛咪嘛咪.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： 0：链接处理并浏览器访问{url}，1：链接处理{url}，2：浏览器拦截请求{url}，3：浏览器拦截框架{html}
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: "https://www.malimali5.com",//https://www.malimali.com
		
		
		//发现
		findList: {
			"国漫": "https://www.dmdm2020.com/dongmantype/21.html",
			"最近更新": "https://www.dmdm2020.com/dongmanshow/20/by/time.html",
			"热门": "https://www.dmdm2020.com/dongmanshow/20/by/hits.html",
			"完结": "https://www.dmdm2020.com/dongmanshow/20/area/%E5%B7%B2%E5%AE%8C%E7%BB%93.html",
			"校园": "https://www.dmdm2020.com/dongmanshow/20/class/%E6%A0%A1%E5%9B%AD.html",
			"百合": "https://www.dmdm2020.com/dongmanshow/20/class/%E7%99%BE%E5%90%88.html"
		},
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.malimali5.com/vodsearch/-------------.html?wd='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'li.search.list').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'.title').text(),
			
			//概览
			summary : jsoup(data,'span.so-imgTag_rb').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'img.item-lazy').attr('data-echo')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'.title').attr('href'))
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
	const list = jsoupArray(response,'div.drama-data > div:nth-child(1) > label.intro').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'.title').text(),
			
			//概览
			summary : jsoup(data,'div.drama-data > div:nth-child(5) > label.intro').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'div.infobox > div > img').attr('src')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'.title > a').attr('href'))
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
		author: jsoup(response,'div.drama-data > div:nth-child(1) > label.intro').text(),
		
		//概览
		summary: jsoup(response,'div.drama-data > div:nth-child(5) > label.intro').text(),

		//封面
		cover : jsoup(response,'div.infobox > div > img').attr('src'),
		
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
	const playlist = jsoupArray(response,'div.playlist').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i = 0;i<playlist.length;i++) {
	    var catalog = playlist[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'div > ul > li').outerHtml();
		
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
			tag: '线路 ' + (i + 1),
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
	var re = /\.png|\.jpg|\.svg|\.ico|\.gif|\.webp|\.jpeg/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}