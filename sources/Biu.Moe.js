function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652603756,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "Biu.Moe",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Biu.Moe.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Biu.Moe.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Biu.Moe.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695114620,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 5,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["音乐"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"未分类": "0",
					"动漫": "1",
					"Galgame": "2",
					"偶像": "3",
					"东方Project": "4",
					"VOCALOID": "5",
					"同人": "6",
					"纯音乐": "7",
				},
			},
			"音乐": ["label"]
		},
	});
}

const baseUrl = "https://web.biu.moe";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/index.php?m=&c=Song&a=search&data='+ encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("tbody > tr");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			var match = element.selectFirst('td:nth-child(1) > a').absUrl('href').match(/s(\d+)/);
			var id;
			if (match) {
				id = match[1];
			}
			result.push({
				//名称
				name: element.selectFirst('td:nth-child(1) > a').text().replace(element.selectFirst('td:nth-child(1) > a > span').text(),''),
				
				//作者
				author: element.selectFirst('td:nth-child(2) > a').text(),
				
				//封面网址
				coverUrl: JavaUtils.urlJoin(baseUrl, `/Song/showCover/sid/${id}`),
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, `/Song/playSID/sid/${id}`),
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
	var url = JavaUtils.urlJoin(baseUrl, `/Index/type/t/${label}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select("tbody > tr");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			var match = element.selectFirst('td:nth-child(1) > a').absUrl('href').match(/s(\d+)/);
			var id;
			if (match) {
				id = match[1];
			}
			result.push({
				//名称
				name: element.selectFirst('td:nth-child(1) > a').text().replace(element.selectFirst('td:nth-child(1) > a > span').text(),''),
				
				//作者
				author: element.selectFirst('td:nth-child(2) > a').text(),
				
				//封面网址
				coverUrl: JavaUtils.urlJoin(baseUrl, `/Song/showCover/sid/${id}`),
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, `/Song/playSID/sid/${id}`),
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 内容
 * @param {string} url
 * @return {string} url
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		return JSON.parse(response.body().string()).urlinfo.url;
	}
}

