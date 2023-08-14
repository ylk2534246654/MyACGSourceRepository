function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654920600,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230810,
		
		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "奇漫屋",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 6,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/奇漫屋.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/奇漫屋.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/奇漫屋.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/奇漫屋.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/奇漫屋.js",
		},
		
		//更新时间
		updateTime: "2023年8月10日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
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
					"科幻魔法": "3",
					"侦探推理": "4",
					"耽美爱情": "5",
					"生活": "6",
					"推荐": "11",
					"完结": "12",
					"连载中": "13",
				},
			},
			"漫画": ["label"]
		},
	});
}

/**
 * 发现
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(label) {
	var url = JavaUtils.urlJoin(baseUrl, `/sort/${label}-1.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.rank-list > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.comic-name').text(),
				
				//概览
				summary: element.selectFirst('.comic-author').text() + '\n' + element.selectFirst('.comic-tip').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.cover').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.comic-item-info > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

//此源和七夕漫画，六漫画相似
const baseUrl = getBaseUrl();
/**
 * http://qiman5.com
 * http://qiman56.com
 * http://qiman57.com
 * http://qiman51.com
 * http://m.qiman59.com
 */
function getBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		var strU = JavaUtils.webViewEvalJS("http://qiman51.com", "window.location.href", 3000);
		var edit = preference.edit();
		if(JavaUtils.isNetworkUrl(strU)){
			edit.putString("baseUrl", strU);//更新基础网址
		}
		edit.putLong("baseUrlTime", time).apply();//更新时间
	}
	return preference.getString("baseUrl", "http://qiman51.com");
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/spotlight/?keyword=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div.search-result > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('p.comic-name > a').text(),
				
				//概览
				summary: element.selectFirst('p.comic-tags').text() + '\n' + element.selectFirst('p.comic-update-at').text(),
				
				//封面网址
				coverUrl: element.selectFirst('a.cover > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('a.cover').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('div.box-back2 > h1').text(),
			
			//作者
			author: document.selectFirst('div.box-back2 > p:nth-child(2)').text(),
			
			//更新时间
			update: document.selectFirst('div.comic-info-box > div.box-back2 > p:nth-child(5)').text(),
			
			//概览
			summary: document.selectFirst('span.comic-intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.comic-info-box > div > img').absUrl('src'),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(response, url)
		});
	}
	return null;
}


/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(response, url) {
	const document = response.body().cssDocument();

	//目录元素选择器
	const tocElements = document.select('li.chapter-item');
	
	//创建章节数组
	var newChapters = [];
	for (var i2 = 0;i2 < tocElements.size();i2++) {
		var tocElement = tocElements.get(i2);
		newChapters.push({
			//章节名称
			name: tocElement.selectFirst('a').text(),
			//章节网址
			url: tocElement.selectFirst('a').absUrl('href')
		});
	}

	var match1 = response.body().string().match(/"id"\s*:\s*(\d+).*"id2"\s*:\s*(\d+)/);
	var id = match1[1];
	var vid = match1[2];
	if(vid.length > 0){
		const response2 = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl,'/bookchapter/') + '@post->id=' + id + '&id2=' + vid);
		if(response2.code() == 200){
			JSON.parse(response2.body().string()).forEach((child) => {
				newChapters.push({
					//章节名称
					name: child.name,
					//章节网址
					url: JavaUtils.urlJoin(url, child.id) + '.html'
				});
			});
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
 * @param {string} url
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var newImgs;
		var script = JavaUtils.substring(response.body().string(), '<script type=\"text/javascript\">','</script>');
		eval(String(script));
		return JSON.stringify(newImgs);
	}
	return null;
}