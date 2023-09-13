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
		version: 3,

		//搜索源自动同步更新链接
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/番茄小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1694591085,
		
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
				"label":{//男生
					"都市":"1","都市生活":"2","玄幻":"7","科幻":"8","悬疑":"10","乡村":"11","历史":"12","体育":"15","武侠":"16","影视小说":"45","文学小说":"47","生活":"48","成功励志":"56","文化历史":"62","赘婿":"25","神医":"26","战神":"27","奶爸":"42","学霸":"82","天才":"90","腹黑":"92","扮猪吃虎":"93","鉴宝":"17","系统":"19","神豪":"20","种田":"23","重生":"36","穿越":"37","二次元":"39","海岛":"40","娱乐圈":"43","空间":"44","推理":"61","洪荒":"66","三国":"67","末世":"68","直播":"69","无限流":"70","诸天万界":"71","大唐":"73","宠物":"74","外卖":"75","星际":"77","美食":"78","年代":"79","剑道":"80","盗墓":"81","战争":"97","灵异":"100","都市修真":"124","家庭":"125","明朝":"126","职场":"127","都市日常":"261","都市脑洞":"262","都市种田":"263","历史脑洞":"272","历史古代":"273","惊悚":"322","奥特同人":"367","火影":"368","反派":"369","海贼":"370","神奇宝贝":"371","网游":"372","西游":"373","漫威":"374","特种兵":"375","龙珠":"376","大秦":"377","女帝":"378","求生":"379","聊天群":"381","穿书":"382","九叔":"383","无敌":"384","校花":"385","单女主":"389","无女主":"391","都市青春":"396","架空":"452","开局":"453","综漫":"465","钓鱼":"493","囤物资":"494","四合院":"495","国运":"496","武将":"497","皇帝":"498","断层":"500","宋朝":"501","宫廷侯爵":"502","清朝":"503","抗战谍战":"504","破案":"505","神探":"506","谍战":"507","电竞":"508","游戏主播":"509","东方玄幻":"511","异世大陆":"512","高武世界":"513","灵气复苏":"514","末日求生":"515","都市异能":"516","修仙":"517","特工":"518","大小姐":"519","大佬":"520","打脸":"522","双重生":"524","同人":"538","悬疑脑洞":"539","克苏鲁":"705","衍生同人":"718","游戏体育":"746","悬疑灵异":"751","搞笑轻松":"778","官场":"788",
				},
				"label2": {//女生
					"现代言情":"3","古代言情":"5","幻想言情":"32","婚恋":"34","萌宝":"28","豪门总裁":"29","宠妻":"30","公主":"83","皇后":"84","王妃":"85","女强":"86","皇叔":"87","嫡女":"88","精灵":"89","团宠":"94","校园":"4","快穿":"24","兽世":"72","清穿":"76","虐文":"95","甜宠":"96","宫斗宅斗":"246","医术":"247","玄幻言情":"248","古言脑洞":"253","马甲":"266","现言脑洞":"267","现言复仇":"268","双男主":"275","病娇":"380","青梅竹马":"387","女扮男装":"388","民国":"390","无CP":"392","可盐可甜":"454","天作之合":"455","情有独钟":"456","虐渣":"457","护短":"458","古灵精怪":"459","独宠":"460","群穿":"461","古穿今":"462","今穿古":"463","异世穿越":"464","闪婚":"466","隐婚":"467","冰山":"468","双面":"469","替身":"470","契约婚姻":"471","豪门世家":"473","日久生情":"474","破镜重圆":"475","双向奔赴":"476","一见钟情":"477","强强":"478","带球跑":"479","逃婚":"480","暗恋":"482","相爱相杀":"483","HE":"484","职场商战":"485","明星":"486","医生":"487","律师":"488","现言萌宝":"489","厨娘":"490","毒医":"491","将军":"492","作精":"521","前世今生":"523","逃荒":"557","双洁":"702","双女主":"704","豪门爽文":"745","悬疑恋爱":"747","霸总":"748","青春甜宠":"749","职场婚恋":"750",
				},
				"label3": {//出版
					"诗歌散文":"46","社会科学":"50","名著经典":"51","科技":"52","经济管理":"53","教育":"54","推理悬疑":"61","名著":"98","外国名著":"99","国学":"116","法律":"142","两性":"274","外国文学":"397","古代文学":"398","当代文学":"399","现实小说":"400","文学理论":"401","历史":"402","世界历史":"403","历史传记":"404","人文社科":"405","哲学宗教":"406","心理学":"407","政治军事":"408","人物传记":"409","个人成长":"410","思维智商":"411","人际交往":"412","文化艺术":"413","亲子家教":"415","保健养生":"416","时尚美妆":"418","美食休闲":"419","家居旅游":"420","风水占卜":"421","经典国学":"423","学校教育":"721","成人教育":"722"
				}
			},
			"小说": {
				"男生": ["label"],
				"女生": ["label2"],
				"出版": ["label3"],
			}
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
	var p = 1;//页数
	var url = JavaUtils.urlJoin(baseUrl, `/api/novel/channel/homepage/search/search/v1/?device_platform=android&parent_enterfrom=novel_channel_search.tab.&offset=${(p-1)*10}&aid=1967&q=${encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.ret_data.forEach((child) => {
			if(child.genre == 0){//0 : 小说，1：漫画
				result.push({
					//名称
					name: child.title.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
			
					//作者
					author: child.author,
			
					//概览
					summary: child.abstract.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
			
					//类别
					//type: child.genre,

					//封面网址
					coverUrl: child.audio_thumb_uri,
			
					//网址
					url: child.book_id
				});
			}
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
	var url = JavaUtils.urlJoin(baseUrl, `/api/novel/channel/homepage/new_category/book_list/v1/?parent_enterfrom=novel_channel_category.tab.&aid=1967&offset=${(p-1)*100}&limit=${limit}&category_id=${label}&gender=1`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.data.forEach((child) => {
			if(child.genre == 0){//0 : 小说，1：漫画
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
					coverUrl: child.audio_thumb_uri,
			
					//网址
					url: child.book_id
				});
			}
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(book_id) {
	var url = JavaUtils.urlJoin(baseUrl, `/api/novel/book/directory/list/v1?device_platform=android&parent_enterfrom=novel_channel_search.tab.&aid=1967&book_id=${book_id}`);
	const response = JavaUtils.httpRequest(url);
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

		var url = JavaUtils.urlJoin(baseUrl, `/api/novel/book/directory/detail/v1/?aid=1967&item_ids=${chunk.join('%2C')}`);
		var response = JavaUtils.httpRequest(url);
		if(response.code() == 200){
			JSON.parse(response.body().string()).data.forEach((child) => {
				newChapters.push({
					//章节名称
					name: child.title,
					//章节网址
					url: JavaUtils.urlJoin(baseUrl, `/api/novel/book/reader/full/v1/?device_platform=android&parent_enterfrom=novel_channel_search.tab.&aid=2329&platform_id=1&group_id=${child.group_id}&item_id=${child.item_id}`)
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