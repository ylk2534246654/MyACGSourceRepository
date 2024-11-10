function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704076720,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "clicli",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新链接
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/clicli.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources%2Fclicli.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/clicli.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704076720,
		
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
				"最近更新": "/posts?status=public&sort=&tag=&uid=&page=1&pageSize=30"
			}
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
		}
	});
}
const baseUrl = "https://www.clicli.cc";
/**
 * https://github.com/cliclitv/app.clicli.me
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search/posts?key=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.posts.forEach((child) => {
			if("videos" in child){
				result.push({
					//名称
					name: child.title,
			
					//最近更新章节
					lastChapterName: child.sort,
					
					//最近更新时间
					lastUpdateTime: child.time,
	
					//概览
					summary: child.tag,
			
					//封面网址
					coverUrl: JavaUtils.substring(child.content,"![suo](",")"),
			
					//网址
					url: child.id
				});
			}
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(url) {
	var url = JavaUtils.urlJoin(baseUrl, url);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.posts.forEach((child) => {
			if("videos" in child){
				result.push({
					//名称
					name: child.title,
			
					//最近更新章节
					lastChapterName: child.sort,
					
					//最近更新时间
					lastUpdateTime: child.time,
	
					//概览
					summary: child.tag,
			
					//封面网址
					coverUrl: JavaUtils.substring(child.content,"![suo](",")"),
			
					//网址
					url: child.id
				});
			}
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(id) {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/post/${id}`));
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string()).result;
		return JSON.stringify({
			//标题
			name: $.title,
			
			//上传者
			author: $.uname,
		
			//最近更新章节
			lastChapterName: $.sort,
			
			//最近更新时间
			lastUpdateTime: $.time,
			
			//概览
			summary: $.summary,
	
			//封面网址
			coverUrl: JavaUtils.substring($.content,"![suo](",")"),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs($.videos)
		});
	}
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(videos) {//创建章节数组
	var newChapters = [];

	var chapters = videos.split("\n")
	for(var i = 0;i < chapters.length; i++){
		var chapter = chapters[i].split("$", 2)
		newChapters.push({
			//章节名称
			name: chapter[0],
			//章节网址
			url: chapter[1]
		});
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : newChapters
	}]
}