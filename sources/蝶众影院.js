function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1674978871,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "蝶众影院",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新链接
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/蝶众影院.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/蝶众影院.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/蝶众影院.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/蝶众影院.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703412181,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"dy_region": ["全部","大陆","香港","台湾","美国","韩国","日本","泰国","新加坡","马来西亚","印度","英国","法国","加拿大","西班牙","俄罗斯","德国","其它"],
				"zy_region": ["全部","大陆","港台","韩国","欧美","日本","台湾","日韩","香港","内地"],
				"dm_region": ["全部","大陆","日本","欧美","其他"],
				"dy_label": ["全部","动作","喜剧","爱情","恐怖","科幻","剧情","战争","警匪","犯罪","动画","奇幻","魔幻","武侠","冒险","枪战","悬疑","惊悚","经典","青春","歌舞","文艺","微电影","古装","历史","运动","农村","儿童","网络电影","记录","预告"],
				"dsj_label": ["全部","国产","港台","日韩","海外","欧美","古装","战争","青春","偶像","喜剧","家庭","犯罪","动作","奇幻","剧情","历史","经典","乡村","情景","商战","网剧","言情","伦理","悬疑","都市","军事","警匪","励志","神话","谍战","武侠","科幻","其他"],
				"zy_label": ["全部","脱口秀","真人秀","选秀","八卦","访谈","情感","生活","晚会","搞笑","音乐","时尚","游戏","少儿","体育","纪实","科教","曲艺","歌舞","财经","汽车","播报","旅游","美食","纪实","求职","其他"],
				"dm_label": ["全部","热血","科幻","美少女","魔幻","经典","励志","情感","萝莉","少年","少女","原创","少儿","冒险","搞笑","推理","恋爱","治愈","幻想","校园","动物","机战","亲子","儿歌","运动","悬疑","怪物","战争","益智","青春","童话","竞技","动作","社会","友情","真人版","电影版","OVA版","TV版","新番动画","完结动画","其他"],
				"year": ["全部","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2004"],
				"order": {
					"按最新": "time",
					"按最热": "hits",
					"按评分": "score",
				},
			},
			"电影": ["1","dy_region","dy_label","year","order"],
			"电视剧": ["2","dy_region","dsj_label","year","order"],
			"综艺": ["3","zy_region","zy_label","year","order"],
			"动漫": ["4","dm_region","dm_label","year","order"]
		},

		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				regexUrl: "\/vodsearch\/",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				maxRequests: 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				period: 11000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			//"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const baseUrl = "https://www.dzvod.cc";
/**
 * diezz.net
 * dzvod.cc
 */

/**
 * 是否启用人机身份验证
 * @param {string} url 网址
 * @param {string} responseHtml 响应源码
 * @return {boolean} 返回结果
 */
function isEnableAuthenticator(url, responseHtml) {
	//对框架进行拦截，检索关键字，
	if(responseHtml != null && responseHtml.indexOf('请输入验证码') != -1){
		return true;
	}
	return false;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/vodsearch/-------------.html?wd=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".hl-one-list > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.hl-item-title').text(),
				
				//概览
				summary: element.selectFirst('.hl-pic-text').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.hl-item-thumb').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.hl-item-thumb').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}


/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(type, region, label, year, order) {
	if(region == "全部")region = "";
	if(label == "全部")label = "";
	if(year == "全部")year = "";
	
	var url = JavaUtils.urlJoin(baseUrl, `/vodshow/${type}-${region}-${order}-${label}--------${year}.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".hl-vod-list > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.hl-item-title').text(),
				
				//概览
				summary: element.selectFirst('.hl-pic-text').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.hl-item-thumb').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('.hl-item-title > a').absUrl('href')
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
			name: document.selectFirst('.hl-dc-title').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.clearfix > ul > li:nth-child(11) > :matchText').text(),
			
			//概览
			summary: document.selectFirst('.clearfix > ul > li:nth-child(12) > :matchText').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.hl-dc-pic > span').absUrl('data-original'),
			
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
	const tagElements = document.select('.hl-tabs-btn');
	
	//目录元素选择器
	const tocElements = document.select('.hl-plays-list');
	
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
		var text = "线路 " + i;
		if(i < tagElements.size()){
			text = tagElements.get(i).text();
		}
		newTocs.push({
			//目录名称
			name: text,
			//章节
			chapters : newChapters
		});
	}
	return newTocs;
}

/**
 * 内容(InterceptRequest)
 * @returns {string} content

function content(url) {
	var re = /tydouke|juntaijiancai/i;
	if(!re.test(url)){
		return url;
	}
	return null;
}
 */