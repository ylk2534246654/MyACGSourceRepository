function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652791717,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,
		
		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "七夕漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/七夕漫画.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/七夕漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/七夕漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695373300,
		
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
					"日热门榜": "1",
					"周热门榜": "2",
					"月热门榜": "3",
					"总热门榜": "4",
					"最近最新": "5",
					"新漫入库": "6"
				}
			},
			"漫画": ["label"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			//"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

const baseUrl = "http://m.qiximh3.com";
//此源和七夕漫画、速漫库、酷漫屋、六漫画相似
//m.qiximh2.com，m.qiximh1.com
const loadBaseUrl = "http://www.qiximh2.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/search.php@post->keyword=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		if($.code != 1){//此处和滴滴漫画相似
			$.search_data.forEach((child) => {
				result.push({
					//标题
					name: child.name,
			
					//概览
					summary: child.author,
			
					//封面网址
					coverUrl: child.imgs,
			
					//网址
					url: JavaUtils.urlJoin(url, child.id) + '/'
				});
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
	var url = JavaUtils.urlJoin(baseUrl, `/rank/${label}-1.html`);
	const response = JavaUtils.httpRequest(url);
	var result = [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.comic_cover_container");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				name: element.selectFirst('div.comic_cover_titleBox > a').text(),
				
				//概览
				summary: element.selectFirst('div.comic_cover_desc').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div > a > div').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div.comic_cover_titleBox > a').absUrl('href')
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
			name: document.selectFirst('h1.name').text(),
			
			//作者
			author: document.selectFirst('.author_name').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('div.last_time_chapter > span').text(),
			
			//概览
			summary: document.selectFirst('div.comic_bottom_content > div.detail_wrap > div.details').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.comic_info.h_comic_info > div.comic_cover').absUrl('data-original'),
			
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
	var chapterElements = document.select('ul.catalog_list > a');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href').replace(baseUrl, loadBaseUrl)
		});
	}
	
	var vidElement = document.selectFirst('div.catalog_wrap > div.comment_more > button');
	if(vidElement != null){
		var catalog_response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl,`/bookchapter/@post->id=${vidElement.attr('data-id')}&id2=${vidElement.attr('data-vid')}`));
		if(catalog_response.code() == 200){
			try {
				JSON.parse(catalog_response.body().string()).forEach((child) => {
					newChapters.push({
						//章节名称
						name: child.chaptername,
						//章节网址
						url: (JavaUtils.urlJoin(url, child.chapterid) + '.html').replace(baseUrl, loadBaseUrl)
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