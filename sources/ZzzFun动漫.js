function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714353,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 70,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "ZzzFun动漫",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ZzzFun动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ZzzFun动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ZzzFun动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/ZzzFun动漫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1696062359,
		
		//@NonNull 类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//@NonNull 内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://www.zzzfun.one",
		
		//启用用户登录
		enableUserLogin: true,
		
		//用户登录网址
		userLoginUrl: "http://www.zzzfun.one/index.php/user_login.html",
		
		//需要用户登录列表（search，detail，content，find）
		requiresUserLoginList: ["content"],
	});
}
const baseUrl 	= "http://service-9wjjjdsa-1251249846.gz.apigw.tencentcs.com/";

const header = '@header->Timestamp: 1696059843192@header->Authorization: 43dcb64dad05238440dd02b5feb7c327@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/*
 * 是否完成登录
 * @param {string} url		网址
 * @param {string} responseHtml	响应源码
 * @return {boolean}  登录结果
 */
function isUserLoggedIn(url, responseHtml) {
	if(url != null && responseHtml.indexOf('我的收藏') != -1){
		return true;
	}
	return false;
}
/*
 * 验证完成登录
 * @return {boolean} 登录结果
 */
function verifyUserLoggedIn() {
	const response = JavaUtils.httpRequest('http://www.zzzfun.one/index.php/user_login.html');
	if(response.code() == 200){
		if(response.body().string().indexOf('我的收藏') != -1){
			return true;
		}else{
			return false;
		}
	}
	return true;
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/release/and119/search@post->key=${encodeURI(key)}`) + header;
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			result.push({
				//名称
				name: child.videoName,
			
				//最后章节名称
				lastChapterName: child.videoremarks,
				
				//概览
				summary: child.videoClass,
				
				//封面 
				coverUrl: child.videoImg,
				
				//网址
				url: child.videoId
			})
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(id) {
	var url = JavaUtils.urlJoin(baseUrl, `/release/and119/video/list_video?userid=622214&videoId=${id}`) + header;
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var $ = JSON.parse(response.body().string());
		return JSON.stringify({
			//名称
			name: $.data.videoName,
			
			//作者
			author: $.data.up,
			
			//概览
			summary: $.data.videoDoc,
			
			//封面
			coverUrl: $.data.videoImg,
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录
			tocs: tocs($.data.videoSets)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(videoSets) {
	//创建目录数组
	var newTocs = [];

	var catalogi = 0;
	videoSets.forEach((catalog) => {
		catalogi ++;
		//创建章节数组
		var newChapters = [];
		
		catalog.list.forEach((chapter) => {
			var playids = chapter.playid.split('-');
			newChapters.push({
				//章节名称
				name: chapter.ji,
				//章节网址
				url: `http://www.zzzfun.one/vod_play_id_${playids[0]}_sid_${catalogi}_nid_${playids[1]}.html`
				//url: JavaUtils.urlJoin(baseUrl, `/and116/video/116play@post->playid=${chapter.playid}&sing=ef8b9efb7f5fcbae71578e44e2cead72&userid=622214&apptoken=2e6ae28032480d50aff549671218c82d&map=1696061565710`)
			});
		});
		newTocs.push({
			//目录名称
			name: catalog.load,
			//章节
			chapters : newChapters
		});
	});
	return newTocs
}

///zzzfun123pch/pv/2114.m3u8?sign=6f9285f0051f4dc978630a854b5d2863&t=1704334471