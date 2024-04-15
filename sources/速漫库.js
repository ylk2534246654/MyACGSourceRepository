function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1697639709,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "速漫库",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/速漫库.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/速漫库.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/速漫库.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1697639709,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"label": {
					"热门榜": "1",
					"综合榜": "2",
					"火爆榜": "3",
					"新上架": "4",
					"最新榜": "5",
					"新作架": "6"
				}
			},
			"漫画": ["label"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/118.0.0.0"
		}
	});
}

const baseUrl = "http://m.sumanku.com";
//此源和七夕漫画、速漫库、酷漫屋、六漫画相似

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search?keyword=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("ul.mult-warp > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-text').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.abs-bottom').text(),
				
				//最近更新时间
				//lastUpdateTime: element.selectFirst('').text(),

				//概览
				//summary: element.selectFirst('').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.card-graph > img').absUrl('data-src'),
				
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
	var url = JavaUtils.urlJoin(baseUrl, `/top/${label}.html`);
	const response = JavaUtils.httpRequest(url);
	var result = [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("ul.mult-warp > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-text').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.abs-bottom').text(),
				
				//最近更新时间
				//lastUpdateTime: element.selectFirst('').text(),

				//概览
				//summary: element.selectFirst('').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.card-graph > img').absUrl('data-src'),
				
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
			name: document.selectFirst('.name').text(),
			
			//作者
			author: document.selectFirst('.author:nth-child(4)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.author:nth-child(6)').text(),
			
			//概览
			summary: document.selectFirst('.comic-detail > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.thumbnail > img').absUrl('data-src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(document, url)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document, url) {
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('.chapterlist > li');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
	}
	
	let match = url.match(/\/(\w+)\//);
	if (match) {
		var catalog_response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl,`/chapterlist/${match[1]}/`));
		if(catalog_response.code() == 200){
			try {
				JSON.parse(catalog_response.body().string()).data.list.forEach((child) => {
					newChapters.push({
						//章节名称
						name: child.name,
						//章节网址
						url: JavaUtils.urlJoin(url, child.id + ".html")
					});
				});
			} catch (error) {
				//抛出错误
			}
		}
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
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		eval(JavaUtils.substring(response.body().string(),'<script type=\"text/javascript\">','</script>'));
		return JSON.stringify(newImgs);
	}
	return null;
} 
*/