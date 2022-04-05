function mainifest() {
	return JSON.stringify({
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1648714588,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		priority:1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "轻小说文库",

		//搜索源制作人
		author: "雨夏",

		//联系邮箱
		mail: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/轻小说文库.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/轻小说文库.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/轻小说文库.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/轻小说文库.js"
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//自定义标签，支持配置多个，多个链接之间，通过英文逗号进行分隔
		tag: "小说,轻小说",
		
		//@NonNull 详细界面的域名
		hostName: "https://www.wenku8.net",
		
		//@NonNull 详细界面域名，搜索源标识
		host: "www.wenku8.net",
		
		//登录授权是否启用
		auth: true,
		
		//登录授权链接
		authUrl:"http://www.wenku8.net/index.php@callback->登录成功"
	});
}

function auth() {
	const response = httpRequest("http://www.wenku8.net/index.php");
	if(response.indexOf('轻小说文库欢迎您')==-1){
		return true;
	}
	return false;
}

const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://www.wenku8.net/modules/article/search.php?searchtype=articlename&searchkey='+ ToolUtil.encodeURI(key,'GBK') + header;
	const response = httpRequest(url);
	
	var array= [];
	if(response.indexOf('小说目录')!=-1){
		array.push({
			//标题
			title : jsoup(response,'#content > div > table > tbody > tr > td > table > tbody > tr > td > span > b').text(),
			
			//概览
			summary : jsoup(response,'#content > div:nth-child(1) > table:nth-child(4) > tbody > tr > td:nth-child(2) > span:nth-child(13)').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(response,'#content > div > table > tbody > tr > td > img').attr('src')),
			
			//链接
			url : 'https://www.wenku8.net/book/' + ToolUtil.substring(response,'bid=','\"')+'.htm'
			});
		return JSON.stringify(array);
	}
	
	const list = jsoupArray(response,'#content > table > tbody > tr > td > div').outerHtml();
	
	for (var i=0;i <list.length ; i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div:nth-child(2) > b > a').text(),
			
			//概览
			summary : jsoup(data,'div:nth-child(2) > p:nth-child(3)').text(),
			
			//封面
			cover : ToolUtil.urlJoin(url,jsoup(data,':nth-child(1) > a >img').attr('src')),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'div:nth-child(2) > b > a').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{author, summary, cover, upDate, reverseOrder, catalog}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
	return JSON.stringify({
		//作者
		author: jsoup(response,'#content > div:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)').text(),
		
		//概览
		summary: jsoup(response,'#content > div:nth-child(1) > table:nth-child(4) > tbody > tr > td:nth-child(2) > span:nth-child(13)').text(),

		//封面
		cover : ToolUtil.urlJoin(url,jsoup(response,'#content > div > table > tbody > tr > td > img').attr('src')),
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录链接/非外链无需使用
		catalog: catalog(ToolUtil.urlJoin(url,jsoup(response,'#content > div:nth-child(1) > div:nth-child(6) > div > span:nth-child(1) > fieldset > div > a').attr('href')))
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {tag, chapter:{[{group, name, url}]}}
 */
function catalog(url) {
	const response = httpRequest(url+ header);
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
		
	//章节代码
	var chapters = jsoupArray(response,'td.vcss,td.ccss').outerHtml();
		
	for (var ci=0;ci<chapters.length;ci++) {
		var chapter = chapters[ci];
		newchapters.push({
			//是否为分组
			group: !(chapter.indexOf('href')!=-1),
			//章节名称
			name: jsoup(chapter,'a,:matchText').text(),
			//章节链接
			url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
		});
	}
	//添加目录
	new_catalogs.push({
		//目录名称
		tag: '目录',
		//章节
		chapter : newchapters
	});
	return new_catalogs;
}

/**
 * 内容
 * @params {string} url
 * @returns {[{url}]}
 */
function content(url) {
	const response = httpRequest(url + header);
	const content = jsoup(response,'#content').outerHtml();
	return content;
}

