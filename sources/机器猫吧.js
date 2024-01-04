function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704338350,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "机器猫吧",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/机器猫吧.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/机器猫吧.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/机器猫吧.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/机器猫吧.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704338350,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,
	});
}

const baseUrl = "https://www.dora-family.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var result = [];
    if(key != null && key.toLowerCase().indexOf("哆啦a梦") != -1){
        result.push({
            //名称
            name: "哆啦A梦新番",
            
            //最后章节名称
            //lastChapterName: element.selectFirst('.video_play_status').text(),
            
            //最近更新时间
            //lastUpdateTime: element.selectFirst('.video_play_status').text(),

            //概览
            //summary: element.selectFirst('.desc > :matchText').text(),
            
            //封面网址
            //coverUrl: element.selectFirst('div.video_cover > div > a > img').absUrl('data-original'),
            
            //网址
            url: "https://www.dora-family.com/Resource:TV"
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
			name: "哆啦A梦新番",

			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
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
    var chapterElements = document.select('.listCell');
		
    for (var i2 = 0;i2 < chapterElements.size();i2+=2) {
        var chapterElement = chapterElements.get(i2);
        var urlElement = chapterElements.get(i2 + 1);
        
        newChapters.push({
            //章节名称
            name: chapterElement.selectFirst('.textBold').text(),

            //最近更新时间
            lastUpdateTime: chapterElement.selectFirst('.textRegular').text(),

			//概览
			summary: chapterElement.selectFirst('.textComment').text(),
            
            //章节网址
            url: urlElement.selectFirst('[data-src]').absUrl('data-src')
        });
    }
	return [{
        //目录名称
        name: "目录",
        //章节
        chapters : newChapters
    }];
}

