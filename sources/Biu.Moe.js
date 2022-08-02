function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652603756,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 20,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "Biu.Moe",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Biu.Moe.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Biu.Moe.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Biu.Moe.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/Biu.Moe.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Biu.Moe.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/Biu.Moe.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 5,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["音乐"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://web.biu.moe",
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://web.biu.moe/index.php?m=&c=Song&a=search&data='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'tbody > tr').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a:nth-child(1)').text(),
			
			//概览
			summary : jsoup(data,'a:nth-child(2)').text(),
			
			//封面
			//cover : ToolUtil.urlJoin(url,jsoup(data,'p:nth-child(1) > a > img').attr('src')),
			
			//网址
			url : ToolUtil.urlJoin('https://web.biu.moe/Song/playSID/sid/',jsoup(data,'a:nth-child(1)').attr('href').replace('/s',''))
			});
	}
	return JSON.stringify(array);
}
/**
 * 内容
 * @params {string} url
 * @returns {string} url
 */
function content(url) {
	const response = httpRequest(url);
	return jsonPath(response,'$.urlinfo.url');
}

