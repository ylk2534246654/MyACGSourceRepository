function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652589052,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "EDD动漫",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/EDD动漫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/EDD动漫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/EDD动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1710060433,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//自定义标签
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"region": {
					"全部": "id-3",
					"国产动漫": "id-87",
					"欧美动漫": "id-99",
				},
				"label": {
					"全部": "mcid-0",
					"冒险": "mcid-129",
					"站长推荐": "mcid-240",
					"热血": "mcid-127",
					"萌": "mcid-241",
					"搞笑": "mcid-130",
					"少女": "mcid-125",
					"恋爱": "mcid-148",
					"魔幻": "mcid-126",
					"推理": "mcid-128",
					"神魔": "mcid-146",
					"竞技": "mcid-133",
					"游戏": "mcid-149",
					"益智": "mcid-131",
					"机战": "mcid-151",
					"宠物": "mcid-153",
					"格斗": "mcid-155",
					"魔法": "mcid-156",
					"亲子": "mcid-150",
					"励志": "mcid-141",
					"青春": "mcid-138",
					"都市": "mcid-137",
					"惊悚": "mcid-143",
					"经典": "mcid-132",
					"童话": "mcid-134",
					"真人": "mcid-154",
					"校园": "mcid-152",
					"文艺": "mcid-139",
					"生活": "mcid-140",
					"古装": "mcid-142",
					"科幻": "mcid-144",
					"动画": "mcid-136"
				},
				"year": {
					"全部": "year-0",
					"2024": "year-2024",
					"2023": "year-2023",
					"2022": "year-2022",
					"2021": "year-2021",
					"2020": "year-2020",
					"2019": "year-2019",
					"2018": "year-2018",
					"2017": "year-2017",
					"2009-1999": "year-1999,2009",
					"90年代": "year-1990,1999",
					"80年代": "year-1980,1989",
					"更早": "year-1900,1980"
				},
				"order": {
					"更新排序": "order-addtime",
					"人气排序": "order-hits",
					"评分排序": "order-gold",
				}
			},
			"动漫": ["region","label","year","order"],
		},
	});
}
const baseUrl = "https://www.edddh4.com";
/**
 * https://www.edddm.com/
 * www.edddh4.com
 * www.edddm.net
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/index.php?s=home-search-index.html@post->wd='+ encodeURI(key));
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select("#content > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称图片网址
				nameImgUrl: JavaUtils.urlJoin(baseUrl, element.selectFirst('a > img').attr('src')),
				
				//概览
				summary: element.selectFirst('ul.info > li:nth-child(12)').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a.video-pic').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('ul.info > li:nth-child(1) > a').absUrl('href')
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
	var url = JavaUtils.urlJoin(baseUrl, `/index.php?s=home-vod-type-${encodeURI(region)}-${encodeURI(label)}-${encodeURI(year)}-${encodeURI(order)}-picm-1-p-1`);
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select("#content > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.title').text(),
				
				//概览
				summary: element.selectFirst('.note').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.video-pic').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.video-pic').absUrl('href')
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
		var cssDocument = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: JavaUtils.substring(cssDocument.selectFirst('head > title').text(),"《","》"),
	
			//作者
			author: cssDocument.selectFirst('li.text.hidden-sm.hidden-md').text(),
			
			//最近更新时间
			lastUpdateTime: cssDocument.selectFirst('ul.info > li:nth-child(12) > :matchText').text(),
			
			//概览
			summary: cssDocument.selectFirst('span.details-content-default').text(),
	
			//封面网址
			coverUrl: cssDocument.selectFirst('div.details-pic > img').attr('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录网址/非外链无需使用
			tocs: tocs(cssDocument, url)
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
	const tagElements = document.select('ul.hidden-sm.nav-tabs> li:gt(0)');
	
	//目录元素选择器
	const tocElements= document.select('div.playlist > ul');
	
	//创建目录数组
	var newTocs = [];
	
	catalogFor:for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			var name = chapterElement.selectFirst('a').text();
			if(name.indexOf('迅雷') != -1){
				break catalogFor;
			}
			newChapters.push({
				//章节名称
				name: name,
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
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