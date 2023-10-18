function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1678962761,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,
		
		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "酷漫屋",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/酷漫屋.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/酷漫屋.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/酷漫屋.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/酷漫屋.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695368293,
		
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
					"冒险热血": "1",
					"武侠格斗": "2",
					"科幻魔幻": "3",
					"侦探推理": "4",
					"耽美爱情": "5",
					"生活": "6",
					"推荐": "11",
					"完结": "12",
					"连载": "13"
				}
			},
			"漫画": ["label"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

const baseUrl = "http://www.kumw9.com";
//此源和七夕漫画、速漫库、酷漫屋、六漫画相似
//备份：www.kumw7.com,www.kumw9.com

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
		var elements = document.select(".container > div > ul > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-text').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.card-text > span').text(),

				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				//summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.card-graph > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('a:nth-child(1)').absUrl('href')
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
	url = JavaUtils.urlJoin(baseUrl, `/sort/${label}-1.html`);
	const response = JavaUtils.httpRequest(url);
	var result = [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".container > div > ul > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.card-text').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.card-text > span').text(),

				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				//summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.card-graph > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('a:nth-child(1)').absUrl('href')
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
			name: document.selectFirst('.info > h1').text(),
			
			//作者
			author: document.selectFirst('.subtitle').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('p.tip > span:nth-child(3)').text(),
			
			//概览
			summary: document.selectFirst('.content').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.cover > img').absUrl('src'),
			
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
	var chapterElements = document.select('#chapterlistload > ul > li');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href').replace('www.','')
		});
	}
    var more = document.selectFirst('.detail-more').text();
	if(more != null && String(more).length > 1){
		const catalog_response = JavaUtils.httpRequest(replaceUrl(baseUrl, url));
		if(catalog_response.code() == 200){
			try {
				JSON.parse(catalog_response.body().string()).data.list.forEach((child) => {
					newChapters.push({
						//章节名称
						name: child.name,
						//章节网址
						url: (JavaUtils.urlJoin(url, child.id) + '.html').replace('www.','')
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
function replaceUrl(baseUrl, url) {
    return url.replace(new RegExp(baseUrl), baseUrl + '/chapterlist');
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