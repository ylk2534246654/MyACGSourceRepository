function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652592780,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "ESJ Zone",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ESJZone.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ESJZone.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ESJZone.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/ESJZone.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ESJZone.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/ESJZone.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["小说","轻小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.esjzone.net",//如果失效建议贴吧搜索最新网址
	});
}

const header = '';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.esjzone.net/tags/'+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'div > div.row > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'h5.card-title > a').text(),
			
			//概览
			summary : jsoup(data,'div.card-ep').text(),
			
			//封面
			cover : jsoup(data,'div.main-img > div').attr('data-src'),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'h5.card-title > a').attr('href'))
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
		title : jsoup(response,'div.book-detail > h2.text-normal').text(),
		
		//作者
		author: jsoup(response,'ul.book-detail > li:nth-child(2) > a').text(),
		
		//日期
		date : jsoup(response,'ul.book-detail > li:nth-child(3) > :matchText').text(),
		
		//概览
		summary: jsoup(response,'div.description').text(),

		//封面
		cover : jsoup(response,'div.product-gallery > a > img').attr('src'),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录网址/非外链无需使用
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
	var chapters = jsoupArray(response,'#chapterList > p,#chapterList > a').outerHtml();
		
	var group;//分组记录
	for (var ci=0;ci<chapters.length;ci++) {
		var chapter = chapters[ci];
		
		if(!(chapter.indexOf('href')!=-1)){
			group = jsoup(chapter,':matchText').text();
		}else{
			var name;
			if(group != null){
				name = group + ' ' + jsoup(chapter,'a').text()
			}else{
				name = jsoup(chapter,'a').text();
			}
			newchapters.push({
				//章节名称
				name: name,
				//章节网址
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
			});
		}
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
	const content = jsoup(response,'.forum-content,#content').outerHtml();
	return content;
}

