function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654920600,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 1,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "奇漫屋",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/奇漫屋.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/奇漫屋.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/奇漫屋.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/奇漫屋.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/奇漫屋.js",
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
		//此源和七夕漫画，六漫画相似
	});
}
const baseUrl = "http://m.qiman59.com";//备份 http://qiman5.com http://qiman57.com http://qiman56.com
const header = '';

/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, cover, url}]}
 */
function search(key) {
	const url = ToolUtils.urlJoin(baseUrl,'/spotlight/?keyword=' + encodeURI(key) + header);
	const response = HttpRequest(url);
	var result = [];
	if(response.code() == 200){
		const document = response.document();
        var elements = document.select("div.search-result > div");
        for (var i = 0;i < elements.size();i++) {
            var element = elements.get(i);
            result.push({
                //标题
                title: element.selectFirst('p.comic-name > a').text(),
                
                //概览
                summary: element.selectFirst('p.comic-tags').text() + '.' + element.selectFirst('p.comic-update-at').text(),
                
                //封面网址
				coverUrl : element.selectFirst('a.cover > img').absUrl('src'),
                
                //网址
                url: element.selectFirst('a.cover').absUrl('href')
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
		const document = response.document();
		return JSON.stringify({
			//标题
			title: document.selectFirst('div.box-back2 > h1').text(),
			
			//作者
			author: document.selectFirst('div.box-back2 > p:nth-child(2)').text(),
			
			//更新时间
			update: document.selectFirst('div.comic-info-box > div.box-back2 > p:nth-child(5)').text(),
			
			//概览
			summary: document.selectFirst('span.comic-intro').text(),
	
			//封面网址
			coverUrl : document.selectFirst('div.comic-info-box > div > img').absUrl('src'),
			
			//此处在 MyACG_V1.4.3 搞错了，原定使用 isEnabledChapterReverseOrder，
			//目前暂时使用 isEnabledReverseOrder 进行代替，如果要兼容 MyACG_V1.4.3 建议把两个都加上
			//是否启用将章节置为倒序
			isEnabledReverseOrder: true,
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(response, url)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(response, url) {
	const document = response.document();
	const html = response.html();
	//创建章节数组
	var newTocs = [];
		
	//章节元素选择器
	var chapterElements = document.select('li.chapter-item');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newTocs.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
	}
	
	var id = ToolUtils.substring(html,'id\": ',',');
	var vid = ToolUtils.substring(html,'id2\": ',',');
	if(vid.length > 0){
		var catalog_response = HttpRequest(ToolUtils.urlJoin(baseUrl,'/bookchapter/@post->id=' + id + '&id2=' + vid + header) );
		if(catalog_response.code() == 200){
			const $ = JSON.parse(catalog_response.html());
			$.forEach((child) => {
				newTocs.push({
					//章节名称
					name: child.name,
					//章节网址
					url: ToolUtils.urlJoin(url,child.id) + '.html'
				});
			});
		}
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
 * @param {string} url
 * @return {string} content
 */
function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var newImgs = '';
		eval(ToolUtils.substring(response.html(),'<script type=\"text/javascript\">','</script>'));
		return JSON.stringify(newImgs);
	}
	return null;
}