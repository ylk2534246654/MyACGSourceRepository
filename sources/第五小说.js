function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1678969628,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 70,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "第五小说",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新链接
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/第五小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/第五小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/第五小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/第五小说.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695365277,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"label": {
					"玄幻": "1",
					"武侠": "2",
					"都市": "3",
					"穿越": "4",
					"网游": "5",
					"科幻": "6"
				},
			},
			"小说": "label",
		},
	});
}

const baseUrl = "https://m.diwxs.net";
//备份：m.diwuxs.com,m.diwxs.net

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/search.php?keyword=${encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".list1 > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('p:nth-child(4) > a').text(),

				//作者
				author: element.selectFirst('.author > a:nth-child(2)').text(),
				
				//网址
				url: element.selectFirst('a[href]').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(label) {
	var url = JavaUtils.urlJoin(baseUrl, `/xclass/${label}/1.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("#main > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.title').text(),
				
				//作者
				author: element.selectFirst('.detail > p > a:nth-child(2)').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('.score').text(),

				//概览
				summary: element.selectFirst('.review').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.lazy').absUrl('src'),
				
				//网址
				url: element.selectFirst('div.detail > a').absUrl('href')
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
			name: document.selectFirst('.title').text(),
			
			//作者
			author: document.selectFirst('.author > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('#book_detail > li:nth-child(4)').text(),
			
			//概览
			summary: document.selectFirst('.review').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#thumb > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document.selectFirst('.recommend > h2:nth-child(3) > a').absUrl('href'))
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();

        //目录元素选择器
        const tocElements= document.select('#chapterlist > p > a:not([style])');
        
        //创建章节数组
        var newChapters = [];
            
        //章节元素选择器
        var chapterElements = tocElements.select('a');
        
        for (var i2 = 0;i2 < chapterElements.size();i2++) {
            var chapterElement = chapterElements.get(i2);
            
            newChapters.push({
                //章节名称
                name: chapterElement.selectFirst('a').text(),
                //章节网址
                url: chapterElement.selectFirst('a').absUrl('href').replace('.html','_{1}.html')
            });
        }
		return [{
			//目录名称
			name: '目录',
			//章节
			chapters: newChapters
		}]
    }
}

/**
 * 获取内容下一页网址（测试）
 * @returns {string} content
 */
function contentNextPageUrl() {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
        return document.select('#pt_next').absUrl('href');
    }
    return null;
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
        return document.select('#chaptercontent > :matchText').outerHtml();
    }
    return null;
}