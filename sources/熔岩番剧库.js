function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660927525,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "熔岩番剧库",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 12,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/熔岩番剧库.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/熔岩番剧库.js",
		},

		//最近更新时间
		lastUpdateTime: 1702620617,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceOptionList: [
			{
				type: 3,
				key: "drive",
				name: "选择节点",
				entries: {
					"番剧库本地节点": 	"3A_Xinxiang",
					"CF 环大陆自选": 	"2AG_CF2",
					"CF 环大陆自选 2": 	"2AG_CF3",
					"OneDrive 新加坡":	"2AG",
					"Cloudflare":		"2AG_CF",
					"大陆加速": 		"2AG_CHUN_CDN",
					"谷歌云端硬盘每日镜像": "4AG",
				},
				defaultValue: 0
			}
		],
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: showBaseUrl,
		
		//发现
		findList: {
			category: {
				"type": ["全部","1月冬","4月春","7月夏","10月秋","SP、OVA、OAD等","三次元","其他地区","剧场版","网络动画"],
				"year": ["全部","2023年","2022年","2021年","2020年","2019年","2018年","2017年","2016年","2015年","2014年","2013年","2012年","2011年","2010年","2009年","2008年","2007年","2006年","2005年","1999年","1998年","1997年","1987年"],
			},
			"动漫": ["type","year"]
		},
		
		//启用用户登录
		enableUserLogin: true,
		
		//用户登录网址
		userLoginUrl: "https://lavani.me/user",
		
		//需要用户登录列表（search，detail，content，find）
		requiresUserLoginList: ["search","detail","content"],
	});
}
const showBaseUrl = "https://lavani.me";
const baseUrl = "https://anime-api.5t5.top";

/*
 * 是否完成登录
 * @param {string} url		网址
 * @param {string} responseHtml	响应源码
 * @return {boolean}  登录结果
 */
function isUserLoggedIn(url, responseHtml) {
	if(url != null && url.indexOf('follow/total') != -1){
		const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, "/v2/user/info" + getHeader()));
		if(response.code() == 200){
			if(response.body().string().indexOf('成功') != -1){
				return true;
			}else{
				return false;
			}
		}
	}
	return false;
}
/*
 * 验证完成登录
 * @return {boolean} 登录结果
 */
function verifyUserLoggedIn() {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, "/v2/user/info" + getHeader()));
	if(response.code() == 200){
		if(response.body().string().indexOf('成功') != -1){
			return true;
		}else{
			return false;
		}
	}
	return true;
}

function getHeader() {
	const token = JavaUtils.getLocalStorage('https://lavani.me', 'token');
	try{
		if(!JavaUtils.isEmpty(token)){
			const authorization = JSON.parse(token).value;
			return "@header->referer:https://lavani.me/@header->authorization:" + authorization;
		}
	}catch(e){
		//抛出异常
	}
	return "";
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var result = [];
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/v2/search?value=${encodeURI(key)}` + getHeader()));
	if(response.code() == 401){
		JavaUtils.setUserLoginStatus(false);
	}
	if(response.code() == 200){
		JavaUtils.setUserLoginStatus(true);
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//最近更新时间
				lastUpdateTime: child.index.year,

				//概览
				summary: child.index.type,
		
				//封面网址
				coverUrl: child.images.poster,
		
				//网址
				url: child.id
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(type, year) {
	if(type == "全部"){
		if(year == "全部"){
			year = "2023年";
		}
		type = ""
	}else if(year == "全部"){
		year = "";
	}
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/v2/index/query@post->{"year":"${year}","type":"${type}"}${getHeader()}@header->content-type:application/json`));
	var result = [];
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//最近更新时间
				lastUpdateTime: child.index.year,

				//概览
				summary: child.index.type,
		
				//封面网址
				coverUrl: child.images.poster,
		
				//网址
				url: child.id
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(id) {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/v2/anime/get?id=${id}&full=true${getHeader()}`));
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string()).data;

		return JSON.stringify({
			//标题
			name: $.name_cn,

			//最近更新时间
			lastUpdateTime: $.date,
			
			//概览
			summary: $.summary,
	
			//封面网址
			coverUrl: $.images.poster,
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(id)
		});
	}
	return JSON.stringify({
		//启用章节反向顺序
		enableChapterReverseOrder: false,
		
		//目录加载
		tocs: tocs(id)
	});
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(id) {
	//创建目录数组
	var newTocs = [];

	//目录标签请求
	//const tagResponse = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, '/v2/drive/all' + getHeader()));
	//if(tagResponse.code() == 200){
		const defaultDrive = JavaUtils.getPreference().getString("drive", "2AG_CHUN_CDN")
		//const defaultDrive = JSON.parse(tagResponse.body().string()).data.default;
		//创建章节数组
		var newChapters = [];

		//目录请求
		var url;
		if(JavaUtils.isNetworkUrl(id)){
			url = id.replace(showBaseUrl, baseUrl);
		}else{
			url = JavaUtils.urlJoin(baseUrl, '/v2/anime/file?id=' + id);
		}
		url = url + '&drive=' + defaultDrive + getHeader();

		const tocResponse = JavaUtils.httpRequest(url);
		if(tocResponse.code() == 401){
			JavaUtils.setUserLoginStatus(false);
		}
		if(tocResponse.code() == 200){
			JavaUtils.setUserLoginStatus(true);
			JSON.parse(tocResponse.body().string()).data.forEach((child2, index2) => {
				if(child2.parseResult.extensionName.type == 'video'){
					var name = child2.parseResult.episode;
					if(name == null){
						name = child2.parseResult.animeTitle;
					}else {
						name = "第" + name + "集"
					}
					newChapters.push({
						//章节名称
						name: name,

						//最近更新时间
						lastUpdateTime: child2.updated,
			
						//概览
						//summary: child2,

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
