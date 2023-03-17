function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1656606228,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230317,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "四五中文网",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/四五中文网.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/四五中文网.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/四五中文网.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/四五中文网.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/四五中文网.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/四五中文网.js",
		},
		
		//更新时间
		updateTime: "2023年3月17日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		groupName: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//网络限流 - 如果{regexUrl}匹配网址，则限制其{period}毫秒内仅允许{maxRequests}个请求
		networkRateLimitList: [
			{
				"regexUrl": "search\.php",//表示需要限流的 Url，使用正则表达式格式（不允许为空）
				"maxRequests": 0,//在指定的时间内允许的请求数量（必须 >= 0 才会生效）
				"period": 30_000,//时间周期，毫秒（必须 > 0 才会生效）
			}
		],
	});
}
const baseUrl = "https://www.45zw.cc";
/**
 * 网站记录
 * https://www.45zw.org
 */
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';
/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/modules/article/search.php?searchkey='+ ToolUtil.encodeURI(key,'gbk') +'&submit=%CB%D1%CB%F7'+ header);
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select("tbody > tr");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('a:not([href~=html])').text(),
				
				//概览
				summary: element.selectFirst('a[href~=html]').text(),
				
				//封面网址
				//coverUrl: element.selectFirst('').absUrl('href'),
				
				//网址
				url: element.selectFirst('a:nth-child(1)').absUrl('href')
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
			title: document.selectFirst('#info > h1 > :matchText').text(),
			
			//作者
			author: document.selectFirst('#info > h1 > small > a').text(),
			
			//更新时间
			update: document.selectFirst('#info > div.update  > :matchText:nth-child(3)').text(),
			
			//概览
			summary: document.selectFirst('#intro').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#picbox > div > img').absUrl('src'),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(url, document)
		});
	}
	return null;
}
/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(url, document) {
	const zjboxSize = document.select('.zjbox > div > select > option').size();
	
	//创建章节数组
	var newChapters= [];
	for(var i = 1;i <= zjboxSize;i++){
		var _url = ToolUtils.urlJoin(url, `index_${i}.html`);
		var response = HttpRequest(_url + header);
		if(response.code() == 200){
			var _document = response.document();
				
			//章节元素选择器
			var chapterElements = _document.select('div > dl > dd > a');
				
			for (var ci = 0;ci < chapterElements.size(); ci++) {
				var chapterElement = chapterElements.get(ci);
				newChapters.push({
					//章节名称
					name: chapterElement.selectFirst('a').text(),
					//章节链接
					url: chapterElement.selectFirst('a').absUrl('href')
				});
			}
		}
	}
	return [{
		//目录名称
		name: '目录',
		//章节
		chapter : newChapters
	}];
}

/**
 * 内容
 * @return {string} content
 */
function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		return response.document().selectFirst('#content').outerHtml();
	}
	return null;
}