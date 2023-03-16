function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652791717,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 20,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "七夕漫画",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/七夕漫画.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/七夕漫画.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/七夕漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/七夕漫画.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/七夕漫画.js",
		},
		
		//更新时间
		updateTime: "2023年3月15日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 2,
		
		//自定义标签
		groupName: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			"最近更新": "http://m.qiximh3.com/rank/5-1.html",
			"热门榜": "http://m.qiximh3.com/rank/4-1.html",
		},
	});
}
const baseUrl = "http://m.qiximh3.com";//此源和六漫画相似，http://m.qiximh2.com/，http://m.qiximh1.com/
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';
const loadBaseUrl = "http://www.qiximh2.com";
/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/search.php@post->keyword=' + encodeURI(key) + header);
	const response = HttpRequest(url);
	var result = [];
	if(response.code() == 200){
		const $ = JSON.parse(response.html());
		if($.code != 1){//此处和滴滴漫画相似
			$.search_data.forEach((child) => {
				result.push({
					//标题
					title: child.name,
			
					//概览
					summary: child.author,
			
					//封面网址
					coverUrl: child.imgs,
			
					//网址
					url: ToolUtils.urlJoin(url,child.id) + '/'
				});
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @param string url
 * @return {[{title, summary, coverUrl, url}]}
 */
function find(url) {
	const response = HttpRequest(url + header);
	var result = [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select("div.comic_cover_container");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('div.comic_cover_titleBox > a').text(),
				
				//概览
				summary: element.selectFirst('div.comic_cover_desc').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div > a > div').absUrl('data-original'),
				
				//网址
				url: element.selectFirst('div.comic_cover_titleBox > a').absUrl('href')
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
			title: document.selectFirst('h1.name').text(),
			
			//作者
			author: document.selectFirst('.author_name').text(),
			
			//日期
			update: document.selectFirst('div.last_time_chapter > span').text(),
			
			//概览
			summary: document.selectFirst('div.comic_bottom_content > div.detail_wrap > div.details').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.comic_info.h_comic_info > div.comic_cover').absUrl('data-original'),
			
			//此处在 MyACG_V1.4.3 搞错了，原定使用 isEnabledChapterReverseOrder，
			//目前暂时使用 isEnabledReverseOrder 进行代替，如果要兼容 MyACG_V1.4.3 建议把两个都加上
			//是否启用将章节置为倒序
			isEnabledReverseOrder: true,
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(document, url)
		});
	}
	return null;
}


/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document, url) {
	//创建章节数组
	var newTocs = [];
		
	//章节元素选择器
	var chapterElements = document.select('ul.catalog_list > a');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newTocs.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: ToolUtils.urlJoin(url,chapterElement.selectFirst('a').absUrl('href')).replace(baseUrl, loadBaseUrl)
		});
	}
	
	var vidElement = document.selectFirst('div.catalog_wrap > div.comment_more > button');
	if(vidElement != null){
		var catalog_response = HttpRequest(ToolUtils.urlJoin(baseUrl,'/bookchapter/') + '@post->id=' + vidElement.attr('data-id') + '&id2=' + vidElement.attr('data-vid') + header);
		JSON.parse(catalog_response.html()).forEach((child) => {
			newTocs.push({
				//章节名称
				name: child.chaptername,
				//章节网址
				url: (ToolUtils.urlJoin(url,child.chapterid) + '.html').replace(baseUrl, loadBaseUrl)
			});
		});
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : newTocs
	}];
}

/**
 * 内容
 * @return {string} content

function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		eval(ToolUtils.substring(response.html(),'<script type=\"text/javascript\">','</script>'));
		return JSON.stringify(newImgs);
	}
	return null;
} */