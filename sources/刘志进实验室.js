function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714515,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "刘志进实验室",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/刘志进实验室.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/刘志进实验室.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/刘志进实验室.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1702620617,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 5,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["音乐"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"x-requested-with": "XMLHttpRequest",
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

const baseUrl = "https://music.163.com";
const searchBaseUrl = "https://music.liuzhijin.cn";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(searchBaseUrl, `/@post->input=${encodeURI(key)}&filter=name&type=netease&page=1`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JavaUtils.log(response.body().string());
		JSON.parse(response.body().string()).data.forEach((child) => {
			result.push({
				//名称
				name: child.title,
				
				//作者
				author: child.author,

				//封面网址
				coverUrl: child.pic,
				
				//网址
				url: child.url,
			})
		});
	}
	return JSON.stringify(result);
}

/**
 * 内容
 * @params {string} url
 * @returns {string} url
 */
function content(url) {
	return url;
}