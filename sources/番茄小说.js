function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1675045639,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "番茄小说",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/番茄小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/番茄小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/番茄小说.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			"都市": "1",
			"玄幻": "7",
			"科幻": "8",
			"悬疑": "10",
			"历史": "12",
			"武侠": "16",
			"系统": "19",
			"神豪": "20",
			"种田": "23",
			"赘婿": "25",
			"神医": "26",
			"重生": "36",
			"穿越": "37",
			"动漫": "57",
			"末世": "68",
			"直播": "69",
			"无限": "70",
			"诸天": "71",
			"盗墓": "81",
			"灵异": "100",
			"聊天": "381",
			"无敌": "384",
			"校花": "385",
		},
	});
}

const baseUrl = "https://novel.snssdk.com";
const header = '@header->user-agent:Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/109.0.0.0';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtil.urlJoin(baseUrl,'/api/novel/channel/homepage/search/search/v1/?aid=13&q=' + encodeURI(key) + header);
	const response = httpRequest(url);
	var array= [];
	const $ = JSON.parse(response);
	$.data.ret_data.forEach((child) => {
		array.push({
			//标题
			title: child.title.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
	
			//概览
			summary: child.abstract.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
	
			//封面网址
			coverUrl: child.thumb_url,
	
			//网址
			url: child.book_id
		});
	});
	return JSON.stringify(array);
}

/**
 * 发现
 * @params {string} url
 * @returns {[{title, summary, coverUrl, url}]}
 */
function find(id) {
	const response = httpRequest(`https://api5-normal-lf.fqnovel.com/reading/bookapi/new_category/landing/v/?genre_type=0&limit=10&source=front_category&category_id=${id}&offset=%3C,1%3E&query_gender=1&iid=1099935039893805&aid=1967&app_name=novelapp&version_code=287` + header);
	var array= [];
	const $ = JSON.parse(response);
	$.data.book_info.forEach((child) => {
		array.push({
			//标题
			title: child.book_name.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
	
			//概览
			summary: child.abstract.replace(new RegExp('<em>','g'),'').replace(new RegExp('</em>','g'),''),
	
			//封面网址
			coverUrl: child.thumb_url,
	
			//网址
			url: child.book_id
		});
	});
	return JSON.stringify(array);
}

/**
 * 详情
 * @returns {[{title, author, date, summary, coverUrl, isReverseOrder, catalogs:{[{name, chapters:{[{name, url}]}}]}}]}
 */
function detail(book_id) {
	const response = httpRequest(`https://api5-normal-lf.fqnovel.com/reading/bookapi/directory/all_items/v/?need_version=true&book_id=${book_id}&iid=2665637677906061&aid=1967&app_name=novelapp&version_code=495` + header);

	const $ = JSON.parse(response);
	return JSON.stringify({
		//标题
		title : $.data.book_info.book_name,
		
		//作者
		author: $.data.book_info.author,
		
		//日期
		//date: $.data.book_info.,
		
		//概览
		//summary: $.data.book_info.,

		//封面网址
		coverUrl: $.data.book_info.thumb_url,
		
		//目录是否倒序
		isReverseOrder: false,
		
		//目录网址/非外链无需使用
		catalogs: catalogs($.data)
	});
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(data) {
	//创建章节数组
	var newChapters= [];
	
	if(data.catalog_data != null){
		var groupName;//分组名称
		data.catalog_data.forEach((child) => {
			if(child.parent_catalog_id == null){
				groupName = child.catalog_title;
			}else{
				newChapters.push({
					//章节名称
					name: groupName + " " + child.catalog_title,
					//章节网址
					url: `https://novel.snssdk.com/api/novel/book/reader/full/v1/?group_id=${child.item_id}&item_id=${child.item_id}&aid=2022`
				});
			}
		});
	}else{
		data.item_data_list.forEach((child) => {
			newChapters.push({
				//章节名称
				name: child.title,
				//章节网址
				url: `https://novel.snssdk.com/api/novel/book/reader/full/v1/?group_id=${child.item_id}&item_id=${child.item_id}&aid=2022`
			});
		});
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
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	
	var document = org.jsoup.Jsoup.parse(JSON.parse(response).data.content);
	return document.select('p:not(:matches(PGC_VOICE))').outerHtml();
}