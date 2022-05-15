function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652608955,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "jpm1234",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/jpm1234.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/jpm1234.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/jpm1234.js"
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： 0：链接处理并浏览器访问{url}，1：链接处理{url}，2：浏览器拦截请求{url}，3：浏览器拦截框架{html}
		contentType: 1,
		
		//自定义标签
		tag: ["漫画"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: "http://www.jpm1234.com",
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'http://www.jpm1234.com/Search/Keyword/' + encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'#contList > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'p.ell > a').text(),
			
			//概览
			summary : jsoup(data,'span.tt').text(),
			
			//封面
			cover : jsoup(data,'a > img').attr('data-src'),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'p.ell > a').attr('href'))
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
		author: jsoup(response,'ul.detail-list > li:nth-child(2) > span > a:nth-child(2)').text(),
		
		//概览
		summary: jsoup(response,'#intro-all').text(),

		//封面
		cover : jsoup(response,'div.book-cover > p > img').attr('src'),
		
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
 * @returns {tag, chapter:{[{group, name, url}]}}
 */
function catalog(response,url) {
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
	
	//章节代码
	var chapters = jsoupArray(response,'div.chapter-list > ul > li').outerHtml();
	
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
	var host = 'http://img4.jpm1234.com/uploads';
	eval('var cInfo'+ToolUtil.substring(response,'var cInfo','</script>'));
	if(response.indexOf('configsa')!=-1){
		host = 'http://img2.jpm1234.com/uploads';
	};
	if(response.indexOf('configsb')!=-1){
		host = 'http://img3.jpm1234.com/uploads';
	};
	for(var i = 0;i < cInfo.fs.length;i++){
		cInfo.fs[i] = host + cInfo.fs[i];
	}
	return JSON.stringify(cInfo.fs);
}
