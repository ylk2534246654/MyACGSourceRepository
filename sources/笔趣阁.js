function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1656743080,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "笔趣阁",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 9,

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/笔趣阁.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/笔趣阁.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/笔趣阁.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1696057569,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
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
			"小说": ["label","order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}
const drive 	= "pigqq.com";//JavaUtils.getPreference().getString("drive", "pigqq.com")

const baseUrl 	= "https://wb." + drive;
//备用：infosxs.apptuxing_com ，pysmei_com ，pigqq_com

const searchBaseUrl 	= "https://ssxs.pigqq.com";//leeyegy、pigqq
//备用：souxs.pigqq_com ，leeyegy_com , pysmei_com

const imgBaseUrl 	= "https://imgapixs.pigqq.com";
const imgUrl 	= "https://imgapixs.pigqq.com/bookfiles/bookimages/";
//备用：apptuxing_com ，pigqq_com

const findBaseUrl = "https://wb." + drive;
//备用：scxs.

const contentBaseUrl = "https://wb." + drive;
//备用：contentxs.

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(searchBaseUrl, `/search.aspx?key=${encodeURI(key)}&page=1&siteid=app2`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			result.push({
				//名称
				name: _toString(child.Name),
			
				//作者
				author: _toString(child.Author),
			
				//最后章节名称
				lastChapterName: _toString(child.LastChapter),

				//最近更新时间
				lastUpdateTime: _toString(child.UpdateTime),
				
				//概览
				summary: _toString(child.Desc),
				
				//封面 
				coverUrl: JavaUtils.urlJoin(imgUrl, child.Img.replace(/^[a-zA-Z]+:\/\/[^/]+/, imgBaseUrl)),
				
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
			
				//作者
				author: _toString(child.Author),
				
				//概览
				summary: _toString(child.Desc),
				
				//封面
				coverUrl: JavaUtils.urlJoin(imgUrl, child.Img.replace(/^[a-zA-Z]+:\/\/[^/]+/, imgBaseUrl)),
				
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
			lastUpdateTime: _toString($.LastTime),
			
			//概览
			summary: _toString($.Desc),
			
			//封面
			coverUrl: JavaUtils.urlJoin(imgUrl, $.Img.replace(/^[a-zA-Z]+:\/\/[^/]+/, imgBaseUrl)),
			
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
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var $ = JSON.parse(response.body().string());
		return _toString($.data.content.replace(new RegExp('@@﻿@@','g'),'').replace(new RegExp('正在更新中，请稍等片刻，内容更新后，重新进来即可获取最新章节！亲，如果觉得APP不错，别忘了点右上角的分享给您好友哦！','g'),''))
	}
	return null;
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