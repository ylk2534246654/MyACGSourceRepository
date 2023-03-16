function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1678969628,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230315,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 70,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "第五小说",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/第五小说.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/第五小说.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/第五小说.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/第五小说.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/第五小说.js",
		},
		
		//更新时间
		updateTime: "2023年3月16日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对链接处理并调用外部APP访问，1：对链接处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		groupName: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
		
		//发现
		findList: {
			"玄幻": "/xclass/1/1.html",
			"武侠": "/xclass/2/1.html",
			"都市": "/xclass/3/1.html",
			"穿越": "/xclass/4/1.html",
			"网游": "/xclass/5/1.html",
			"科幻": "/xclass/6/1.html"
		},
	});
}
const baseUrl = "https://m.diwuxs.com";
const header = '';

/**
 * 搜索
 * @param {string} key
 * @return {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = ToolUtils.urlJoin(baseUrl,'/search.php?keyword='+ encodeURI(key) + header);
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select(".list1 > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('.title').text(),
				
				//概览
                //.author > a[style]
				summary: element.selectFirst('.author > a:nth-child(2)').text(),
				
				//封面网址
				//coverUrl: element.selectFirst('').text(),
				
				//网址
				url: element.selectFirst('a[href]').absUrl('href')
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
	url = ToolUtils.urlJoin(baseUrl,url);
	const response = HttpRequest(url + header);
	var result= [];
	if(response.code() == 200){
		var document = response.document();
		var elements = document.select("#main > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//标题
				title: element.selectFirst('.title').text(),
				
				//概览
				summary: element.selectFirst('.review').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.lazy').absUrl('src'),
				
				//网址
				url: element.selectFirst('div.detail > a').absUrl('href')
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
			title: document.selectFirst('.title').text(),
			
			//作者
			author: document.selectFirst('.author > a').text(),
			
			//日期
			update: document.selectFirst('#book_detail > li:nth-child(4)').text(),
			
			//概览
			summary: document.selectFirst('.review').text(),

			//封面网址
			coverUrl: document.selectFirst('#thumb > img').absUrl('src'),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document.selectFirst('.recommend > h2:nth-child(3) > a').absUrl('href'))
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(url) {
	const response = HttpRequest(url + header);
	//创建目录数组
	var newTocs = [];
	if(response.code() == 200){
		const document = response.document();

        //目录元素选择器
        const tocElements= document.select('#chapterlist > p > a:not([style])');
        
        //创建章节数组
        var newChapters = [];
            
        //章节元素选择器
        var chapterElements = tocElements.select('a');
        
        for (var i2 = 0;i2 < chapterElements.size();i2++) {
            var chapterElement = chapterElements.get(i2);
            
            newChapters.push({
                //章节名称
                name: chapterElement.selectFirst('a').text(),
                //章节网址
                url: chapterElement.selectFirst('a').absUrl('href').replace('.html','_${p}.html@zero->1@start->1')
            });
        }
        newTocs.push({
            //目录名称
            name: '目录',
            //章节
            chapters: newChapters
        });
    }
	return newTocs
}

/**
 * 获取内容下一页网址（1.4.4 测试）
 * @returns {string} content
 */
function contentNextPageUrl() {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		const document = response.document();
        return document.select('#pt_next').absUrl('href');
    }
    return null;
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = HttpRequest(url + header);
	if(response.code() == 200){
		const document = response.document();
        return document.select('#chaptercontent > :matchText').outerHtml();
    }
    return null;
}