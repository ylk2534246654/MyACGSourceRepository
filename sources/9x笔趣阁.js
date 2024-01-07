function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660118962,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "9x笔趣阁-小说",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 6,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/9x笔趣阁.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/9x笔趣阁.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/9x笔趣阁.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/9x笔趣阁.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704619369,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceOptionList: [
			{
				type: 3,
				key: "baseUrl",
				name: "不能加载尝试切换线路",
				entries: {
					"elklk": "https://novel-api.elklk.cn",
					"xiaoppkk": "https://novel-api.xiaoppkk.com",
					"xiaoxiaommkk": "https://novel-api.xiaoxiaommkk.com",
					"xiaoshuottaa": "https://novel-api.xiaoshuottaa.com",
					"qwezxc4": "https://novelapi.qwezxc4.cn",
				},
				defaultValue: 2
			}
		],
		
		//分组
		group: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"玄幻奇幻": "1",
					"武侠仙侠": "2",
					"都市言情": "3",
					"历史军事": "4",
					"科幻灵异": "5",
					"网游竞技": "6",
					"女生频道": "7",
					"同人小说": "66",
				},
				"order": {
					"热门榜": "zuire",
					"完结榜": "wanjie",
					"新书榜": "xinshu",
					"推荐榜": "tuijian",
				}
			},
			"小说": ["label","order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64",
		}
	});
}

const baseUrl = JavaUtils.getPreference().getString("baseUrl", "https://novel-api.xiaoxiaommkk.com");
/**
 * 备份：
 * 200669.com
 * gfnormal05at.com
 * nso92.xsafetech.com
 * novel-api.xiaoppkk.com
 * novel-api.elklk.cn
 * novel-api.xiaoshuottaa.com
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/api/category-search?name=${encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(_toString(response.body().string())).result.list.forEach((child) => {
			result.push({
				//名称
				name: child.name,
		
				//作者
				author: child.author,

				//概览
				summary: child.description,

				//封面网址
				coverUrl: child.icon,
		
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
function find(label, order) {
	var url = JavaUtils.urlJoin(baseUrl, `/cdn/category/rankList/1/${label}/${order}/all/1.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(_toString(response.body().string())).result.list.forEach((child) => {
			result.push({
				//名称
				name: child.name,
		
				//作者
				author: child.author,

				//概览
				summary: child.description,

				//封面网址
				coverUrl: child.icon,
		
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
	//兼容网址
	if(JavaUtils.isValidUrl(id)){
		const match = id.match(/book-id-(\d+)/);
		if (match) {
			id = match[1];
		}
	}
	var url = JavaUtils.urlJoin(baseUrl, `/api/book-info?id=${id}&source_id=1`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var book = JSON.parse(_toString(response.body().string())).result.book;
		return JSON.stringify({
			//名称
			name: book.name,
			
			//作者
			author: book.author,
			
			//最近更新时间
			lastUpdateTime: book.mtime,
			
			//概览
			summary: book.description,
	
			//封面网址
			coverUrl: book.icon,
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(id)
		});
	}
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(id) {
	var url = JavaUtils.urlJoin(baseUrl, `/cdn/book/chapterList/${id}.html`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		//创建章节数组
		var newChapters = [];
		JSON.parse(_toString(response.body().string())).result.list.forEach((child1) => {
			child1.list.forEach((child2) => {
				var time = null;
				if(child2.mtime != null && child2.mtime > 0){
					time = child2.mtime
				}else {
					time = "---"
				}
				newChapters.push({
					//章节名称
					name: child2.name,

					//最近更新时间
					lastUpdateTime: time,

					//章节网址
					url: JavaUtils.urlJoin(baseUrl, child2.url.replace(/https:\/\/contentxs\.pysmei\.com\/BookFiles\/Html\/(\d+)\/(\d+)\/(\d+)\.html/, '/cdn/book/content/$2/$3.html'))
				});
			});
		});

		return [{
			//目录名称
			name: "目录",
			//章节
			chapters : newChapters
		}];
	}
	return null;
}
/**
 * 移植请注明出处
 * @platform	MyACG
 * @author	雨夏
 */
/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		return com.jayway.jsonpath.JsonPath.parse(_toString(response.body().string())).read("$..content").get(0);
	}
}
/**
 * 解密
 * @param {byte[]} data
 * @return 结果
 */
function _toString(word) {
	if(word != null && word.indexOf("JP2") != -1){
		var start = JavaUtils.substring(word, "", "JP2")
		if(start != null){
			//JavaUtils.log("word->" + word.substring(0, 10) + "..." + String(word).substring(String(word).length - 10));
			word = String(word).substring(String(start).length, String(word).length - String(start).length - 1)
			//JavaUtils.log("word->" + word.substring(0, 10) + "..." + String(word).substring(String(word).length - 10));
		}
		return JavaUtils.bytesToStr(JavaUtils.decryptAES(JavaUtils.base64Decode(word), "6CB1E21E","DES/CBC/PKCS5Padding", "1F0FB845"))
	}
	return word
}