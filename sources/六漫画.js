function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652779713,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,
		
		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "六漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 7,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/六漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/六漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/六漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/六漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703407068,
		
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

const baseUrl = getBaseUrl();
/**
 * sixmh7.com
 * sixmh6.com
 * 6mh9.com
 * 6mh66.com
 * 此源和七夕漫画相似
 */
function getBaseUrl() {
	var preference = JavaUtils.getPreference();
	var baseUrlTime = preference.getLong("baseUrlTime");
	var oneDay = 1000*60*60*24;
	var time = new Date().getTime();
	if(baseUrlTime < time - oneDay){//超过一天
		const response = JavaUtils.httpRequest("http://m.6mh9.com");
		if(response.code() == 200){
			const document = response.body().cssDocument();
			var strU = document.selectFirst("a#href").absUrl('href');
			var edit = preference.edit();
			if(JavaUtils.isNetworkUrl(strU)){
				edit.putString("baseUrl", strU);//更新基础网址
			}
			edit.putLong("baseUrlTime", time).apply();//更新时间
		}
	}
	return preference.getString("baseUrl", "http://www.sixmanhua.com");
}

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
		var elements = document.select("#__layout > div > div > div.search-result > ul > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div > h2').text(),
				
				//作者
				author: element.selectFirst('div > p:nth-child(2)').text(),

				//最后章节名称
				lastChapterName: element.selectFirst('div > p:nth-child(5)').text(),
				
				//概览
				summary: element.selectFirst('div > p:nth-child(3)').text(),

				//封面网址
				coverUrl: element.selectFirst('li > img').absUrl('src'),
				
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
function find(label) {
	var url = JavaUtils.urlJoin(baseUrl, `/sortdata.php@post->page_num=1&type=${label}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.forEach((child) => {
			result.push({
				//名称
				name: child.name,
				
				//作者
				author: child.author,

				//概览
				summary: child.intro,
				
				//封面网址
				coverUrl: child.imgurl,
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, child.id + "/")
			})
		});
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
			name: document.selectFirst('.cartoon-title').text(),
			
			//作者
			author: document.selectFirst('p.author').text(),
			
			//更新时间
			//update: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('p.introduction').text(),
	
			//封面网址
			//coverUrl: document.selectFirst('').absUrl(''),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(document, url)
		});
	}
	return null;
}


/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document, url) {
	//目录元素选择器
	const tocElements = document.select('dl.cartoon-directory');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('div.chapter-list > a');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		
		var vidElement = document.selectFirst('#__layout > div > dl.cartoon-directory.chalist2 > dd');
		if(vidElement != null){
			const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl,'/bookchapter/') + '@post->id=' + vidElement.attr('data-id') + '&id2=' + vidElement.attr('data-vid'));
			if(response.code() == 200){
				JSON.parse(response.body().string()).forEach((child) => {
					newChapters.push({
						//章节名称
						name: child.chaptername,
						//章节网址
						url: JavaUtils.urlJoin(url,child.chapterid) + '.html'
					});
				});
			}
		}
		
		newTocs.push({
			//目录名称
			name: '目录 ' + (1 + i),
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

/**
 * 内容
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var script = JavaUtils.substring(response.body().string(), '<script type=\"text/javascript\">','</script>');
		eval(String(script));
		for(var i = 0;i < newImgs.length;i++){
			newImgs[i] = newImgs[i].concat('@header->Referer:');
		}
		return JSON.stringify(newImgs);
	}
	return null;
}