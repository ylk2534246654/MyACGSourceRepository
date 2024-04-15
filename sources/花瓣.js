function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660827508,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "花瓣",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/花瓣.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/花瓣.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/花瓣.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695277279,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 6,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["图片"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"全部": "",
					"插画": "illustration",
					"摄影": "photography",
					"游戏": "games",
					"动漫": "anime",
				},
			},
			default: ["label"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.81"
		}
	})
}

const baseUrl = "https://hbimg.huaban.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	const url = `http://api.huaban.com/search?q=${encodeURI(key)}&per_page=36&page=1&sort=all`;
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).pins.forEach((child) => {
			result.push({
				//名称
				name: child.raw_text,
		
				//概览
				summary: child.board.title,

				//封面网址
				coverUrl: JavaUtils.urlJoin(baseUrl, child.file.key),
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, child.file.key),
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
	var url = `https://huaban.com/discovery/${label}`;
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".Cndo32CN");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.DayXcpjF').attr("data-content-id"),
				
				//概览
				summary: element.selectFirst('.tZlqrdtT > a').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.DayXcpjF > a > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.hb-image').absUrl('src').split("_")[0]
			});
		}
	}
	return JSON.stringify(result);
}