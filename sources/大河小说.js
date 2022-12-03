function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660720873,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: true,
		
		//@NonNull 搜索源名称
		name: "大河小说",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/大河小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/大河小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/大河小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/大河小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/大河小说.js",
		},
		
		//更新时间
		updateTime: "2022年12月3日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://api.rcwk.net",
	});
}

const header = '';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = `https://api.rcwk.net/037/search.php?page_index=1&keyword=${encodeURI(key)}&page_size=15` + header;
	const response = httpRequest(url);
	const array = [];
    const $ = JSON.parse(response)
	$.Data.DataList.map(book => {
        array.push({
			//标题
            title: book.book_name,
			
			//概览
            summary: book.book_author,
			
			//封面
			cover : ToolUtil.urlJoin(url,book.book_img),
			
			//网址
            url: ToolUtil.urlJoin(url,`/037/book.php?aid=${book.book_id}`),
        })
    })
    return JSON.stringify(array)
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalog:{[{tag, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url + header);
    const $ = JSON.parse(response)
    const book = {
		//标题
		title: $.Data.book.book_name,
		
		//作者
		author: $.Data.book.book_author,

		//日期
        date: $.Data.book.create_time,
		
		//概览
		summary: $.Data.book.book_type_name,
		
		//封面
		cover: $.Data.book.book_img,
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录链接/非外链无需使用
        catalog: catalog(ToolUtil.urlJoin(url,`/037/chapters.php?page_index=&aid=${$.Data.book.book_id}&order=asc&page_size=9999999`),$.Data.book.book_id),
    }
    return JSON.stringify(book)
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {[{tag, chapter:{[{name, url}]}}]}
 */
function catalog(url,book_id) {
	const response = httpRequest(url + header);
	
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
		
	//章节代码
	const $ = JSON.parse(response)
    $.Data.map(chapter => {
        newchapters.push({
			//章节名称
            name: chapter.chapter_name,
			//章节链接
            url: ToolUtil.urlJoin(url,`/037/chapter.php?query_direction=current&aid=${book_id}&cid=${chapter.chapter_index}`),
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
    const $ = JSON.parse(response);
    return $.Data.chapter_content;
}

