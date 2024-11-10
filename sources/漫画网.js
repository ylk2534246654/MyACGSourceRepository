function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1724911356,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,
		
		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "漫画网",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/漫画网.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/漫画网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/漫画网.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1724911356,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.manhua3.com",

		//发现
		findList: {
			category: {
				"region": {
					"全部":"",
					"日本": "2",
					"国产": "1",
					"韩国": "3",
					"欧美": "4",
				},
				"label": {
					"全部":"",
                    "韩国":"528",
                    "咚漫":"529",
                    "原创":"531",
                    "异形":"532",
                    "偶像":"533",
                    "歌舞":"534",
                    "宅斗":"536",
                    "宅向":"538",
                    "青春":"539",
                    "西幻":"540",
                    "冒险":"541",
                    "恋爱":"542",
                    "都市":"543",
                    "其它":"544",
                    "战斗":"545",
                    "其他":"546",
                    "灵异":"547",
                    "科幻":"548",
                    "纯爱":"549",
                    "现代":"550",
                    "总裁":"551",
                    "推理":"552",
                    "职场":"553",
                    "剧情":"554",
                    "校园":"555",
                    "穿越":"556",
                    "古风":"558",
                    "逆袭":"557",
                    "玄幻":"559",
                    "热血":"560",
                    "权谋":"561",
                    "正能量":"562",
                    "复仇":"563",
                    "悬疑":"564",
                    "奇幻":"565",
                    "搞笑":"566",
                    "日常":"567",
                    "亲情":"569",
                    "大女主":"568",
                    "战争":"570",
                    "脑洞":"571",
                    "社会":"572",
                    "重生":"573",
                    "怪物":"574",
                    "女神":"575",
                    "多世界":"576",
                    "异能":"577",
                    "治愈":"578",
                    "浪漫":"579",
                    "魔幻": "580",
				},
				"order": {
					"时间排序": "addtime",
					"人气排序": "hits",
					"评分排序": "score",
				},
			},
			default: ["region","label","order"]
		},
	});
}

/**
 * mhuab_znqfonjz0s@aka.yeah.net
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), '/search?key=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".module-items > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.module-poster-item-title').text(),
				
				//作者
				//author: element.selectFirst('').text(),

				//最后章节名称
				lastChapterName: element.selectFirst('.module-item-note').text(),
				
				//概览
				//summary: element.selectFirst('').text(),

				//封面网址
				coverUrl: element.selectFirst('.lazy').absUrl('data-original'),
				
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
function find(region, label, order) {
	var url = JavaUtils.urlJoin(JavaUtils.getManifest().getBaseUrl(), `/category/order/${order}`);
    if(region != "")url = url + "/list/" + region;
    if(label != "")url = url + "/tags/" + label;
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".module-items > a");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.module-poster-item-title').text(),
				
				//作者
				//author: element.selectFirst('').text(),

				//最后章节名称
				lastChapterName: element.selectFirst('.module-item-note').text(),
				
				//概览
				//summary: element.selectFirst('').text(),

				//封面网址
				coverUrl: element.selectFirst('.lazy').absUrl('data-original'),
				
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
			name: document.selectFirst('h1 > strong').text(),
			
			//作者
			author: document.selectFirst('.module-info-items > div:nth-child(2) > div').text(),
			
			//更新时间
			//lastUpdateTime: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.module-info-introduction-content > p').text(),
	
			//封面网址
			//coverUrl: document.selectFirst('').absUrl(''),
			
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
	var chapterElements = document.select('.module-play-list-link');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
	}
	return [{
		//目录名称
		name: '目录',
		//章节
		chapters : newChapters
	}];
}

/**
 * 内容
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
        var DATA = JavaUtils.substring(response.body().string(), "DATA='","'");
        var hexData = JavaUtils.bytesToHexString(JavaUtils.base64Decode(DATA));
        var iv = hexData.substring(0,32);
        var decrypted = hexData.substring(32);
	    var json = JavaUtils.bytesToStr(JavaUtils.decryptAES(JavaUtils.hexStringToBytes(decrypted), "9S8$vJnU2ANeSRoF","AES/CBC/PKCS5Padding", JavaUtils.hexStringToBytes(iv)))
        var newImgs = []
        JSON.parse(json).images.forEach((child) => {
			newImgs.push(child.url)
		});
		return JSON.stringify(newImgs);
	}
	return null;
}