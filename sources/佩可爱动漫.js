function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1725775347,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "佩可爱动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/佩可爱动漫.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/佩可爱动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/佩可爱动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1725775347,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//首选项配置 type：（1:按钮，2:开关，3:单选框，4:编辑框，5:跳转链接）
		// preferenceList: [
		// 	{
		// 		type: 3,
		// 		key: "baseUrl",
		// 		name: "切换线路",
		// 		summary: "不能加载的时候可以切换",
		// 		bindDetail: false,
		// 		locationList: ["sourceDetail","detail"],
		// 		functionName: "getSourceSub",
		// 		defaultValue: defaultBaseUrl
		// 	}
		// ],
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://pekolove.com",
		
		//发现
		findList: {
			category: {
				"label": {
                    "恋爱": "love",
                    "异世界": "iseikai",
                    "后宫": "haremu",
                    "女性向": "bl",
                    "萝莉": "loli",
                    "百合": "yuri",
                    "校园": "school",
                    "奇幻": "fanntaji",
                    "冒险": "bokenn",
                    "搞笑": "wareu",
                    "治愈": "iyashi",
                    "热血": "nekketu",
                    "其他": "other",
                }
			},
			"动漫": ["label"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			//"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}
/**
 * peko.love
 * https://t.me/peko_love
 * admin@peko.love
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/?s=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".wp-block-post");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.wp-block-post-title').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('.wp-block-post-date').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.wp-post-image').absUrl('src'),
				
				//网址
				url: element.selectFirst('.wp-block-post-title > a').absUrl('href')
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
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/anime/${label}/`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".grid-items > .item");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.title_link').text(),
				
				//最近更新时间
				lastUpdateTime: element.selectFirst('.post_date').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.thumb_link > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.title_link > a').absUrl('href')
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
			name: document.selectFirst('.wp-block-post-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.wp-container-73 > div.is-vertical').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.wp-block-group > div.wp-block-columns > div  > figure > img').absUrl('src'),
			
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
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('.wp-block-columns > div > div > .wp-block-column');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		var url = chapterElement.selectFirst('a').absUrl('href');
        if(url.indexOf("-peko-") != -1){
            newChapters.push({
                //章节名称
                name: chapterElement.selectFirst('a').text(),
                //章节网址
                url: url
            });
        }
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : newChapters,
        //启用反向顺序
        enableReverseOrder: false,
	}];
}