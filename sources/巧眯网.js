function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660824838,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 50,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,//需要关注微信公主号，不推荐
		
		//@NonNull 搜索源名称
		name: "巧眯网",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/巧眯网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/巧眯网.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/巧眯网.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695287281,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 1,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 0,
		
		//分组
		group: ["网盘"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}

const baseUrl = "http://m.qiaomi.cn";
//备份：xiaobeizi.2kongjiang.com、m.qiaomi.cn

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/s/${encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".list > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('h2 > a').text(),

				//概览
				summary: element.selectFirst('.resname:nth-child(3)').text(),
				
				//网址
				url: element.selectFirst('h2 > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}