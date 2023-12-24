function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652588501,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,
		
		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "ACG.RIP",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ACG.RIP.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ACG.RIP.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ACG.RIP.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/ACG.RIP.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1703401010,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 1,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["种子"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: "https://acgrip.art",
		
		//发现
		findList: {
			"动画": "https://acgrip.art/1",
			"日剧": "https://acgrip.art/2",
			"音乐": "https://acgrip.art/4"
		},
	});
}

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://acgrip.art/?term=' + encodeURI(key);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("tbody > tr");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('span.title > a').text(),
				
				//概览
				summary: element.selectFirst('td.size').text(),
				
				//封面网址
				coverUrl: 'https://acgrip.art/favicon.ico',
				
				//网址
				url: element.selectFirst('span.title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @params string html
 * @returns {[{title, introduction, cover, url}]}
 */
function find(url) {
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("tbody > tr");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('span.title > a').text(),
				
				//概览
				summary: element.selectFirst('td.size').text(),
				
				//封面网址
				coverUrl: 'https://acgrip.art/favicon.ico',
				
				//网址
				url: element.selectFirst('span.title > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}