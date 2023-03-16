function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1670670509,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "啵乐漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/啵乐漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/啵乐漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/啵乐漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/啵乐漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/啵乐漫画.js",
		},
		
		//更新时间
		updateTime: "2023年3月15日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		groupName: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}
const baseUrl = "http://www.bolebl.com";//备用：http://www.404ms.top
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/search?keyword=' + encodeURI(key) + header);
	const response = HttpRequest(url);
	var result = [];
	if(response.code() == 200){
		var document = response.document();
        var elements = document.select(".acgn-item");
        for (var i = 0;i < elements.size();i++) {
            var element = elements.get(i);
            result.push({
                //标题
                title: element.selectFirst('.acgn-title').text(),
                
                //概览
                summary: element.selectFirst('.acgn-desc').text(),
                
                //封面网址
				coverUrl : ToolUtils.urlJoin(url,ToolUtils.substring(element.selectFirst('img').attr('style'),'url(\'','\'')),
                
                //网址
                url: element.selectFirst('.acgn-thumbnail').absUrl('href')
            });
        }
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @return {[{title, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		return JSON.stringify({
			//标题
			title: document.selectFirst('div.content > h1').text(),
			
			//作者
			author: document.selectFirst('div.content > p > span:nth-child(4)').text(),
			
			//更新时间
			update: document.selectFirst('.update').text(),
			
			//概览
			summary: document.selectFirst('.desc-content').text(),
	
			//封面网址
			coverUrl : ToolUtils.urlJoin(url,ToolUtils.substring(document.selectFirst('div.detail-cover > img').attr('style'),'url(\'','\'')),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//创建目录数组
	var newTocs = [];
	
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('.chapter-list > li');
	
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
		name: '目录',
		//章节
		chapters: newChapters
	});
	return newTocs
}

/**
 * @version 2022/12/8
 * @param {string} url
 * @return {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	var imgList =  jsoupArray(response,'img[referrerpolicy]').attr('src');
	return JSON.stringify(imgList);
}