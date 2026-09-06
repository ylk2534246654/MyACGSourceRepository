function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1652592780,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 30,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "ESJ Zone",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 3,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/ESJZone.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/ESJZone.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/ESJZone.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1788674973,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["小说", "轻小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,//如果失效建议贴吧搜索最新网址

		//启用用户登录
		enableUserLogin: true,
		
		//用户登录网址
		userLoginUrl: JavaUtils.urlJoin(baseUrl, "my/login"),
	});
}
const baseUrl = "https://www.esjzone.one";
/**
 * 网站记录
 * www.esjzone.net
 * https://www.esjzone.one
 */


/*
 * 是否完成登录
 * @param {string} url		网址
 * @param {string} responseHtml	响应源码
 * @return {boolean}  登录结果
 */
function isUserLoggedIn(url, responseHtml) {
	if(url != null && url.indexOf('/my/profile') != -1){
		if(responseHtml.indexOf('個人資料') != -1){
			return true;
		}else{
			return false;
		}
	}
	return false;
}
/*
 * 验证完成登录
 * @return {boolean} 登录结果
 */
function verifyUserLoggedIn() {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, "/my/profile"));
	if(response.code() == 200){
		if(response.body().string().indexOf('個人資料') != -1){
			return true;
		}else{
			return false;
		}
	}
	return true;
}


/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/tags/' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select("div > div.row > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('h5.card-title > a').text(),
				
				//概览
				summary: element.selectFirst('div.card-ep').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.main-img > div').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('h5.card-title > a').absUrl('href')
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
			name: document.selectFirst('div.book-detail > h2.text-normal').text(),
			
			//作者
			author: document.selectFirst('ul.book-detail > li:nth-child(2) > a').text(),
			
			//最近更新时间
			lastUpdateTime: document.selectFirst('ul.book-detail > li:nth-child(3) > :matchText').text(),
			
			//概览
			summary: document.selectFirst('div.description').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.product-gallery > a > img').absUrl('src'),
			
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
    var volumesList = [];
    var currentGroupChapters = [];

    var chapterNodes = document.select('#chapterList > details,#chapterList > p,#chapterList > a');
    var currentGroupName = null;

    for (var nodeIndex = 0; nodeIndex < chapterNodes.size(); nodeIndex++) {
        var node = chapterNodes.get(nodeIndex);

        if (node.is("details")) {
            // 处理折叠卷（details 元素）
            var detailLinks = node.select("a");
            var volumeChapters = [];

            for (var linkIndex = 0; linkIndex < detailLinks.size(); linkIndex++) {
                var link = detailLinks.get(linkIndex);
                if (link.is("a")) {
                    volumeChapters.push({
                        name: link.selectFirst(':matchText').text(),
                        url: link.absUrl('href')
                    });
                }
            }
            volumesList.push({
                name: node.selectFirst("summary").text(),
                chapters: volumeChapters
            });
        } else if (node.is("p")) {
            // 普通卷名（p 标签表示新卷开始）
            if (currentGroupChapters.length > 0) {
                volumesList.push({
                    name: currentGroupName,
                    chapters: currentGroupChapters
                });
                currentGroupChapters = [];
            }
            currentGroupName = node.selectFirst(':matchText').text();
        } else if (node.is("a")) {
            // 普通章节（a 标签）
            currentGroupChapters.push({
                name: node.selectFirst(':matchText').text(),
                url: node.absUrl('href')
            });
        }
    }

    // 处理最后一组未放入卷的章节
    if (currentGroupChapters.length > 0) {
        volumesList.push({
            name: currentGroupName,
            chapters: currentGroupChapters
        });
    }

	var allChapters = [];
    for (var volIndex = 0; volIndex < volumesList.length; volIndex++) {
        var volume = volumesList[volIndex];
        var volumeName = volume.name;
        var chapterList = volume.chapters;
        for (var chapIndex = 0; chapIndex < chapterList.length; chapIndex++) {
            var chapter = chapterList[chapIndex];
			var name = chapter.name
			if(volumeName != null && volumeName.trim() !== "") {
			// 卷名 + 空格 + 章节名
				name = volumeName + " " + name;
			}
            allChapters.push({
                name: name,
                url: chapter.url
            });
        }
    }
	return [{
		//目录名称
		name: "目录",
		//章节
		chapters : allChapters
	}]
}

/**
 * 内容
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		return document.selectFirst('.forum-content,#content').outerHtml();
	}
	return null;
}