function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1675045639,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "番茄小说",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新链接
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/番茄小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1694533866,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"都市": "1",
					"都市生活": "2",
					"玄幻": "7",
					"科幻": "8",
					"悬疑": "10",
					"乡村": "11",
					"历史": "12",
					"体育": "15",
					"武侠": "16",
					"鉴宝": "17",
					"系统": "19",
					"神豪": "20",
					"种田": "23",
					"赘婿": "25",
					"神医": "26",
					"重生": "36",
					"穿越": "37",
					"二次元": "39",
					"海岛": "40",
					"娱乐圈": "43",
					"空间": "44",
					"推理": "61",
					"洪荒": "66",
					"三国": "67",
					"末世": "68",
					"直播": "69",
					"无限流": "70",
					"诸天万界": "71",
					"大唐": "73",
					"盗墓": "81",
					"灵异": "100",
					"聊天": "381",
					"无敌": "384",
					"校花": "385"
				}
			},
			"小说": ["label"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const baseUrl = "https://novel.snssdk.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl,'/api/novel/channel/homepage/search/search/v1/?aid=13&q=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.ret_data.forEach((child) => {
			result.push({
				//名称
				name: child.title.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
		
				//作者
				author: child.author,
		
				//概览
				summary: child.abstract.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
		
				//封面网址
				coverUrl: child.thumb_url,
		
				//网址
				url: child.book_id
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(label) {
	var p = 1;//页数
	var limit = 20;//加载数量
	var url = JavaUtils.urlJoin(baseUrl, `https://novel.snssdk.com/api/novel/channel/homepage/new_category/book_list/v1/?parent_enterfrom=novel_channel_category.tab.&aid=1967&offset=${(p-1)*100}&limit=${limit}&category_id=${label}&gender=1`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.data.forEach((child) => {
			result.push({
				//名称
				name: child.book_name,
		
				//作者
				author: child.author,
		
				//最后章节名称
				lastChapterName: child.last_chapter_title,

				//最近更新时间
				lastUpdateTime: child.last_chapter_update_time,
		
				//概览
				summary: child.abstract,
		
				//封面网址
				coverUrl: child.thumb_url,
		
				//网址
				url: child.book_id
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(book_id) {
	const response = JavaUtils.httpRequest(`https://novel.snssdk.com/api/novel/book/directory/list/v1?device_platform=android&parent_enterfrom=novel_channel_search.tab.&aid=1967&book_id=${book_id}`);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		return JSON.stringify({
			//标题
			name: $.data.book_info.book_name,
			
			//作者
			author: $.data.book_info.author,
			
			//最近更新时间
			lastUpdateTime: $.data.book_info.last_chapter_update_time,
			
			//概览
			summary: $.data.book_info.abstract,
	
			//封面网址
			coverUrl: $.data.book_info.audio_thumb_uri,
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs($.data.item_list)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(item_list) {
	//创建章节数组
	var newChapters= [];

	const chunkSize = 100; // 要分批处理的数据量
	for (let i = 0; i < item_list.length; i += chunkSize) {
		var endIndex = Math.min(i + chunkSize, item_list.length);
		var chunk = item_list.slice(i, endIndex);

		var url = `https://novel.snssdk.com/api/novel/book/directory/detail/v1/?aid=1967&item_ids=${chunk.join('%2C')}`;
		var response = JavaUtils.httpRequest(url);
		if(response.code() == 200){
			JSON.parse(response.body().string()).data.forEach((child) => {
				newChapters.push({
					//章节名称
					name: child.title,
					//章节网址
					url: `https://novel.snssdk.com/api/novel/book/reader/full/v1/?device_platform=android&parent_enterfrom=novel_channel_search.tab.&aid=2329&platform_id=1&group_id=${child.group_id}&item_id=${child.item_id}`
				});
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
 * @returns {string} content
 */
function content(url) {
	var response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = org.jsoup.Jsoup.parse(JSON.parse(response.body().string()).data.content);
		return document.select('p:not(:matches(PGC_VOICE))').outerHtml();
	}
	return null;
}