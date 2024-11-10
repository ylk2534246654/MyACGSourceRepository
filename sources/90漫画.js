function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652586404,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,
		
		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "90漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 7,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/90漫画.js",
			"KKGithub": "https://kkgithub.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/90漫画.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/90漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1695547967,
		
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
					"全部": "",
					"日本": "riben",
					"大陆": "dalu",
					"韩国": "hanguo"
				},
				"label": {
					"全部": "",
					"爱情": "aiqing",
					"魔法": "mofa",
					"校园": "xiaoyuan",
					"恐怖": "kongbu",
					"脑洞": "naodong",
					"灵异": "lingyi",
					"恋爱": "lianai",
					"虐心": "nuexin",
					"奇幻": "qihuan",
					"彩虹": "caihong",
					"都市": "dushi",
					"神鬼": "shengui",
					"搞笑": "gaoxiao",
					"战争": "zhanzheng",
					"武侠": "wuxia",
					"热血": "rexue",
					"冒险": "maoxian",
					"欢乐向": "huanlexiang",
					"格斗": "gedou",
					"爆笑": "baoxiao",
					"萌系": "mengji",
					"机甲": "jijia",
					"魔幻": "mohuan",
					"玄幻": "xuanhuan",
					"纯爱": "chunai",
					"唯美": "weimei",
					"科幻": "kehuan",
					"励志": "lizhi",
					"古风": "gufeng",
					"治愈": "zhiyu",
					"震撼": "zhenhan",
					"穿越": "chuanyue",
					"青春": "qingchun",
					"剧情": "juqing",
					"美食": "meishi",
					"竞技": "jingji",
					"悬疑": "xuanyi",
					"推理": "tuili",
					"幻想": "huanxiang",
					"神魔": "shenmo",
					"生活": "shenghuo",
					"动作": "dongzuo",
					"耽美": "danmei",
					"历史": "lishi",
					"运动": "yundong",
					"体育": "tiyu",
					"职场": "zhichang",
					"恶搞": "egao",
					"后宫": "hougong",
					"百合": "baihe",
					"社会": "shehui",
					"机战": "list"
				},
				"status": {
					"全部": "",
					"连载中": "lianzai",
					"已完结": "wanjie",
				},
				"order": {
					"更新排序": "update",
					"发布排序": "post",
					"点击排序": "click",
				},
			},
			"漫画": ["region","label","status","order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
		}
	});
}

const baseUrl = "http://www.90mh.org";
const imgBaseUrl = "http://js.tingliu.cc";
//http://www.90mh.org/js/config.js

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, `/search/?keywords=${encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".book-list > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.ell').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.tt').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('.updateon').text(),

				//概览
				//summary: element.selectFirst('').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.cover > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.ell > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(region, label, status, order) {
	var url = JavaUtils.urlJoin(baseUrl, `/list/${region}-${label}-${status}/${order}/`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".book-list > li");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.ell').text(),
				
				//最后章节名称
				lastChapterName: element.selectFirst('.tt').text(),

				//最近更新时间
				lastUpdateTime: element.selectFirst('.updateon').text(),

				//概览
				//summary: element.selectFirst('').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.cover > img').absUrl('src'),
				
				//网址
				url: element.selectFirst('.ell > a').absUrl('href')
			});
		}
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
			name: document.selectFirst('.book-title > h1 > span').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('.status > span > span').text(),
			
			//概览
			summary: document.selectFirst('#intro-all > p').text(),
	
			//封面网址
			coverUrl: document.selectFirst('.pic').absUrl('src'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
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
	//创建章节数组
	var newChapters = [];
		
	//章节元素选择器
	var chapterElements = document.select('[id~=chapter-list] > li');
	
	for (var i2 = 0;i2 < chapterElements.size();i2++) {
		var chapterElement = chapterElements.get(i2);
		
		newChapters.push({
			//章节名称
			name: chapterElement.selectFirst('a').text(),
			//章节网址
			url: chapterElement.selectFirst('a').absUrl('href')
		});
	}
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : newChapters
	}];
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		eval(String(JavaUtils.substring(response.body().string(), '<script>;var', '</script>')));
		var images = chapterImages.map(value => JavaUtils.urlJoin(imgBaseUrl, chapterPath  + value));
		return JSON.stringify(images);
	}
}