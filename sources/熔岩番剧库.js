function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660927525,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230122,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 80,//加载较慢
		
		//是否失效，默认关闭
		//true: 无法添加，并且已安装的无法直接使用，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "熔岩番剧库",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/熔岩番剧库.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/熔岩番剧库.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
		},

		//更新时间
		updateTime: "2023年1月6日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://anime-api.5t5.top",
		
		//发现
		findList: {
			"动漫": {
				"2017年": {
					"url":'https://anime-api.5t5.top/v2/index/query@post->{"year":"2017年","type":""}',
					"function":"find"
				},
				"2018年": {
					"url":'https://anime-api.5t5.top/v2/index/query@post->{"year":"2018年","type":""}',
					"function":"find"
				},
				"2019年": {
					"url":'https://anime-api.5t5.top/v2/index/query@post->{"year":"2019年","type":""}',
					"function":"find"
				},
				"2020年": {
					"url":'https://anime-api.5t5.top/v2/index/query@post->{"year":"2020年","type":""}',
					"function":"find"
				},
				"2021年": {
					"url":'https://anime-api.5t5.top/v2/index/query@post->{"year":"2021年","type":""}',
					"function":"find"
				},
				"2022年": {
					"url":'https://anime-api.5t5.top/v2/index/query@post->{"year":"2022年","type":""}',
					"function":"find"
				}
			}
		},
		
		//登录授权是否启用
		auth: true,
		
		//登录授权网址
		authUrl:"https://lavani.me/auth/login",
		
		//需要授权的功能（search，detail，content，find）
		authRequired: ["search","detail","content"],
	});
}
/*
 * 拦截并验证手动授权数据
 * @params {string} html	网页源码
 * @params {string} url		网址
 * @returns 是否授权
 */
function authCallback(html,url) {
	if(html.length > 1 && html.indexOf('登录成功, 欢迎回来') != -1){
		return true;
	}
	return false;
}
/*
 * 自动验证授权结果
 * @returns 是否授权
 */
function authVerify() {
	const response = httpRequest("https://anime-api.5t5.top/v2/user/info" + getHeader());
	if(response.indexOf('成功') != -1){
		return true;
	}
	return false;
}

var localStorage;
function getHeader() {
	if(localStorage == null)localStorage = ToolUtil.localStorage('https://lavani.me/favicon.ico');
	const authorization = JSON.parse(localStorage.getString('token')).value;
	return "@header->referer:https://lavani.me/@header->authorization:" + authorization;
}

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = `https://anime-api.5t5.top/v2/search?value=${encodeURI(key)}` + getHeader();
	var response = httpRequest(url);
	var array= [];
	const $ = JSON.parse(response);
	$.data.forEach((child) => {
		array.push({
			//标题
			title: child.title,
	
			//概览
			summary: child.index.type + '\n' + child.index.year,
	
			//封面
			cover: child.images.large,
	
			//网址
			url: 'https://anime-api.5t5.top/v2/anime/file?id=' + child.id
		});
	});
	return JSON.stringify(array);
}
/**
 * 发现
 * @params {string} url
 * @returns {[{title, summary, cover, url}]}
 */
function find(url) {
	const response = httpRequest(url + getHeader() + '@header->content-type:application/json');
	var array= [];
	const $ = JSON.parse(response);
	$.data.forEach((child) => {
		array.push({
			//标题
			title: child.title,
	
			//概览
			summary: child.index.type + '\n' + child.index.year,
	
			//封面
			cover: child.images.large,
	
			//网址
			url: 'https://anime-api.5t5.top/v2/anime/file?id=' + child.id
		});
	});
	return JSON.stringify(array);
}

/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalogs:{[{name, chapters:{[{name, url}]}}]}}]}
 */
function detail(url) {
	return JSON.stringify({
		//目录是否倒序
		reverseOrder: false,
		
		//目录加载
		catalogs: catalogs(url)
	});
}
/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(url) {
	const tagResponse = httpRequest('https://anime-api.5t5.top/v2/drive/all' + getHeader());
	
	//创建目录数组
	var newCatalogs = [];
	
	JSON.parse(tagResponse).data.list.forEach((child,index) => {
		//创建章节数组
		var newChapters = [];
		JSON.parse(httpRequest(url + '&drive=' + child.id + getHeader())).data.forEach((child2,index2) => {
			if (typeof child2.episode == 'string') {
				newChapters.push({
					//章节名称
					name: child2.episode,
					//章节网址
					url: child2.url
				});
			}else{
				newChapters.push({
					//章节名称
					name: child2.name,
					//章节网址
					url: child2.url
				});
			}
		});
		//
		//添加目录
		newCatalogs.push({
			//目录名称
			name: child.name,
			//章节
			chapters : newChapters
		});
	});
	
	return newCatalogs;
}