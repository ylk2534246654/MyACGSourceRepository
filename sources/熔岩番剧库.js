function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660927525,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230428,
		
		//编译版本
		compileVersion: JavaUtils.JS_VERSION_1_7,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 50,//加载较慢
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "熔岩番剧库",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 8,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/熔岩番剧库.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/熔岩番剧库.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
		},

		//更新时间
		updateTime: "2023年6月25日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			"动漫": {
				"2017年": {
					"url": '/v2/index/query@post->{"year":"2017年","type":""}',
					"function": "find"
				},
				"2018年": {
					"url": '/v2/index/query@post->{"year":"2018年","type":""}',
					"function": "find"
				},
				"2019年": {
					"url": '/v2/index/query@post->{"year":"2019年","type":""}',
					"function": "find"
				},
				"2020年": {
					"url": '/v2/index/query@post->{"year":"2020年","type":""}',
					"function": "find"
				},
				"2021年": {
					"url": '/v2/index/query@post->{"year":"2021年","type":""}',
					"function": "find"
				},
				"2022年": {
					"url": '/v2/index/query@post->{"year":"2022年","type":""}',
					"function": "find"
				}
			}
		},
		
		//是否启用登录
		isEnabledLogin: true,
		
		//登录网址
		loginUrl: "https://lavani.me/auth/login",
		
		//需要登录的功能（search，detail，content，find）
		requiresLoginList: ["search","detail","content"],
	});
}
const baseUrl = "https://anime-api.5t5.top";

/*
 * 是否完成登录
 * @param {string} url		网址
 * @param {string} responseHtml	响应源码
 * @return {boolean}  登录结果
 */
function isUserLoggedIn(url, responseHtml) {
	if(url != null && url.indexOf('total') != -1){
		return verifyUserLoggedIn();
	}
	return false;
}
/*
 * 验证完成登录
 * @return {boolean} 登录结果
 */
function verifyUserLoggedIn() {
	try{
		const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, "/v2/user/info" + getHeader()));
		if(response.code() == 200){
			if(response.body().string().indexOf('成功') != -1){
				return true;
			}
		}
	} catch (err){
		//抛出错误
	}
	return false;
}

function getHeader() {
	const token = JavaUtils.getLocalStorage('https://lavani.me', 'token');
	const authorization = JSON.parse(token).value;
	return "@header->referer:https://lavani.me/@header->authorization:" + authorization;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var result = [];
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/v2/search?value=${encodeURI(key)}` + getHeader()));
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//概览
				summary: child.index.type + '\n' + child.index.year,
		
				//封面网址
				coverUrl: child.images.large,
		
				//网址
				url: JavaUtils.urlJoin(baseUrl, '/v2/anime/file?id=' + child.id)
			});
		});
	}
	return JSON.stringify(result);
}
/**
 * 发现
 * @param {string} url
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(url) {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, url + getHeader() + '@header->content-type:application/json'));
	var result = [];
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//概览
				summary: child.index.type + '\n' + child.index.year,
		
				//封面网址
				coverUrl: child.images.large,
		
				//网址
				url: JavaUtils.urlJoin(baseUrl, '/v2/anime/file?id=' + child.id)
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	return JSON.stringify({
		//是否启用将章节置为倒序
		isEnabledChapterReverseOrder: false,
		
		//目录加载
		tocs: tocs(url)
	});
}
/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(url) {
	//创建目录数组
	var newTocs = [];

	//目录标签请求
	//const tagResponse = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, '/v2/drive/all' + getHeader()));
	//if(tagResponse.code() == 200){
		const defaultDrive = '2AG_CHUN_CDN'
		//const defaultDrive = JSON.parse(tagResponse.body().string()).data.default;
		//创建章节数组
		var newChapters = [];

		//目录请求
		const tocResponse = JavaUtils.httpRequest(url + '&drive=' + defaultDrive + getHeader());
		if(tocResponse.code() == 200){
			JSON.parse(tocResponse.body().string()).data.forEach((child2, index2) => {
				if(child2.parseResult.extensionName.type == 'video'){
					newChapters.push({
						//章节名称
						name: String(child2.parseResult.episode),
						//章节网址
						url: child2.url
					});
				}
			});
			//
			//添加目录
			newTocs.push({
				//目录名称
				name: defaultDrive,
				//章节
				chapters : newChapters
			});
		}
	//}
	return newTocs;
}