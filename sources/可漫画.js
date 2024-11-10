function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1714369074,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,
		
		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "可漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/可漫画.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/可漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/可漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1714369074,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"label": {
					"热门": "hot",
					"最新": "new"
				}
			},
			"漫画": ["label"]
		}
	});
}

const baseUrl = "https://www.kemanga.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search/?q=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".content > div > .row > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.text-center').text(),

				//封面网址
				coverUrl: element.selectFirst('[data-src]').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
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
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/${label}/`));
	var result = [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".content > div > .row > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.text-center').text(),
                
				//封面网址
				coverUrl: element.selectFirst('[data-src]').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
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
			name: document.selectFirst('.h5').text(),
			
			//作者
			author: document.selectFirst('.author-content > a').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('p.tip > span:nth-child(3)').text(),
			
			//概览
			summary: document.selectFirst('.summary-content').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.comic_img > img').absUrl('data-src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
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
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('#chapter-list > div');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : newChapters
	}];
}

/**
 * 内容
 * @return {string} content
*/
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
        var elements = document.select("#app > div > div > img");
        var Number = extractChapterNumber(url)
        const response2 = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/chapter/${Number}.js`));
        if(response2.code() == 200){
            eval(String(JavaUtils.substring(response2.body().string(),'','let comicList')));
            var newImgs = [];
            for (let index = 0; index < elements.size(); index++) {
                newImgs.push(`${comic_url}/${path}/${chapter_name}/${index + 1}.webp`)
            }
            return JSON.stringify(newImgs);
        }
    }
	return null;
}
function extractChapterNumber(url) {  
    const regex = /.*\/chapter\/(\d+-\d+)\.html$/;  
    const match = url.match(regex);

    // 如果匹配成功，match[1] 将包含捕获组的内容  
    return match ? match[1] : null;  
  }
