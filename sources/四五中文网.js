function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1656606228,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 11,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "四五中文网",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新链接
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/四五中文网.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/四五中文网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/四五中文网.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/四五中文网.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695374379,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				"regexUrl": "search\.php",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				"maxRequests": 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				"period": 30_000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

const baseUrl = "https://www.45zw.cc";
/**
 * 网站记录
 * https://www.45zw.org
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/modules/article/search.php?searchkey=${JavaUtils.encodeURI(key,'gbk')}&submit=%CB%D1%CB%F7`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("tbody > tr");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('td:nth-child(1) > a').text(),
				
				//作者
				author: document.selectFirst('tr:nth-child(2) > td:nth-child(3)').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('td:nth-child(2) > a').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('tr:nth-child(2) > td:nth-child(5)').text(),
				
				//封面网址
				//coverUrl: element.selectFirst('').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('td:nth-child(1) > a').absUrl('href')
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
			name: document.selectFirst('#info > h1 > :matchText').text(),
			
			//作者
			author: document.selectFirst('#info > h1 > small > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('#info > div.update  > :matchText:nth-child(3)').text(),
			
			//概览
			summary: document.selectFirst('#intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#picbox > div > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(url, document)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(url, document) {
	const zjboxSize = document.select('.zjbox > div > select > option').size();
	
	//创建章节数组
	var newChapters= [];
	for(var i = 1;i <= zjboxSize;i++){
		var _url = JavaUtils.urlJoin(url, `index_${i}.html`);
		const response = JavaUtils.httpRequest(_url);
		if(response.code() == 200){
			const _document = response.body().cssDocument();
				
			//章节元素选择器
			var chapterElements = _document.select('div > dl > dd > a');
				
			for (var ci = 0;ci < chapterElements.size(); ci++) {
				var chapterElement = chapterElements.get(ci);
				newChapters.push({
					//章节名称
					name: chapterElement.selectFirst('a').text(),
					//章节链接
					url: chapterElement.selectFirst('a').absUrl('href')
				});
			}
		}
	}
	return [{
		//目录名称
		name: '目录',
		//章节
		chapter : newChapters
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
		return document.select(`#content:not(:matches(最新章节！|四五中文网|${baseUrl})):matchText`).outerHtml();
	}
	return null;
}