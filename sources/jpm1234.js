function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652608955,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 10,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "jpm1234",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/jpm1234.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/jpm1234.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/jpm1234.js",
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
const baseUrl = "http://www.jpm1234.com";
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/Search/Keyword/' + encodeURI(key) + header);
	const response = HttpRequest(url);
	var result = [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select("#contList > li");
        for (var i = 0;i < elements.size(); i++) {
            var element = elements.get(i);
            result.push({
                //标题
                title: element.selectFirst('p.ell > a').text(),
                
                //概览
                summary: element.selectFirst('span.tt').text(),
                
                //封面网址
				coverUrl : element.selectFirst('a > img').absUrl('data-src'),
                
                //网址
                url: element.selectFirst('p.ell > a').absUrl('href')
            });
        }
	}
	return JSON.stringify(result);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalog:{[{tag, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		var document = response.document();
		return JSON.stringify({
			//标题
			title: document.selectFirst('.book-title > h1').text(),
			
			//作者
			author: document.selectFirst('ul.detail-list > li:nth-child(2) > span > a:nth-child(2)').text(),
			
			//更新时间
			//update: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('#intro-all').text(),

			//封面网址
			coverUrl: document.selectFirst('div.book-cover > p > img').absUrl('src'),
			
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
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//创建目录数组
	var newTocs = [];
	
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('div.chapter-list > ul > li');
	
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
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = HttpRequest(url+ header);
	if(response.code() == 200){
		const html = response.html();
		var host = 'http://img4.jpm1234.com/uploads';
		eval('var cInfo'+ToolUtil.substring(html,'var cInfo','</script>'));
		if(html.indexOf('configsa')!=-1){
			host = 'http://img2.jpm1234.com/uploads';
		};
		if(html.indexOf('configsb')!=-1){
			host = 'http://img3.jpm1234.com/uploads';
		};
		for(var i = 0;i < cInfo.fs.length;i++){
			cInfo.fs[i] = host + cInfo.fs[i];
		}
		return JSON.stringify(cInfo.fs);
	}
	return null;
}
