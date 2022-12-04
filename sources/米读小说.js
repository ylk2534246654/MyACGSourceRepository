function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670054692,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20221201,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 70,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "米读小说",

		//搜索源制作人
		author: "雨夏,移植",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/米读小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/米读小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/米读小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/米读小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/米读小说.js",
		},
		
		//更新时间
		updateTime: "2022年12月3日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://api.midukanshu.com",
	});
}

const header = '';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://api.midukanshu.com/fiction/search/search@post->keyword='+ encodeURI(key) + header;
	const response = httpRequest(url);
	var array = []
	const $ = JSON.parse(response);
	$.data.forEach((child) => {
		array.push({
			//标题
			title: child.title,
			
			//概览
			summary: child.author,
			
			//封面
			cover: child.cover,
			
			//网址
			url: child.book_id,
		})
	})
	return JSON.stringify(array)
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalog:{[{tag, chapter:{[{name, url}]}}]}}]}
 */
function detail(id) {
	const response = httpRequest('https://api.midukanshu.com/fiction/book/getDetail@post->book_id=' + id + header);
	const $ = JSON.parse(response)
	
	return JSON.stringify({
		//标题
		title : $.data.title,
		
		//作者
		author: $.data.author,
		
		//日期
		date : $.data.updateStatus.replace("更新于",""),
		
		//概览
		summary: $.data.description,

		//封面
		cover : $.data.coverImage.original,
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录网址/非外链无需使用
		catalog: catalog(`https://book.midukanshu.com/book/chapter_list/100/${$.data.book_id}.txt`)
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {[{tag, chapter:{[{name, url}]}}]}
 */
function catalog(url) {
	const response = httpRequest(url + header);
	
	const $ = JSON.parse(response)
	
	//创建目录数组
	var new_catalogs= [];
	//创建章节数组
	var newchapters= [];
	
	//章节代码
	$.forEach(chapter => {
		newchapters.push({
			//章节名称
			name: chapter.title,
			//章节网址
			url: `https://book.midukanshu.com/book/chapter/segment/master/${chapter.bookId}_${chapter.chapterId}.txt?md5=${chapter.content_md5}`
		})
    })
	
	//添加目录
	new_catalogs.push({
		//目录名称
		tag: '目录',
		//章节
		chapter : newchapters
	});
	return new_catalogs;
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	const $ = JSON.parse(response)
	return $.map((item)=>{ return item.content}).join("\n")
}

