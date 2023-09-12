function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652586404,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,
		
		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "90漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 6,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/90漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/90漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/90漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/90漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1694527150,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}
const baseUrl = "https://api.90mh.com";
const baseImgUrl = "https://js.tingliu.cc";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/app/comic/search?sort=click&keywords=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.items.forEach((child) => {
			result.push({
				//名称
				name: child.name,
		
				//概览
				summary: child.last_chapter_name,
		
				//封面网址
				coverUrl: JavaUtils.urlJoin(baseImgUrl, child.cover),
		
				//网址
				url: JavaUtils.urlJoin(baseUrl, '/app/comic/view?id=' + child.id)
			})
		})
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		return JSON.stringify({
			//名称
			name : $.data.title,
			
			//作者
			author: $.data.author,
			
			//概览
			summary: $.data.description,

			//封面网址
			coverUrl: JavaUtils.urlJoin(baseImgUrl, $.data.cover),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(response)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(response) {
	//创建章节数组
	var newChapters= [];
	
	var chapters = response.body().jsonDocument().read('$.data.chapterGroup.*.*');
	const $ = JSON.parse(chapters)
	$.forEach((child) => {
		newChapters.push({
			//章节名称
			name: child.name,
			//章节网址
			url: JavaUtils.urlJoin(baseUrl, '/app/chapter/view?id=' + child.id)
		});
	})
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : newChapters
	}];
}

/**
 * 内容
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		var newImageArray= [];
		$.data.imageArray.forEach((child) => {
			newImageArray.push(JavaUtils.urlJoin(baseImgUrl, $.data.path + child));
		})
		return JSON.stringify(newImageArray);
	}
	return null;
}
