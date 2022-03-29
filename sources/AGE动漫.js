function mainifest() {
	return JSON.stringify({
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		priority:1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "AGE动漫",

		//搜索源制作人
		author: "雨夏",

		//联系邮箱
		mail: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源更新链接(可使用多个) ","符号进行隔开，注意：不要使用中文的逗号
		updateUrl: "",
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//自定义标签 ","符号进行分割，注意：不要使用中文的逗号
		tag: "动漫",
		
		//@NonNull 详细界面域名，搜索源标识
		host: "agemys.com"
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://agemys.com/search?&query='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'div[class=blockcontent1] > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a[class=cell_poster] > img').attr('alt'),
			
			//概览
			summary : jsoup(data,'div:nth-child(7) > span.cell_imform_value').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,'a[class=cell_poster] > img').attr('src')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'a[class=cell_poster]').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{author, summary, cover, upDate, reverseOrder, catalogs}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
	return JSON.stringify({
		//作者
		author: jsoup(response,'li:nth-child(5) > span.detail_imform_value').text(),
		
		//概览
		summary: jsoup(response,'div.detail_imform_desc_pre > p').text(),

		//封面
		//cover : jsoup(response,'#fmimg > img').attr('src'),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录链接/非外链无需使用
		catalogs: catalogs(response,url)
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {tag, chapters:{[{group, name, url}]}}
 */
function catalogs(response,url) {
	//目录标签代码
	const tabs = jsoupArray(response,'#menu0 > li').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'#main0 > div.movurl').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'ul > li').outerHtml();
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			newchapters.push({
				//是否为分组
				group: false,
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节链接
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsoup(tabs[i],'li').text(),
			//章节
			chapters : newchapters
			});
	}
	return new_catalogs
}

