function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654843272,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "多多漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/多多漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/多多漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/多多漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695367053,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}

const baseUrl = "https://m.duoximh.com/";
//备用：m.duoduomh.com,m.zuimh.com

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search/?keywords=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#update_list > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.itemTxt > a').text(),

				//作者
				author: element.selectFirst('.itemTxt > p:nth-child(2)').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('a.coll').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('.date').text(),

				//封面网址
				coverUrl: element.selectFirst('mip-img').absUrl('src'),
				
				//网址
				url: element.selectFirst('div.itemTxt > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('#comicName,.title').text(),
			
			//作者
			author: document.selectFirst('div.sub_r > p:nth-child(1),div.view-sub > div > dl:nth-child(3) > dd').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('span.date,.clearfix > div.view-sub > div > dl:nth-child(5) > dd').text(),
			
			//概览
			summary: document.selectFirst('p.txtDesc#full-des,.txtDesc').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#Cover > img,#Cover > mip-img').absUrl('src'),
			
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
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	const tagElements = document.select('.caption,.title1');
	
	//目录元素选择器
	const tocElements= document.select('div.chapter-warp,.comic-chapters');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			var name = chapterElement.selectFirst('a').text();
			if(name.indexOf("下拉式阅读") == -1){
				newChapters.push({
					//章节名称
					name: name,
					//章节网址
					url: chapterElement.selectFirst('a').absUrl('href').replace('.html','-{1}.html')
				});
			}
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('.Title,h3').text(),
			//章节
			chapters: newChapters
		});
	}
	return newTocs
}

/**
 * 内容（部分漫画搜索源通用规则）
 * @version 2024/1/16
 * 168,思思，39 , 360 , 147 , 动漫画 ，依依 ，多多漫画
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
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
#scroll-image > div > [data-src],\
.chapter-content > div > a > img');
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
	return null;
}