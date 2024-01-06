function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704510737,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "混合盘",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/混合盘.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/混合盘.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/混合盘.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/混合盘.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704510737,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 1,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//分组
		group: ["网盘"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}

const baseUrl = "https://api.hunhepan.com";
/**
 * hunhepan.com
 * wwb.lanzouw.com/b037ns0eb
 * pan.quark.cn/s/de7caa551de7
 * www.123pan.com/s/zCHSVv-3NYvd.html
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/v1/search@post->{"page": 1,"q": "${key}"}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
    if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.list.forEach((child) => {
			result.push({
				//名称
				name: JavaUtils.cleanHtml(child.disk_name),
		
				//最近更新时间
				lastUpdateTime: child.update_time,

				//概览
				summary: JavaUtils.cleanHtml(child.files).replaceAll("file:","\n"),
		
				//封面网址
				//coverUrl: child.images.poster,
		
				//网址
				url: child.link
			});
		});
	}
	return JSON.stringify(result);
}