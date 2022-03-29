function mainifest() {
	return JSON.stringify({
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		priority:1,
		
		//是否失效,默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "ZzzFun动漫",

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
		host: "www.zzzfun.com"
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'http://service-i86gk1am-1251249846.gz.apigw.tencentcs.com/android/search@post->key='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsonPathArray(response,'$..data[*]');
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsonPath(data,'$.videoName'),
			
			//概览
			summary : jsonPath(data,'$.videoremarks'),
			
			//封面
			cover : jsonPath(data,'$.videoImg'),
			
			//链接
			url : 'http://service-i86gk1am-1251249846.gz.apigw.tencentcs.com/android/video/list_ios?videoId='+jsonPath(data,'$.videoId')
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
		//author: jsonPath(response,'li:nth-child(5) > span.detail_imform_value').text(),
		
		//概览
		summary: jsonPath(response,'$..videoDoc'),

		//封面
		//cover : jsonPath(response,'#fmimg > img').attr('src'),
		
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
	const tabs = jsonPathArray(response,'$..videoSets[*]');
	
	//目录代码
	const catalogs = jsonPathArray(response,'$..videoSets[*]');
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsonPathArray(catalog,'$..list[*]');
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			var playids = jsonPath(chapter,'$.playid').split('-');
			
			newchapters.push({
				//是否为分组
				group: false,
				//章节名称
				name: jsonPath(chapter,'$.ji'),
				//章节链接
				url: 'http://www.zzzfun.com/vod_play_id_'+playids[0]+'_sid_1_nid_'+playids[1]+'.html'
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsonPath(tabs[i],'$..load'),
			//章节
			chapters : newchapters
			});
	}
	return new_catalogs
}

/**
 * 解析
 * @params string html
 * @returns {[{title, introduction, cover, url}]}
 */
function analysis(url) {
	return url+header+'@header->Referer:http://www.zzzfun.com';
}

