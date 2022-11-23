function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1651504696,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "39漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/39漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/39漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/39漫画.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/39漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/39漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/39漫画.js",
		},
		
		//更新时间
		updateTime: "2022年9月4日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://m.manhua39.com",
		
		//发现
		findList: {
			"完结": "http://m.manhua39.com/list/wanjie/",
			"都市": "http://m.manhua39.com/list/dushi/",
			"后宫": "http://m.manhua39.com/list/hougong/",
			"穿越": "http://m.manhua39.com/list/chuanyue/"
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
	var url = 'http://m.manhua39.com/search/?keywords=' + encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'#update_list > div > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div.itemTxt > a').text(),
			
			//概览
			summary : jsoup(data,'a.coll').text(),
			
			//封面
			cover : jsoup(data,'div.itemImg > a > mip-img').attr('src'),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'div.itemTxt > a').attr('href'))
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
	const list = jsoupArray(response,'.list-comic').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a.txtA').text(),
			
			//概览
			summary : jsoup(data,'span.info').text(),
			
			//封面
			cover : jsoup(data,'mip-img').attr('src'),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'a.ImgA').attr('href'))
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
		title : jsoup(response,'h1.title').text(),
		
		//作者
		author: jsoup(response,'div.comic-view.clearfix > div.view-sub.autoHeight > div > dl:nth-child(3) > dd').text(),
		
		//日期
		date : jsoup(response,'dl:nth-child(5) > dd').text(),
		
		//概览
		summary: jsoup(response,'div.comic-view.clearfix > p').text(),

		//封面
		cover : jsoup(response,'div.img > mip-img').attr('src'),

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
	const tabs = jsoupArray(response,'#list_block > div > div.title1').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'div.comic-chapters').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'div.comic-chapters > div  > ul  > li').outerHtml();
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			newchapters.push({
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节网址
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href').replace('.html','-${p}.html@zero->1@start->1'))
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsoup(tabs[i],'h3').text(),
			//章节
			chapter : newchapters
			});
	}
	return new_catalogs
}

/**
 * 内容（部分漫画搜索源通用规则）
 * @version 2022/09/26
 * 168,思思，39 , 360 , 147 , 动漫画 ，依依
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	var imgList =  jsoupArray(response,'mip-link > img:not([style=display: none;])').attr('src');
	if(imgList.length < 1){
		imgList = jsoupArray(response,'div.UnderPag > mip-img').attr('src');
	}
	if(imgList.length < 1){
		imgList = jsoupArray(response,'div.erPag > mip-img').attr('src');
	}
	if(imgList.length < 1){
	    imgList =  jsoupArray(response,'mip-link > mip-img:not([style=display: none;])').attr('src');
	}
	if(imgList.length < 1){
		imgList = jsoupArray(response,'div:not([style]) > mip-link > mip-img:not([style],[width])').attr('src');
	}
	if(imgList.length < 1){
		imgList = jsoupArray(response,'mip-link > mip-img').attr('src');
	}
	for(var i = 0;i < imgList.length;i++){
		var re = /default|cover|\/manhua\//i;
		if(re.test(imgList[i])){
			return null;
		}
	}
	return JSON.stringify(imgList);
}