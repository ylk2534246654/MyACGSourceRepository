function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1655214571,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 0,//资源大部分无法播放，考虑列为失效搜索源
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "哔咪动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 6,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔咪动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哔咪动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哔咪动漫.js",
		},
		
		//更新时间
		updateTime: "2023年3月18日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		groupName: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			"最近更新": ToolUtils.urlJoin(baseUrl,"/type/riman/")
		},
	});
}
const baseUrl = "http://bimiacg4.net";//http://bimiacg.one/
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/vod/search/@post->wd='+ encodeURI(key) + header);
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select("ul.tab-cont > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('div.info > a').text(),
				
				//概览
				summary: element.selectFirst('div.info > p').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img.lazy').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div.info > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @param string url
 * @return {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var result = [];
		var document = response.document();
		var elements = document.select("ul.tab-cont > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('div.info > a').text(),
				
				//概览
				summary: element.selectFirst('div.info > p').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img.lazy').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div.info > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{title, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url+ header);
	if(response.code() == 200){
		var document = response.document();
		return JSON.stringify({
			//标题
			title: document.selectFirst('div.tit > h1').text(),
			
			//作者
			author: document.selectFirst('div.txt_intro_con > ul > li:nth-child(4) > storng > a').text(),
			
			//日期
			date: document.selectFirst('div.txt_intro_con > ul > li:nth-child(10) > :matchText').text(),
			
			//概览
			summary: document.selectFirst('li.li_intro > p:nth-child(3)').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.v_pic > img.lazy').absUrl('src'),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	const tagElements = document.select('.play_source_tab > a');
	
	//目录元素选择器
	const tocElements= document.select('.player_list');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('a').text(),
			//章节
			chapters: newChapters
		});
	}
	return newTocs
}

/**
 * 内容(InterceptRequest)
 * @return {string} content
 */
function content(url) {
	if(url.length > 500){
		return null;
	}
	//浏览器请求结果处理
	var re = /sohu|hm\.|\.gov|\.qq|\.alpha|\.xyz|cpv|360buyimg|suning|knmer|qqmail_head|adInnovationResource|[a-z]+:\/\/[\w.]+\/[a-z]{1}\/[a-z]{1}\?|WASE\/[\w-]+\/\w+/i;
	
	//https://api.simi0000.com/s/a?_=000000000000000000
	//https://d.xxxxxxx.xyz/WASE/Z-13289-G-227/ODqpbVmd4324097374 # WASE\/[\w-]\/\w

	if(!re.test(url)){
		return url;
	}
	return null;
}