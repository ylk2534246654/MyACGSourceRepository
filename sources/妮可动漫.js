function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654927709,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "妮可动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/妮可动漫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/妮可动漫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/妮可动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1743326540,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//首选项配置 type：（1:按钮，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceList: [
			{
				type: 3,
				key: "baseUrl",
				name: "切换线路",
				summary: "不能加载的时候可以切换",
				bindDetail: false,
				locationList: ["sourceDetail","detail"],
				functionName: "getSourceSub",
				defaultValue: defaultBaseUrl
			}
		],
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: JavaUtils.getPreference().getString("baseUrl", defaultBaseUrl),
		
		//发现
		findList: {
			category: {
				"region": ["全部","日本","大陆","欧美","其他"],
				"label": ["全部","热血","恋爱","科幻","奇幻","百合","后宫","励志","搞笑","冒险","校园","战斗","机战","运动","战争","萝莉"],
				"year": ["全部","2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014"],
				"order": {
					"时间排序": "addtime",
					"人气排序": "hits",
					"评分排序": "gold",
				},
			},
			"动漫": ["region","label","year","order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

/**
 * @param {string} param 详情页参数
 */
function getSourceSub(_) {
	var items = [];
	const response = JavaUtils.httpRequest("https://rentry.org/nicotv");
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("blockquote > p > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			items.push({
				//名称
				name: element.selectFirst('a').absUrl('href'),

				//值
				value: element.selectFirst('a').absUrl('href'),
			})
		}
	}
	return JSON.stringify({
		//项目列表
		itemList: items
	});
}
const defaultBaseUrl = "http://www.nico-tv.me";
/**
 * 备份：
 * 导航：http://help.nicotv.info/
 * https://rentry.org/nicotv
 * http://www.v1.nicotv.bet/
 * www.nicotv.info
 * www.nicotv.work
 * www.nicotv.fun
 * www.nicotv.club
 * www.nicotv.org
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/video/search/' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("ul.list-unstyled > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('h2.text-nowrap').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.continu').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.img-responsive').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('h2.text-nowrap > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region, label, year, order) {
	if(region == "全部")region = "";
	if(label == "全部")label = "";
	if(year == "全部")year = "";
	
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/video/type3/${label}-${region}-${year}----${order}.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("ul.list-unstyled > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('h2.text-nowrap').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.continu').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.img-responsive').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('h2.text-nowrap > a').absUrl('href')
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
			name: document.selectFirst('div.media-body > h2 > a').text(),
			
			//作者
			author: document.selectFirst('div.media-body > dl > dd:nth-child(4)').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('li:nth-child(7) > span.detail_imform_value').text(),
			
			//概览
			summary: document.selectFirst('div.m-intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.media-left > a > img').absUrl('data-original'),
			
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
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录标签元素选择器
	const tagElements = document.select('ul.nav.nav-tabs > li');
	
	//目录元素选择器
	const tocElements = document.select('div.tab-content > ul');
	
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
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('li').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

/**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content
*/
function content(url) {
	//浏览器请求结果处理
	var re = /notice|stgowan|sogowan|bjbkh|smilk|yanko/i;
	//|\.png|\.jpg|\.svg|\.ico|\.gif|\.webp|\.jpeg
	if(!re.test(url)){
		return url;
	}
	return null;
} 