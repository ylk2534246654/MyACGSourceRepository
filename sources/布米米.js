function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654934193,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 60,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "布米米",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/布米米.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/布米米.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/布米米.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/布米米.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/布米米.js",
		},
		
		//更新时间
		updateTime: "2023年3月15日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		groupName: 2,
		
		//自定义标签
		group: ["动漫","影视"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "http://bumimi3.com",//备用http://bumimi.vip/
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'http://119.91.129.193:7899/sssv.php?top=10&q='+ encodeURI(key) + header + '@header->referer:http://bumimi.com/@header->Origin:http://bumimi.com';
	var response = HttpRequest(url);
	var result = [];
	if(response.code() == 200){
		const $ = JSON.parse('[' + ToolUtils.substring(response.html(),'[',']') + ']');
		$.forEach((child) => {
			result.push({
				//标题
				title : child.title,
				
				//概览
				summary : child.lianzaijs,
				
				//封面
				cover : child.thumb,
				
				//网址
				url : child.url
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @returns {[{title, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		return JSON.stringify({
			//标题
			title: document.selectFirst('div.top-info-title > div > h1').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//日期
			//update: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.item-desc').text(),

			//封面网址
			coverUrl: document.selectFirst('.b-detailcover > img').absUrl('data-img'),
			
			//目录是否倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	const tagElements = document.select('.playurl> li,.num-tab > h2');
	
	//目录元素选择器
	const tocElements= document.select('#qiyi-pl-list > div > ul');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('ul > li');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('a').text(),
			//章节
			chapters: newChapters
		});
	}
	return newTocs
}

/**
 * 内容（部分搜索源通用规则）
 * @version 2023/3/15
 * 布米米、嘻嘻动漫、12wo动漫、路漫漫、风车动漫P、樱花动漫P、COCO漫画
 * @returns {string} content
 */
function content(url) {
	var re = /[a-z]+:\/\/[\w.]+\/(([a-z]{1}\/\d)|([a-z]{3}\/[a-z]{3}\/\d)|([a-z]{2}\/\d{4}\?)|([\w]{3}\/\d{6}$)|([\d]{4}\/\d{2}\/\d{11}\.txt)|([\w]{2}\/\w{5}\/\d{5}\/\d{6})|(sh\/[\w]{2}\/\d{3}))/i;
	
	//这种格式均为广告网址
	//https://knr.xxxxx.cn/j/140000		#[a-z]{1}\/\d{6}
	//https://xx.xxx.xx/xxx/xxx/0000	#[a-z]{3}\/[a-z]{3}\/\d
	//https://tg.xxx.com/sc/0000?n=xxxx #[a-z]{2}\/\d{4}\?
	//https://xx.xxx.xyz/vh1/158051 	#[\w]{3}\/\d{6}$
	//https://xx.xx.com/0000/00/23030926631.txt 	#[\d]{4}\/\d{2}\/\d{11}\.txt
	//https://xxxxx.xxxxxx.com/v2/stats/12215/157527 	#[\w]{2}\/\w{5}\/\d{5}\/\d{6}
	//https://xxx.xxxxxx.com/sh/to/853	#sh\/[\w]{2}\/\d{3}
	
	if(!re.test(url)){
		return url;
	}
	return null;
}