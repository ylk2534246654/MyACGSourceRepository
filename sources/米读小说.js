function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670054692,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 70,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "米读小说",

		//搜索源作者
		author: "雨夏,移植",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/米读小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/米读小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/米读小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/米读小说.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695218158,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}

const baseUrl = "https://api.midukanshu.com";
const bookBaseUrl = "https://book.midukanshu.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/fiction/search/search@post->keyword=' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.forEach((child) => {
			result.push({
				//名称
				name: child.title,
				
				//作者
				author: child.author,
				
				//概览
				summary: child.description,

				//封面网址
				coverUrl: child.cover,
				
				//网址
				url: child.book_id,
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
	var url = JavaUtils.urlJoin(baseUrl, `/fiction/book/getDetail@post->book_id=${id}`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		return JSON.stringify({
			//标题
			name: $.data.title,
			
			//作者
			author: $.data.author,
			
			//最近更新时间
			lastUpdateTime: $.currentTime,
			
			//概览
			summary: $.data.description,
	
			//封面网址
			coverUrl: $.data.coverImage.original,
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs($.data.book_id)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(id) {
	var url = JavaUtils.urlJoin(bookBaseUrl, `/book/chapter_list/100/${id}.txt`);
	const response = JavaUtils.httpRequest(url);
	//创建章节数组
	var newChapters = [];
	if(response.code() == 200){
		JSON.parse(response.body().string()).forEach(chapter => {
			newChapters.push({
				//章节名称
				name: chapter.title,

				//章节网址
				url: JavaUtils.urlJoin(bookBaseUrl, `/book/chapter/segment/master/${chapter.bookId}_${chapter.chapterId}.txt?md5=${chapter.content_md5}`)
			})
		})
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters: newChapters
	}];
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		return $.map((item)=>{ return item.content}).join("\n")
	}
}