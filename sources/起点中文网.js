function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1651679241,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220621,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 50,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "起点中文网",

		//搜索源制作人
		//author: "",

		//电子邮箱
		//email: "",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/起点中文网.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/起点中文网.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/起点中文网.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/起点中文网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/起点中文网.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问{url}，1：对链接处理{url}，2：对内部浏览器拦截的请求处理{url}，3：对内部浏览器拦截的框架处理{html}
		contentType: -1,
		
		//自定义标签
		tag: ["小说","聚合"],
		
		//@NonNull 详情界面的基本网址
		baseUrl: "https://book.qidian.com",
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.50';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.qidian.com/soushu/'+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'#result-list > div > ul > li').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div.book-mid-info > h2 > a').text(),
			
			//概览
			summary : jsoup(data,'div.book-mid-info > p.author > a.name').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'div.book-img-box > a > img').attr('src')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'div.book-right-info > p > a.red-btn').attr('href'))
			});
	}
	return JSON.stringify(array);
}