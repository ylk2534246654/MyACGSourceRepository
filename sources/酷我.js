function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1662384077,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240105,

		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "酷我",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/酷我.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/酷我.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/酷我.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/酷我.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1705410061,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 5,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["音乐"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://antiserver.kuwo.cn",
	});
}
const header = '@header->Connection: keep-alive@header->Referer: http://www.kuwo.cn';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = `https://www.kuwo.cn/search/searchMusicBykeyWord?vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=20&all=${encodeURI(key)}` + header;
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.abslist.forEach((child) => {
			result.push({
				//名称
				name: child.NAME,
		
				//作者
				author: child.ARTIST,

				//概览
				//summary: child.ARTIST,
		
				//封面网址
				coverUrl: JavaUtils.urlJoin("https://img2.kuwo.cn/star/albumcover/", child.web_albumpic_short),
		
				//网址
				url: JSON.stringify({
                    id: child.DC_TARGETID,
                    format :child.FORMAT
                })
			});
		});
    }
	return JSON.stringify(result);
}
/**
 * 内容
 * @params {string} url
 * @returns {string} url
 */
function content(json) {
    /**
     * 可以参考开源库进行编写，但能力有限，没时间写
     * https://github.com/search?q=http%3A%2F%2Fnmobi.kuwo.cn%2Fmobi.s%3F&type=code
     */
    /*
    const $ = JSON.parse(json);
    var quality = "high";
    var text = `type=convert_url2&br=${quality}&format=${$.format}&sig=0&rid=${$.id}&network=wifi`;
    var link = "http://nmobi.kuwo.cn/mobi.s?f=kuwo&q=" + Convert.ToBase64String(KuwoDES.EncryptToBytes(text, "ylzsxkwm"));
	const response = JavaUtils.httpRequest(link);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
        return $.data.url;
    }
    */
}
