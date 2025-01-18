function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652949783,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,
		
		//优先级 1~100，数值越大越靠前
		priority: 50,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "包子漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 16,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/包子漫画.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/包子漫画.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/包子漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1737176000,
		
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

		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceList: [
			{
				type: 3,
				key: "baseUrl",
				name: "使用镜像网址",
				summary: "不能加载的时候可以尝试切换",
				itemList: {
					"cn.baozimhcn.com": "https://cn.baozimhcn.com",
					"cn.baozimh.com": "https://cn.baozimh.com",
					"cn.webmota.com": "https://cn.webmota.com",
					"tw.baozimh.com": "https://tw.baozimh.com",
					"www.baozimh.com": "https://www.baozimh.com",
					"www.webmota.com": "https://www.webmota.com",
					"cn.czmanga.com": "https://cn.czmanga.com",
					"tw.czmanga.com": "https://tw.czmanga.com",
					"www.czmanga.com": "https://www.czmanga.com",
					"cn.kukuc.co": "https://cn.kukuc.co",
					"tw.kukuc.co": "https://tw.kukuc.co",
					"www.kukuc.co": "https://www.kukuc.co",
				},
				defaultValue: 0
			},
			{
				type: 3,
				key: "imgBaseUrl",
				name: "切换图源线路",
				summary: "图片不能加载的时候可以尝试切换",
				itemList: {
					"自动": "default",
					"线路1": "s1.baozicdn.com",
					"线路2": "s2.baozicdn.com",
					"线路3": "s1.baozimh.com",
					"线路4": "s2.baozimh.com",
				},
				defaultValue: 0
			}
		],
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"region": {
					"全部": "all",
					"国产": "cn",
					"日本": "jp",
					"韩国": "kr",
					"欧美": "en",
				},
				"label": {
					"全部": "all",
					"恋爱": "lianai",
					"纯爱": "chunai",
					"古风": "gufeng",
					"异能": "yineng",
					"悬疑": "xuanyi",
					"剧情": "juqing",
					"科幻": "kehuan",
					"奇幻": "qihuan",
					"玄幻": "xuanhuan",
					"穿越": "chuanyue",
					"冒险": "mouxian",
					"推理": "tuili",
					"武侠": "wuxia",
					"格斗": "gedou",
					"战争": "zhanzheng",
					"热血": "rexie",
					"搞笑": "gaoxiao",
					"大女主": "danuzhu",
					"都市": "dushi",
					"总裁": "zongcai",
					"后宫": "hougong",
					"日常": "richang",
					"韩漫": "hanman",
					"少年": "shaonian",
					"其它": "qita",
				},
				"status": {
					"全部": "all",
					"连载中": "serial",
					"已完结": "pub",
				},
				"filter": {
					"全部": "%2a",
					"ABCD": "ABCD",
					"EFGH": "EFGH",
					"IJKL": "IJKL",
					"MNOP": "MNOP",
					"QRST": "QRST",
					"UVW": "UVW",
					"XYZ": "XYZ",
					"0-9": "0-9",
				},
			},
			"漫画": ["region","status","label"]
		},
		
		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		},
	});
}
const baseUrl = JavaUtils.getPreference().getString("baseUrl", "https://cn.baozimhcn.com");
/**
 * 备用
 * https://cn.baozimh.com
 * https://cn.webmota.com
 * https://cn.kukuc.co
 * https://cn.czmanga.com
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/search?q='+ encodeURI(key));
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select("div.search > div.pure-g > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.comics-card__title').text(),
				
				//概览
				summary: element.selectFirst('small.tags').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a > amp-img').absUrl('src'),
				
				//网址
				url: element.selectFirst('a.text-decoration-none').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region, status, label, page) {
	var url = JavaUtils.urlJoin(baseUrl,`/classify?type=${label}&region=${region}&state=${status}&filter=%2a`);
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select(".classify-items > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.comics-card__title').text(),
				
				//概览
				summary: element.selectFirst('small.tags').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a.text-decoration-none > amp-img').absUrl('src'),
				
				//网址
				url: element.selectFirst('a.text-decoration-none').absUrl('href')
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
			name: document.selectFirst('h1.comics-detail__title').text(),
			
			//作者
			author: document.selectFirst('h2.comics-detail__author').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('div.l-content > div > div > div > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.l-content > div > div > amp-img').absUrl('src'),
			
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
	var chapterElements = document.select('#chapter-items > div,#chapters_other_list > div');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		var aElement = chapterElement.selectFirst('a');
		var href = aElement.absUrl('href');
		newChapters.push({
			//章节名称
			name: aElement.text(),

			//章节网址
			url: JavaUtils.urlJoin(baseUrl, '/comic/chapter/' + JavaUtils.substring(href,'comic_id=','&') + '/0_' + JavaUtils.substring(href + '&','chapter_slot=','&') + '_{1}.html')
		});
	}
	if(newChapters.length < 1){//最新章节
		chapterElements = document.select('.comics-chapters');
		for (var i2 = chapterElements.size() - 1;i2 >= 0;i2--) {
			var chapterElement = chapterElements.get(i2);
			
			var aElement = chapterElement.selectFirst('a');
			var href = aElement.absUrl('href');
			newChapters.push({
				//章节名称
				name: aElement.text(),

				//章节网址
				url: JavaUtils.urlJoin(baseUrl, '/comic/chapter/' + JavaUtils.substring(href,'comic_id=','&') + '/0_' + JavaUtils.substring(href + '&','chapter_slot=','&') + '_{1}.html')
			});
		}
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
		//创建漫画数组
		var result = [];
		//漫画列表代码
		var document = response.body().cssDocument();
		var contentElements = document.select('[[src]],.comic-contain__item');
		for (var i2 = 0;i2 < contentElements.size();i2++) {
			var contentElement = contentElements.get(i2);

			var imageWidth = contentElement.selectFirst('[width]').attr('width');
			var imageHeight = contentElement.selectFirst('[height]').attr('height');

			var imageElement = contentElement.selectFirst('[data-src]');
			var srcUrl;
			if(imageElement != null){
				srcUrl = imageElement.absUrl('data-src');
			}else{
				imageElement = contentElement.selectFirst('[src]');
				srcUrl = imageElement.absUrl('src');
			}

			var imgBaseUrl = JavaUtils.getPreference().getString("imgBaseUrl", "default");
			if(imgBaseUrl != "default"){
				srcUrl = String(srcUrl).replace(/[\w]+\.(baozicdn|baozimh)\.com/g, imgBaseUrl); 
			}

			result.push(srcUrl + '@imageWidth->' + imageWidth + '@imageHeight->' + imageHeight);
		}
		return JSON.stringify(result);
	}
	return null;
}