function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714186,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 60,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "COCO漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 16,

		//自述文件网址
		readmeUrlList: [
			"https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/cocoManga.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/cocoManga.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/cocoManga.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/cocoManga.js",
		},

		//最近更新时间
		lastUpdateTime: 1705284208,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,

		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceOptionList: [
			{
				type: 4,
				key: "headerTimeStamp",
				name: "请求头时间戳",
				defaultValue: "0"
			}
		],
		
		//自定义标签
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//详情页网址匹配
		detailUrlPattern: JavaUtils.urlJoin(baseUrl, "/manga-\\w+/"),

		//发现
		findList: {
			category: {
				"state": {
					"全部": "",
					"连载中": "1",
					"已完结": "2",
				},
				"type": {
					"全部": "",
					"恋爱": "10126",
					"古风": "10143",
					"剧情": "10480",
					"科幻": "10181",
					"奇幻": "10242",
					"玄幻": "10024",
					"穿越": "10129",
					"冒险": "10210",
					"战斗": "10309",
					"冒险热血": "11224",
					"爆笑": "10201",
					"少男": "10641",
					"少女": "10301",
					"重生": "10461",
					"热血": "10023",
					"搞笑": "10122",
					"大女主": "10706",
					"都市": "10124",
					"后宫": "10138",
					"逆袭": "10943",
					"少年": "10321",
					"动作": "10125",
					"校园": "10131",
					"修真": "10133",
					"系统": "10722",
					"修仙": "10453",
					"霸总": "10127",
					"生活": "10142",
					"连载": "11062",
					"其它": "10560",
				},
				"orderBy": {
					"更新日": "update",
					"日点击": "dailyCount",
					"周点击": "weeklyCount",
					"月点击": "monthlyCount",
				},
			},
			"漫画": ["state","type","orderBy"]
		},
		
		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				regexUrl: baseUrl,//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				maxRequests: 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				period: 5000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//启用检测收藏更新
		//enableDetectFavoriteUpdate: false,

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": `Mozilla/5.0 (Linux; Android;) AppleWebKit (KHTML, like Gecko) Mobile Safari TimeStamp/${JavaUtils.getPreference().getLong("headerTimeStamp")}`,
			"Referer": baseUrl
		},
	})
}
const baseUrl = "https://www.colamanga.com";
//https://www.colamanhua.com
//https://www.cocomanga.com
//onemanhua

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 * @return {boolean} 返回结果
 */
function isEnableAuthenticator(url, responseHtml) {
	//对框架进行拦截，检索关键字，
	if(responseHtml != null && responseHtml.indexOf('请用正常浏览器观看') != -1){
		var time = new Date().getTime();
		JavaUtils.getPreference().edit().putLong("headerTimeStamp", time).apply();
		return null;
	}
	return false;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,`/search?searchString=${encodeURI(key)}`);
	const response = JavaUtils.httpRequest(url);
	var result= [];
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.fed-part-layout > dl");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				name: element.selectFirst('dd > h1').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('dd > ul > li:nth-child(2) > span').nextSibling().text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('dd > ul > li:nth-child(5) > span').nextSibling().text(),
			
				//概览
				summary: element.selectFirst('.fed-part-esan > :matchText').text(),

				//封面网址
				coverUrl: element.selectFirst('dt > a').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('dt > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(state, type, orderBy) {
	var url = JavaUtils.urlJoin(baseUrl, `/show?status=${state}&mainCategoryId=${type}&orderBy=${orderBy}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".fed-list-info > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.fed-list-title').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.fed-list-remarks').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('.fed-list-desc').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.fed-list-pics').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.fed-list-pics').absUrl('href')
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
			//名称
			name: document.selectFirst('h1.fed-part-eone').text(),
			
			//作者
			author: document.selectFirst('dd > ul > li:nth-child(2) > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('dd > ul > li:nth-child(3) > a').text(),
			
			//概览
			summary: document.selectFirst('p.fed-part-both').text(),
	
			//封面网址
			coverUrl: document.selectFirst('a.fed-list-pics:nth-last-child(1)').absUrl('data-original'),
			
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
	const tagElements = document.select('div.fed-tabs-info > div > div > div > ul > li');
	
	//目录元素选择器
	const tocElements = document.select('div.fed-tabs-item > div > div > div > ul');
	
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
				url: chapterElement.selectFirst('a').absUrl('href') + '@header->user-agent-platform:Win32'
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('a').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}


/**
 * 内容（部分搜索源通用过滤规则）
 * @version 2024/1/15
 * 布米米、嘻嘻动漫、12wo动漫、路漫漫、风车动漫P、樱花动漫P、COCO漫画、Nike、cocoManga
 * @return {string} content
 */
function content(url) {
	var re = new RegExp(
		//https://
		'(^[a-zA-z]+://[^\\s/]+/(' +

		//https://knr.xxxxx.cn/j/140000		#[a-z]{1}\/\d{6}
		'([a-z]{1}/\\d)' +

		//https://xx.xxx.xx/xxx/xxx/0000	#[a-z]{3}\/[a-z]{3}\/\d
		'|([a-z]{3}/[a-z]{3}/\\d)' +

		//https://tg.xxx.com/sc/0000?n=xxxx #[a-z]{2}\/\d{4}\?
		'|([a-z]{2}/\\d{4}\\?)' +

		//https://xx.xxx.xyz/vh1/158051 	#[\w]{3}\/\d{6}$
		'|([\\w]{3}/\\d{6}$)' +

		//https://xx.xx.com/0000/00/23030926631.txt 	#[\d]{4}\/\d{2}\/\d{11}\.txt
		'|([\\d]{4}/\\d{2}/\\d{11}\\.txt)' +

		//https://xxx.com/ba4fa4f070f761b057fbabfb3fd7925d.txt 	#\w{32}\.txt
		'|(\\w{32}\\.txt)' +
		
		//https://zbg.xxx.com/candy14395.js 	#\w{32}\.txt
		'|(candy\\d{5}\\.)' +

		//https://xxxxx.xxxxxx.com/v2/stats/12215/157527 	#[\w]{2}\/\w{5}\/\d{5}\/\d{6}
		'|([\\w]{2}/\\w{5}/\\d{5}/\\d{6})' +

		//https://xxx.xxxxxx.com/sh/to/853	#sh\/[\w]{2}\/\d{3}
		'|(sh/[\\w]{2}/\\d{3})' +

		//https://xxx.rmb.xxxxxxxx.com/xxx/e3c5da206d50f116fc3a8f47502de66d.gif #[\w]{3}\/[\w]{32}\.
		'|([\\w]{3}/[\\w]{32}\\.)' +

		//https://xxxx.xxxx.xx:00000/mnrt/kmrr1.woff
		//https://xxxx.xxxx.xx:00000/kmopef/3.woff # [\w/]+[/km][\w/]+\.woff
		'|([\\w/]+[/km][\\w/]+\\.woff)' +

		//https://aba.xxxxxxx.cn/slot?2377029035902478992-27158		#slot\?[\d-]+$
		'|(slot\\?[\\d-]+$)' +

		//https://xxxx.xxxx.com/o.js # o\.js
		//'|o\\.js' + //无法正常加载

		//https://br.xxxx.com:8891/vh3/3342
		'|([\\w]{3}/[\\d]+$)' +

		//（!易误拦截） 例子过长，无法展示		#[\\w]{3}\?[\\S]{400,}
		'|([\\w]{3}\?[\\S]{400,})' +
		
		'))' +
        //Google
		'|(^[a-zA-z]+://[^\\s/]+doubleclick\\.net/)'
		,
		'i'
	);
	if(!re.test(url)){
		return url;
	}
	return null;
}

/**
 * 对网页注入 JS 脚本（contentProcessType == 2）
 * @param  {string} url
 * @param  {boolean} isStart：运行时机{true：页面加载前，false：页面加载完成后}
 * @return  {string} js 代码

function webPageLoadJavaScript(url, isStart) {
	if(!isStart){
		return `document.querySelector("script[src] ~ div[id]").remove()`;
		//return `document.write(document.querySelector("#mangalist").outerHTML);`;
	}
	return null;
}
 */