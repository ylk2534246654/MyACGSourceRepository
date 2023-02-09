function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1651484017,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "168漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 10,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/168漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/168漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/168漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/168漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/168漫画.js",
		},
		
		//更新时间
		updateTime: "2023年1月21日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//备用：https://m.quarkmanhua.com/ ，站长邮箱：wenqian4090tang@163.com
		
		//发现
		findList: {
			"完结漫画": "https://m.168manhua.com/list/wanjie/",
			"都市漫画": "https://m.168manhua.com/list/dushi/",
			"后宫漫画": "https://m.168manhua.com/list/hougong/",
			"穿越漫画": "https://m.168manhua.com/list/chuanyue/",
			"仙侠漫画": "https://m.168manhua.com/list/xianxia/"
		},
	});
}
const baseUrl = "https://m.168manhua.com";
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/search/?keywords=' + encodeURI(key) + header);
	const response = httpRequest(url);
	
	var result = [];
    var document = org.jsoup.Jsoup.parse(response,url);
    var elements = document.select("#update_list > div > div");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('div.itemTxt > a').text(),
			
			//概览
			summary: element.selectFirst('a.coll').text(),
			
			//封面网址
			coverUrl: element.selectFirst('div.itemImg > a > mip-img').absUrl('src'),
			
			//网址
			url: element.selectFirst('div.itemTxt > a').absUrl('href')
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @params {string} url
 * @returns {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	const response = httpRequest(url + header);
	
	var result= [];
    var document = org.jsoup.Jsoup.parse(response,url);
    var elements = document.select(".list-comic");
	for (var i = 0;i < elements.size();i++) {
	    var element = elements.get(i);
		result.push({
			//标题
			title: element.selectFirst('a.txtA').text(),
			
			//概览
			summary: element.selectFirst('span.info').text(),
			
			//封面网址
			coverUrl: element.selectFirst('mip-img').absUrl('src'),
			
			//网址
			url: element.selectFirst('a.ImgA').absUrl('href')
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @returns {[{title, author, date, summary, coverUrl, isReverseOrder, catalogs:{[{name, chapters:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url + header);
    var document = org.jsoup.Jsoup.parse(response,url);
	return JSON.stringify({
		//标题
		title: document.selectFirst('h1.title').text(),
		
		//作者
		author: document.selectFirst('div.comic-view.clearfix > div.view-sub.autoHeight > div > dl:nth-child(3) > dd').text(),
		
		//日期
		date: document.selectFirst('dl:nth-child(5) > dd').text(),
		
		//概览
		summary: document.selectFirst('div.comic-view.clearfix > p').text(),

		//封面网址
		coverUrl: document.selectFirst('div.img > mip-img').absUrl('src'),
		
		//目录是否倒序
		isReverseOrder: true,
		
		//目录加载
		catalogs: catalogs(document)
	})
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(document) {
	const tagElements = document.select('#list_block > div > div.title1');
	
	//目录元素选择器
	const catalogElements= document.select('div.comic-chapters');
	
	//创建目录数组
	var newCatalogs = [];
	
	for (var i = 0;i < catalogElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('div.comic-chapters > div  > ul  > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href').replace('.html','-${p}.html@zero->1@start->1')
			});
		}
		newCatalogs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('h3').text(),
			//章节
			chapters : newChapters
		});
	}
	return newCatalogs;
}


/**
 * 内容（部分漫画搜索源通用规则）
 * @version 2023/1/21
 * 168,思思，39 , 360 , 147 , 动漫画 ，依依
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
    var document = org.jsoup.Jsoup.parse(response,url);
	var imgList = [];
	
	var elements = document.select('\
mip-link > img:not([style=display: none;]),\
div.UnderPag > mip-img,\
div.erPag > mip-img,\
mip-link > mip-img:not([style=display: none;]),\
div:not([style]) > mip-link > mip-img:not([style],[width]),\
mip-link > mip-img,\
#image,\
#scroll-image > div > [src],\
#scroll-image > div > [data-src]');
	if(elements != null){
		for (var i = 0;i<elements.size();i++) {
			var element = elements.get(i);
			var src = element.absUrl('data-src');
			if(String(src).length <= 0){
				src = element.absUrl('src');
			}
			imgList.push(src);
		}
	}

	var newImgList = [];
	for(var i = 0;i < imgList.length;i++){
		var re = /default|cover|\.gif|\/manhua\//i;
		if(!re.test(imgList[i])){
			newImgList.push(imgList[i]);
		}
	}
	return JSON.stringify(newImgList);
}