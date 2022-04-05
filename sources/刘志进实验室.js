function mainifest() {
	return JSON.stringify({
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714515,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		priority:1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "刘志进实验室",

		//搜索源制作人
		author: "雨夏",

		//联系邮箱
		mail: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/刘志进实验室.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/刘志进实验室.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/刘志进实验室.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/刘志进实验室.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/刘志进实验室.js"
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 5,
		
		//自定义标签，支持配置多个，多个链接之间，通过英文逗号进行分隔
		tag: "音乐",
		
		//@NonNull 详细界面的域名
		hostName: "http://music.163.com"
	});
}
const header = '@header->x-requested-with:XMLHttpRequest@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://music.liuzhijin.cn/@post->input='+ encodeURI(key) + '&filter=name&type=netease' + header;
	const response = httpRequest(url);
	
	const list = jsonPathArray(response,'$..data[*]');
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsonPath(data,'$.title'),
			
			//概览
			summary : jsonPath(data,'$.author'),
			
			//封面
			cover : jsonPath(data,'$.pic'),
			
			//链接
			url : ToolUtil.urlJoin(url,jsonPath(data,'$.url'))
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
	return url;
}

