function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660733207,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "Fastsoso",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Fastsoso.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Fastsoso.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/Fastsoso.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695125509,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 1,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 0,
		
		//分组
		group: ["网盘"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.81"
		}
	});
}

const baseUrl = "https://www.fastsoso.cc";
//备用 www.fastsoso.cn，www.fastsoso.cc

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/search?k=${encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select('[style="padding-top: 10px;"]');
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('[name="content-title"]').text(),
				
				//概览
				summary: element.selectFirst('[style="color: #105207;"]').text(),
				
				//封面网址
				//coverUrl: ,
				
				//网址
				url: element.selectFirst('[name="content-title"] > strong > a').absUrl('href'),
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content

function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const value = document.selectFirst('#avail').attr('value');
		var url2 = JavaUtils.urlJoin(baseUrl, `/file/fetch@post->check=${value}`);
		const response2 = JavaUtils.httpRequest(`${url2}@header->X-Requested-With:XMLHttpRequest@header->referer:${url}`);
		if(response2.code() == 200){
			JavaUtils.log("url3 -> " + response2.body().string());
			var $ = JSON.parse(response2.body().string());
			return JavaUtils.urlJoin('https://pan.baidu.com/', $.url);
		}
	}
}
 */