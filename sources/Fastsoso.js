function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660733207,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220718,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "Fastsoso",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Fastsoso.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Fastsoso.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Fastsoso.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Fastsoso.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/Fastsoso.js",
		},
		
		//更新时间
		updateTime: "2022年8月17日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 1,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 0,
		
		//自定义标签
		tag: ["网盘"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.fastsoso.cn",
	});
}
const header = '@header->User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.73';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = `https://www.fastsoso.cn/search?k=${encodeURI(key)}` + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'[style="padding-top: 10px;"]').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'[name="content-title"]').text(),
			
			//概览
			summary : jsoup(data,'[style="color: #105207;"]').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'a > img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin(url,jsoup(data,'[name="content-title"] > strong > a').attr('href'))
			});
	}
	return JSON.stringify(array);
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content

function content(url) {
	var response = httpRequest(url + header);
	response = httpRequest('https://www.fastsoso.cn/file/fetch@post->check='+ToolUtil.urlJoin(url,jsoup(response,'#avail').attr('value')));
	return response;
}
 */