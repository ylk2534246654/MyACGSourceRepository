function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652783603,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,
		
		//优先级 1~100，数值越大越靠前
		priority: 20,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "动漫之家",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫之家.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/动漫之家.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/动漫之家.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/动漫之家.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1696882686,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			category: {
				"region": {
					"全部": "0",
					"日本": "1",
					"内地": "2",
					"欧美": "3",
					"港台": "4",
					"韩国": "5",
					"其他": "6"
				},
				"label": {
					"全部": "0",
					"冒险": "1",
					"欢乐向": "2",
					"格斗": "3",
					"科幻": "4",
					"爱情": "5",
					"竞技": "6",
					"魔法": "7",
					"校园": "8",
					"悬疑": "9",
					"恐怖": "10",
					"生活亲情": "11",
					"百合": "12",
					"伪娘": "13",
					"耽美": "14",
					"后宫": "15",
					"萌系": "16",
					"治愈": "17",
					"武侠": "18",
					"职场": "19",
					"奇幻": "20",
					"节操": "21",
					"轻小说": "22",
					"搞笑": "23"
				},
				"label2": {
					"全部": "0",
					"少年": "1",
					"少女": "2",
					"青年": "3"
				},
				"status": {
					"全部": "0",
					"连载": "1",
					"完结": "2"
				},
				"order": {
					"人气排序": "0",
					"时间排序": "1"
				},
			},
			"漫画": ["region","label","label2","status","order"]
		},
		
		//启用用户登录
		enableUserLogin: true,
		
		//用户登录网址
		userLoginUrl: "https://m.dmzj.com/my.html@header->Referer:http://m.idmzj.com/",
		
		//需要用户登录的功能（search，detail，content，find）
		requiresUserLoginList: ["content"],
	});
}

const baseUrl = "https://m.dmzj.com";
const imgBaseUrl = "https://images.dmzj.com";

/*
 * 是否完成登录
 * @param {string} url		网址
 * @param {string} responseHtml	响应源码
 * @return {boolean}  登录结果
 */
function isUserLoggedIn(url, responseHtml) {
	if(!JavaUtils.isEmpty(url) && !JavaUtils.isEmpty(responseHtml) && url.startsWith(baseUrl)){
		return verifyUserLoggedIn()
	}
	return false;
}
/*
 * 验证完成登录
 * @return {boolean} 登录结果
 */
function verifyUserLoggedIn() {
	var strU = JavaUtils.webViewEvalJS("https://m.dmzj.com/my.html", "window.location.href");
	if(strU.indexOf("my.html") != -1){
		return true;
	}else {
		return false;
	}
}

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search/' + encodeURI(key)) + '.html';
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var serchArry = JavaUtils.substring(response.body().string(),'serchArry=','</script>');
		if(!JavaUtils.isEmpty(serchArry)){
			JSON.parse(serchArry).forEach((child) => {
				result.push({
					//名称
					name: child.name,
		
					//最后章节名称
					lastChapterName: child.last_update_chapter_name,

					//最近更新时间
					lastUpdateTime: child.last_updatetime,
					
					//概览
					summary: child.description,
					
					//封面网址
					coverUrl: JavaUtils.urlJoin(imgBaseUrl, child.cover),
					
					//网址
					url: JavaUtils.urlJoin(baseUrl, `/info/${child.comic_py}.html`)
				});
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region, label, label2, status, order) {
	var url = JavaUtils.urlJoin(baseUrl, `/classify/${label}-${label2}-${status}-${region}-${order}-0.json`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).forEach((child) => {
			result.push({
				//名称
				name : child.name,
		
				//最后章节名称
				lastChapterName: child.last_update_chapter_name,

				//最近更新时间
				lastUpdateTime: child.last_updatetime,
				
				//概览
				summary: child.description,
				
				//封面网址
				coverUrl: JavaUtils.urlJoin(imgBaseUrl, child.cover),
				
				//网址
				url: JavaUtils.urlJoin(baseUrl, `/info/${child.comic_py}.html`)
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return JSON.stringify({
			//标题
			name: document.selectFirst('#comicName').text(),
			
			//作者
			author: document.selectFirst('p.txtItme:nth-child(1)').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('span.date').text(),
			
			//概览
			summary: document.selectFirst('p.txtDesc.autoHeight').text(),
	
			//封面网址
			coverUrl: document.selectFirst('#Cover > img').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(response)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(response) {
	//创建目录数组
	var newTocs = [];
	var initIntroData = JavaUtils.substring(response.body().string(),'initIntroData(',');');
	if(!JavaUtils.isEmpty(initIntroData)){
		JSON.parse(initIntroData).forEach((child) => {
			//创建章节数组
			var newChapters = [];
			child.data.forEach((chapter) => {
				newChapters.push({
					//章节名称
					name: chapter.chapter_name,
					//章节网址
					url: JavaUtils.urlJoin(baseUrl, `/view/${chapter.comic_id}/${chapter.id}.html`)
				});
			});
			newTocs.push({
				//目录名称
				name: child.title,
				//章节
				chapters: newChapters
			});
		});
	}
	return newTocs;
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var page_url = JavaUtils.substring(response.body().string(), 'page_url":', ']');
		if(!JavaUtils.isEmpty(page_url)){
			JavaUtils.setUserLoginStatus(true);
			return page_url + "]";
		}else{
			JavaUtils.setUserLoginStatus(false);
		}
	}
	return null;
}