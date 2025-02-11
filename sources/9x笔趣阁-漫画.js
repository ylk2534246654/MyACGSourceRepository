function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704597943,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,

		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "9x笔趣阁-漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/9x笔趣阁-漫画.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/9x笔趣阁-漫画.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/9x笔趣阁-漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1737030154,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceList: [
			{
				type: 3,
				key: "baseUrl",
				name: "切换线路",
				summary: "不能加载的时候可以切换",
				itemList: {
					"kpkpo": "https://novelapi.kpkpo.com",
				},
				defaultValue: 0
			}
		],
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"都市": "11",
					"脑洞": "57",
					"职场": "59",
					"重生": "72",
					"日漫": "83",
					"彩虹": "105",
					"宫廷": "52",
					"推理": "58",
					"江湖": "61",
					"大女主": "74",
					"纯爱": "101",
					"妖怪": "116"
				},
				"order": {
					"最热": "&rank_type=1",
					"评分": "&rank_type=2",
					"完结": "&is_finish=1",
					"最新": "&is_finish=2",
				}
			},
			"漫画": ["label","order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64",
		}
	});
}

const baseUrl = JavaUtils.getPreference().getString("baseUrl", "https://novelapi.kpkpo.com");
const imgPath = "/api/ComicBook-DecodeImage?path=";
/**
 * 备份：
 * 200669.com
 * gfnormal05at.com
 * nso92.xsafetech.com
 * novel-api.xiaoppkk.com
 * novel-api.elklk.cn
 * novel-api.xiaoshuottaa.com
 * novelapi.bayliline.com
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/api/ComicBookSearch-Search?name=${encodeURI(key)}`);
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
				coverUrl: JavaUtils.urlJoin(baseUrl, imgPath + `${child.icon}@imageDecoderFunctionName->decrypt`),
		
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
	var url = JavaUtils.urlJoin(baseUrl, `/api/ComicBookSearch-TagsRankList?tag_id=${label}${order}&page=1`);
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
				coverUrl: JavaUtils.urlJoin(baseUrl, imgPath + `${child.icon}@imageDecoderFunctionName->decrypt`),
		
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
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/api/ComicBook-Info?id=${id}`));
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
			coverUrl: JavaUtils.urlJoin(baseUrl, imgPath + `${book.icon}@imageDecoderFunctionName->decrypt`),
			
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
	var url = JavaUtils.urlJoin(baseUrl, `/api/ComicBook-ChapterList?book_id=${id}`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		//创建章节数组
		var newChapters = [];
		JSON.parse(_toString(response.body().string())).result.list.forEach((child) => {
			newChapters.push({
				//章节名称
				name: child.name,

				//最近更新时间
				//lastUpdateTime: child.update_at,
				
				//章节网址
				url: JavaUtils.urlJoin(baseUrl, `/api/ComicBook-Content?book_id=${id}&chapter_id=${child.id}`)
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
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var urls = []
		JSON.parse(_toString(response.body().string())).result.info.content.forEach((child) => {
			urls.push(JavaUtils.urlJoin(baseUrl, imgPath + `${child.content_key}@imageWidth->${child.content_width}@imageHeight->${child.content_height}@imageDecoderFunctionName->decrypt`));
		});
		return JSON.stringify(urls);
	}
}
/**
 * 移植请注明出处
 * @platform	MyACG
 * @author	雨夏
 */
/**
 * 解码
 * @param {byte[]} data
 * @return 结果
 */
function decrypt(data) {
	return JavaUtils.decryptAES(data,"whoisyourdadbaby","AES/ECB/PKCS5Padding", "");
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