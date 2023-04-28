function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1658148697,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230428,
		
		//编译版本
		compileVersion: JavaUtils.JS_VERSION_ES6,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 30,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "36漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/36漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/36漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/36漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/36漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/36漫画.js",
		},
		
		//更新时间
		updateTime: "2023年4月28日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://infosmanhua.pysmei.com",//apptuxing.com ，pysmei.com , leeyegy.com
		//search: pigqq.com,leeyegy.com
		//备用：apptuxing.com ，pysmei.com ，pigqq.com

		//发现
		findList: {
			"最新榜": "https://scmanhua.pysmei.com/top/man/top/area/all/new/week/1.html",
			"热门榜": "https://scmanhua.pysmei.com/top/man/top/area/all/hot/week/1.html",
			"评分榜": "https://scmanhua.pysmei.com/top/man/top/area/all/vote/week/1.html",
			"完结榜": "https://scmanhua.pysmei.com/top/man/top/area/all/over/week/1.html",
			"推荐榜": "https://scmanhua.pysmei.com/top/man/top/area/all/commend/week/1.html",
			"收藏榜": "https://scmanhua.pysmei.com/top/man/top/area/all/collect/week/1.html",
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const header = '';
/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = `https://soumh.pigqq.com/search.aspx?key=${encodeURI(key)}&page=1&siteid=manhuaapp2` + header;
	
	var array= [];
	const response = JavaUtils.httpRequest(url + header);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.forEach((child) => {
			array.push({
				//名称
				name: child.Name,
				
				//概览
				summary: child.Author,
				
				//封面
				coverUrl: child.Img + '@imageDecoderFunctionName->decrypt',
				
				//网址
				url: `https://infosmanhua.pysmei.com/BookFiles/Html/${parseInt(child.Id/1000) + 1}/${child.Id}/info.html`,
			})
		})
	}
	return JSON.stringify(array);
}

/**
 * 发现
 * @param {string} url
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(url) {
	var array= [];
	const response = JavaUtils.httpRequest(url + header);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.BookList.forEach((child) => {
			array.push({
				//标题
				title: _toString(child.Name),
				
				//概览
				summary: _toString(child.Desc),
				
				//封面
				coverUrl: child.Img + '@imageDecoderFunctionName->decrypt',
				
				//网址
				url: `https://infosxs.pysmei.com/BookFiles/Html/${parseInt(child.Id/1000) + 1}/${child.Id}/info.html`
			})
		})
	}
	return JSON.stringify(array);
}

/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url + header);
	if(response.code() == 200){
		var $ = JSON.parse(response.body().string()).data;
		return JSON.stringify({
			//名称
			name: _toString($.Name),
			
			//作者
			author: _toString($.Author),
			
			//日期
			update : $.LastTime,
			
			//概览
			summary: _toString($.Desc),
			
			//封面
			coverUrl : $.Img + '@imageDecoderFunctionName->decrypt',
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
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

	const response = JavaUtils.httpRequest(`https://infosmanhua.pysmei.com/BookFiles/Html/${id}/index.html`+ header);
	if(response.code() == 200){
		const $ = JSON.parse(String(response.body().string()).replace(new RegExp('},]','g'),'}]'));
		$.data.list.forEach((booklet) => {
			booklet.list.forEach((chapter) => {
				newChapters.push({
					//章节名称
					name: _toString(chapter.name),
					//章节网址
					url: `https://contentmanhua.pysmei.com/BookFiles/Html/${id}/${chapter.id}.html`
				})
			})
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
	const response = JavaUtils.httpRequest(url + header);
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