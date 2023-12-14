function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660756417,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 70,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "哈哩哈哩",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哈哩哈哩.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哈哩哈哩.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哈哩哈哩.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哈哩哈哩.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1702564794,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫", "影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			"动漫": "/acg/",
			"电视剧": "/tv/",
			"电影": "/mov/",
			"综艺": "/zongyi/"
		},
	});
}
const baseUrl = 'https://m.feijisu36.com';
/**
 * buidng2.com
 * 
 * 备用：
 * 哈哩哈哩
 * s5.quelingfei.com:4438
 * halihali7.com
 * halihali1.com
 * halihali3.com
 * halihali5.com
 * halihali.icu
 * halihali.li
 * 站长联系方式：rosamondcurtis6028@gmail.com
 * 
 * 重定向-飞极速
 * http://m.feijisu21.com
 * 
 * 重定向-补丁动画
 * https://m.feijisu21.com
 * 
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = 'https://s5.quelingfei.com:4438/ssszz.php?top=10&q='+ encodeURI(key);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//最近更新时间
				lastUpdateTime: child.time,

				//概览
				summary: child.lianzaijs,
		
				//封面网址
				coverUrl: JavaUtils.urlJoin(url, child.thumb),
		
				//网址
				url: JavaUtils.urlJoin(url, child.url)
			})
		})
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(url) {
	var result = [];
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, url));
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("ul > li.mb");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.name').text(),
				
				//概览
				summary: element.selectFirst('.bz').text(),
				
				//封面网址
				coverUrl: element.selectFirst('img.lazy').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.li-hv').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
 function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: document.selectFirst('dt.name').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.des2').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.pic > img').absUrl('data-src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录标签元素选择器
	const tagElements = document.select('ul > li[id]');
	
	//目录元素选择器
	const catalogElements= document.select('.urlli > div > ul[id]');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < catalogElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = catalogElements.get(i).select('ul > li');
		
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
			name: tagElements.get(i).selectFirst('li').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

 /**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content
*/
function content(url) {
	//浏览器请求结果处理
	var re = /js\?ver/i;
	//广-告-代-码
	//https://halihali7.com/js/new-kk-27k.js?ver=556
	//https://halihali7.com/js/wap2-jm-daka.js?ver=121
	if(!re.test(url)){
		return url;
	}
	return null;
} 