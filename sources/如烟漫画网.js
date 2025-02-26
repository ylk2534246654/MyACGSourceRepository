function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1740570359,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,
		
		//优先级 1~100，数值越大越靠前
		priority: 50,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "如烟漫画网",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/如烟漫画网.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/如烟漫画网.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/如烟漫画网.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1740570359,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,

		/*内容加载选项
		contentLoadingOptionList: {
			pageMode: 1,
			pageModeReverseOrder: false,
		},
		*/
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		},
	});
}
const baseUrl = "https://www.ruyanmh.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/search?types=comic&keyword='+ encodeURI(key));
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select(".alllist > dt");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.text').text(),
				
				//概览
				//summary: ,
				
				//封面网址
				coverUrl: element.selectFirst('a > img').absUrl('src'),
				
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
		var document = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: document.selectFirst('.bookname').text(),
			
			//作者
			author: document.selectFirst('.shuxin > dl:nth-child(1) > dd:nth-child(1)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.shuxin > dl:nth-child(2) > dd:nth-child(2)').text(),
			
			//概览
			summary: document.selectFirst('.ms[style]').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.img > img').absUrl('src'),
			
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
	var newChapters= [];
	
	//章节元素选择器
	var chapterElements = document.select('#ul_chapter1 > li');
    for (var i = 0;i < chapterElements.size();i++) {
        var chapterElement = chapterElements.get(i);
        newChapters.push({
            //章节名称
            name: chapterElement.text(),

            //章节网址
            url: chapterElement.selectFirst('a').absUrl('href')
        });
    }
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters: newChapters
	}];
}

/**
 * 内容
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		//漫画列表代码
		eval(`
            var picTree = JSON.parse('${JavaUtils.substring(response.body().string(), "JSON.parse('", "'")}')
        `);
        
		return JSON.stringify(picTree);
	}
	return null;
}