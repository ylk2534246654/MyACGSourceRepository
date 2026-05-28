function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1779942490,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 90,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "MyComic",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/MyComic.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/MyComic.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/MyComic.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1779942532,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: JavaUtils.getPreference().getString("baseUrl", defaultBaseUrl),
		
		//发现
		findList: {
			category: {
				"region": {
					"全部": "",
					"国产": "&filter%5Bcountry%5D=china",
					"日本": "&filter%5Bcountry%5D=japan",
					"韩国": "&filter%5Bcountry%5D=korea",
					"欧美": "&filter%5Bcountry%5D=europe",
					"其他": "&filter%5Bcountry%5D=other",
				},
				"label": {
					"全部": "",
					"魔幻": "&filter%5Btag%5D=mohuan",
					"魔法": "&filter%5Btag%5D=mofa",
					"热血": "&filter%5Btag%5D=rexue",
					"冒险": "&filter%5Btag%5D=maoxian",
					"悬疑": "&filter%5Btag%5D=xuanyi",
					"侦探": "&filter%5Btag%5D=zhentan",
					"爱情": "&filter%5Btag%5D=aiqing",
					"校园": "&filter%5Btag%5D=xiaoyuan",
					"搞笑": "&filter%5Btag%5D=gaoxiao",
					"四格": "&filter%5Btag%5D=sige",
					"科幻": "&filter%5Btag%5D=kehuan",
					"神鬼": "&filter%5Btag%5D=shengui",
					"舞蹈": "&filter%5Btag%5D=wudao",
					"音乐": "&filter%5Btag%5D=yinyue",
                    "百合": "&filter%5Btag%5D=baihe",
                    "后宫": "&filter%5Btag%5D=hougong",
                    "机战": "&filter%5Btag%5D=jizhan",
                    "格斗": "&filter%5Btag%5D=gedou",
                    "恐怖": "&filter%5Btag%5D=kongbu",
                    "萌系": "&filter%5Btag%5D=mengxi",
                    "武侠": "&filter%5Btag%5D=wuxia",
                    "社会": "&filter%5Btag%5D=shehui",
                    "历史": "&filter%5Btag%5D=lishi",
                    "耽美": "&filter%5Btag%5D=danmei",
                    "励志": "&filter%5Btag%5D=lizhi",
                    "职场": "&filter%5Btag%5D=zhichang",
                    "生活": "&filter%5Btag%5D=shenghuo",
                    "治愈": "&filter%5Btag%5D=zhiyu",
                    "伪娘": "&filter%5Btag%5D=weiniang",
                    "黑道": "&filter%5Btag%5D=heidao",
                    "战争": "&filter%5Btag%5D=zhanzheng",
                    "竞技": "&filter%5Btag%5D=jingji",
                    "体育": "&filter%5Btag%5D=tiyu",
                    "美食": "&filter%5Btag%5D=meishi",
                    "腐女": "&filter%5Btag%5D=funv",
                    "宅男": "&filter%5Btag%5D=zhainan",
                    "推理": "&filter%5Btag%5D=tuili",
                    "杂志": "&filter%5Btag%5D=zazhi",
				},
                "year": {
                    "全部": "",
                    "2026": "&filter%5Byear%5D=2026",
                    "2025": "&filter%5Byear%5D=2025",
                    "2024": "&filter%5Byear%5D=2024",
                    "2023": "&filter%5Byear%5D=2023",
                    "2022": "&filter%5Byear%5D=2022",
                    "2021": "&filter%5Byear%5D=2021",
                    "2020": "&filter%5Byear%5D=2020",
                    "2019": "&filter%5Byear%5D=2019",
                    "2018": "&filter%5Byear%5D=2018",
                    "2017": "&filter%5Byear%5D=2017",
                    "2016": "&filter%5Byear%5D=2016",
                    "2015": "&filter%5Byear%5D=2015",
                    "2014": "&filter%5Byear%5D=2014",
                    "2013": "&filter%5Byear%5D=2013",
                    "2012": "&filter%5Byear%5D=2012",
                    "2011": "&filter%5Byear%5D=2011",
                    "2010": "&filter%5Byear%5D=2010",
                    "00年代": "&filter%5Byear%5D=200x",
                    "90年代": "&filter%5Byear%5D=199x",
                    "80年代": "&filter%5Byear%5D=198x",
                    "70年代或更早": "&filter%5Byear%5D=197x"
                },
				"status": {
					"全部": "",
					"连载中": "&filter%5Bend%5D=0",
					"已完结": "&filter%5Bend%5D=1",
				},
				"order": {
					"全部": "",
					"最热": "&sort=-views",
					"最新": "&sort=-update",
				}
			},
			"漫画": ["region","status","label","year","order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const defaultBaseUrl = "https://mycomic.com";


/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
    var baseUrl = JavaUtils.getManifest().getBaseUrl();
	var url = JavaUtils.urlJoin(baseUrl, '/cn/comics?q=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.group.relative");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.text-center').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('a').text(),
				
				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				//summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.object-cover').absUrl('data-src') + '@header->referer:' + baseUrl,
				
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
function find(region, status, label, year, order) {
    var baseUrl = JavaUtils.getManifest().getBaseUrl();
	var url = JavaUtils.urlJoin(baseUrl, `/cn/comics?${region}${status}${label}${year}${order}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("div.group.relative");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.text-center').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('a').text(),
				
				//最近更新时间
				//lastUpdateTime: element.selectFirst('.video_play_status').text(),

				//概览
				//summary: element.selectFirst('.desc > :matchText').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.object-cover').absUrl('data-src') + '@header->referer:' + baseUrl,
				
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
			//name: document.selectFirst('og:title').absUrl('content').replace(" - MyComic",""),
			
			//作者
			//author: document.selectFirst('li:nth-child(5) > span.detail_imform_value').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('li:nth-child(7) > span.detail_imform_value').text(),
			
			//概览
			//summary: document.selectFirst('div.video_detail_desc').text(),
	
			//封面网址
			//coverUrl: document.selectFirst('div.video_detail_cover > img').absUrl('data-original'),
			
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
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录元素选择器
    const tocElements = document.select('.items-stretch > div.grow > div:nth-child(3) > div');

	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		var attr_x_data = tocElements.get(i).select('[x-data]').attr("x-data");
        eval("var x_data = " + attr_x_data);
		x_data.chapters.forEach((child) => {
            newChapters.push({
				//章节名称
				name: child.title,

				//章节网址
				url: child.id
			});
        })
		newTocs.push({
			//目录名称
			name: tocElements.get(i).selectFirst('div.items-center > div').text(),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}



/**
 * 内容
 * @params {string} jsonStr
 * @returns {string} content
 */
function content(id) {
    var baseUrl = JavaUtils.getManifest().getBaseUrl();
	var url = JavaUtils.urlJoin(baseUrl, '/cn/chapters/' + id);
    const response = JavaUtils.httpRequest(url);
    if(response.code() == 200){
		const document = response.body().cssDocument();
        const elements = document.select("img[x-ref]")
        var urls = []
		for (var i = 0;i < elements.size();i++) {
			var contentElement = elements.get(i);
			var imageWidth = contentElement.selectFirst('[width]').attr('width');
			var imageHeight = contentElement.selectFirst('[height]').attr('height');
            urls.push(contentElement.absUrl('src') + '@header->referer:' + baseUrl + '@imageWidth->' + imageWidth + '@imageHeight->' + imageHeight);
        }
        return JSON.stringify(urls);
    }
}