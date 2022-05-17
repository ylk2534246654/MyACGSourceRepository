function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652783603,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,
		
		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 20,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "动漫之家",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/动漫之家.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫之家.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫之家.js",
			"Coding": "https://ylk2534246654.coding.net/p/myacg/d/MyACGSourceRepository/git/raw/master/sources/动漫之家.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/动漫之家.js",
		},
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： 0：链接处理并浏览器访问{url}，1：链接处理{url}，2：浏览器拦截请求{url}，3：浏览器拦截框架{html}
		contentType: 1,
		
		//自定义标签
		tag: ["漫画"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: "https://m.dmzj.com",
		
		//发现
		findList: {
			"完结": "https://m.dmzj.com/classify/0-0-2-0-0-0.json",
			"魔法": "https://m.dmzj.com/classify/7-0-0-0-0-0.json",
			"校园": "https://m.dmzj.com/classify/8-0-0-0-0-0.json",
			"后宫": "https://m.dmzj.com/classify/15-0-0-0-0-0.json",
			"治愈": "https://m.dmzj.com/classify/17-0-0-0-0-0.json",
			"武侠": "https://m.dmzj.com/classify/18-0-0-0-0-0.json",
			"轻小说改": "https://m.dmzj.com/classify/22-0-0-0-0-0.json"
		},
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://m.dmzj.com/search/'+encodeURI(key)+'.html' + header;
	const response = httpRequest(url);
	var serchArry = ToolUtil.substring(response,'serchArry=','</script>');
	const list = jsonPathArray(serchArry,'$.*');
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsonPath(data,'$.name'),
			
			//概览
			summary : jsonPath(data,'$.last_update_chapter_name'),
			
			//封面
			cover : ToolUtil.urlJoin('https://images.dmzj.com/',jsonPath(data,'$.cover')),
			
			//链接
			url : ToolUtil.urlJoin('https://m.dmzj.com/info/',jsonPath(data,'$.comic_py')) + '.html'
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
		author: jsoup(response,'p.txtItme:nth-child(1)').text(),
		
		//概览
		summary: jsoup(response,'p.txtDesc.autoHeight').text(),

		//封面
		cover : jsoup(response,'#Cover > img').attr('src'),
		
		//目录是否倒序
		reverseOrder: true,
		
		//目录加载
		catalog: catalog(response,url)
	})
}

/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {tag, chapter:{[{group, name, url}]}}
 */
function catalog(response,url) {
	//创建目录数组
	var new_catalogs= [];
		
	//创建章节数组
	var newchapters= [];
	
	//章节代码
	var chapters =  jsonPathArray(ToolUtil.substring(response,'initIntroData([',']);'),'$..data[*]');
	
	for (var ci=0;ci<chapters.length;ci++) {
		var chapter = chapters[ci];
		
		newchapters.push({
			//章节名称
			name: jsonPath(chapter,'$.chapter_name'),
			//章节链接
			url: 'https://m.dmzj.com/view/'+jsonPath(chapter,'$.comic_id')+'/'+jsonPath(chapter,'$.id')+'.html'
		});
	}
	//添加目录
	new_catalogs.push({
		//目录名称
		tag: "目录",
		//章节
		chapter : newchapters
		});
	return new_catalogs
}

/**
 * 内容
 * @params {string} url
 * @returns {[{url}]}
 */
function content(url) {
	const response = httpRequest(url + header);
	const src = jsonPathArray(ToolUtil.substring(response,'initData(',', \"'),'$.page_url');
	return JSON.stringify(src);
}

/**
 * 发现
 * @params string html
 * @returns {[{title, introduction, cover, url}]}
 */
function find(url) {
	const response = httpRequest(url + header);
	//目录标签代码
	const list = jsonPathArray(response,'$.*');
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsonPath(data,'$.name'),
			
			//概览
			summary : jsonPath(data,'$.last_update_chapter_name'),
			
			//封面
			cover : ToolUtil.urlJoin('https://images.dmzj.com/',jsonPath(data,'$.cover')),
			
			//链接
			url : ToolUtil.urlJoin('https://m.dmzj.com/info/',jsonPath(data,'$.comic_py')) + '.html'
			});
	}
	return JSON.stringify(array);
}
