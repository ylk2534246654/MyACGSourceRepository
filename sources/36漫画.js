function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1658148697,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,
		
		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "36漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/36漫画.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/36漫画.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/36漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1696057569,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		/*首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceList: [
			{
				type: 3,
				key: "drive",
				name: "选择节点",
				itemList: {
					"节点1": "pigqq.com",
					"节点2": "pysmei.com",
				},
				defaultValue: 0
			}
		],
		*/

		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"label": {
					"男生": "1",
					"女生": "2",
					"爆笑": "3",
					"热血": "4",
					"冒险": "5",
					"恐怖": "6",
					"科幻": "7",
					"魔幻": "8",
					"玄幻": "9",
					"悬疑": "10",
					"推理": "11",
					"武侠": "12",
					"格斗": "13",
					"战争": "14",
					"历史": "15",
					"竞技": "16",
					"动作": "17",
					"惊险": "18",
					"侦探": "19",
					"奇幻": "20",
					"权谋": "21",
					"校园": "22",
					"后宫": "23",
					"萌系": "24",
					"都市": "25",
					"恋爱": "26",
					"蔷薇": "27",
					"同人": "28",
					"励志": "29",
					"百合": "30",
					"治愈": "31",
					"纯爱": "32",
					"美食": "33",
					"恶搞": "34",
					"虐心": "35",
					"生活": "36",
					"唯美": "37",
					"震撼": "38",
					"复仇": "39",
					"脑洞": "40",
					"宫斗": "41",
					"运动": "42",
					"青春": "43",
					"穿越": "44",
					"古风": "45",
					"明星": "46",
					"社会": "47",
					"浪漫": "48",
					"其他": "49",
				},
				"order": {
					"热门榜": "hot",
					"完结榜": "over",
					"新书榜": "new",
					"评分榜": "vote",
				},
				"order2": {
					"热门榜": "hot",
					"完结榜": "over",
					"推荐榜": "commend",
					"新书榜": "new",
					"评分榜": "vote",
					"收藏榜": "collect",
				},
			},
			"漫画": ["label","order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}
const drive 	= "pigqq.com";//JavaUtils.getPreference().getString("drive", "pigqq.com")

const baseUrl 	= "https://tp." + drive;
//备用：infosmanhua.apptuxing_com ，pysmei_com ，pigqq_com , leeyegy.com

const searchBaseUrl 	= "https://ssmh.pigqq.com";
//备用：soumh.pigqq_com ，leeyegy_com , pysmei_com

//const imgBaseUrl 	= "https://imgapixs.pysmei.com";
//const imgUrl 	= "https://imgapixs.pysmei.com/bookfiles/bookimages/";

const findBaseUrl = "https://tp." + drive;
//备用：scmanhua.

const contentBaseUrl = "https://tp." + drive;
//备用：contentmanhua.

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(searchBaseUrl, `/search.aspx?key=${encodeURI(key)}&page=1&siteid=manhuaapp2`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			result.push({
				//名称
				name: _toString(child.Name),
				
				//概览
				summary: _toString(child.Author),
				
				//封面
				coverUrl: child.Img + '@imageDecoderFunctionName->decrypt',
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, `/BookFiles/Html/${parseInt(child.Id/1000) + 1}/${child.Id}/info.html`)
			})
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(label, order) {
	var url = JavaUtils.urlJoin(findBaseUrl, `/Categories/${label}/${order}/1.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.BookList.forEach((child) => {
			result.push({
				//标题
				name: _toString(child.Name),
				
				//概览
				summary: _toString(child.Desc),
				
				//封面
				coverUrl: child.Img + '@imageDecoderFunctionName->decrypt',
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, `/BookFiles/Html/${parseInt(child.Id/1000) + 1}/${child.Id}/info.html`)
			})
		});
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
		var $ = JSON.parse(response.body().string()).data;
		return JSON.stringify({
			//名称
			name: _toString($.Name),
			
			//作者
			author: _toString($.Author),
			
			//最近更新时间
			lastUpdateTime : $.LastTime,
			
			//概览
			summary: _toString($.Desc),
			
			//封面
			coverUrl : $.Img + '@imageDecoderFunctionName->decrypt',
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录网址/非外链无需使用
			tocs: tocs(`${parseInt($.Id/1000) + 1}/${$.Id}`)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(id) {
	//创建章节数组
	var newChapters= [];

	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/BookFiles/Html/${id}/index.html`));
	if(response.code() == 200){
		const $ = JSON.parse(String(response.body().string()).replace(new RegExp('},]','g'),'}]').replace(new RegExp('style=','g'),''));
		$.data.list.forEach((booklet) => {
			booklet.list.forEach((chapter) => {
				newChapters.push({
					//章节名称
					name: _toString(chapter.name),
					//章节网址
					url: JavaUtils.urlJoin(contentBaseUrl, `/BookFiles/Html/${id}/${chapter.id}.html`)
				})
			})
		})
	}else{
		newChapters.push({
			//章节名称
			name: "无资源",
			//章节网址
			url: ""
		})
	}
	return [{
		//目录名称
		name: '目录',
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
		var content = JSON.parse(response.body().string()).data.content;
		return _toString(content);
	}
	return null;
}

/**
 * 图库内容解码
 * @param {byte[]} data
 * @return {byte[]} data
 */
function galleryContentDecoder(data) {
    return decrypt(data);
}

/**
 * DESede解密
 * @param {byte[]} data
 * @return 结果
 */
function decrypt(data) {
	return JavaUtils.decrypt3DES(data,"OW84U8Eerdb99rtsTXWSILDO","DESede/CBC/PKCS5Padding","SK8bncVu");
	/*
	var skeySpec = new javax.crypto.spec.SecretKeySpec(new java.lang.String("OW84U8Eerdb99rtsTXWSILDO").getBytes(), "DESede");
    var ivParameterSpec = new javax.crypto.spec.IvParameterSpec(new java.lang.String("SK8bncVu").getBytes());
	var cipher = javax.crypto.Cipher.getInstance("DESede/CBC/PKCS5Padding");
    cipher.init(javax.crypto.Cipher.DECRYPT_MODE, skeySpec, ivParameterSpec);
    return cipher.doFinal(data);
	*/
}


function _toString(word) {
	var l = '{{{}}}';
	if(word.indexOf(l) != -1){
		word = word.substring(word.indexOf(l) + l.length,word.length);
		word = new java.lang.String(decrypt(android.util.Base64.decode(word,android.util.Base64.NO_WRAP)));
	}
	return word
}