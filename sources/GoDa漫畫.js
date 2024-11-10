function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1714491433,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230911,

		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "GoDa漫畫(包子漫画)",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/GoDa漫畫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources%2FGoDa漫畫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/GoDa漫畫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1731260539,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		

		//首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceList: [
			{
				type: 3,
				key: "baseUrl",
				name: "使用镜像网址",
				itemList: {
					"m.g-mh.org": baseUrl1,
					"godamh.com": "https://godamh.com",
					"manhuafree.com": "https://manhuafree.com",
					"baozimh.org": "https://baozimh.org",
					"bzmh.org": "https://bzmh.org/",
				},
				defaultValue: 0
			},
			{
				type: 3,
				key: "imgBaseUrl",
				name: "切换图源线路",
				itemList: {
					"线路1": imgBaseUrl1,
					"线路2": "https://t40-1-4.g-mh.online",
				},
				defaultValue: 0
			}
		],

		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
                "order": {
					"时间排序": "dayup",
					"人气排序": "hots",
					"发布排序": "newss",
				},
			},
			"漫画": ["order"]
		}
	});
}

const baseUrl1 = "https://m.g-mh.org";
const baseUrl = JavaUtils.getPreference().getString("baseUrl", baseUrl1);
const imgBaseUrl1 = "https://f40-1-4.g-mh.online";
/**
 * https://nav.telltome.net
 * https://cocolamanhua.com
 * 
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/s/' + encodeURI(key));
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".cardlist > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.cardtitle').text(),

				//封面网址
				coverUrl: JavaUtils.decodeURI(element.selectFirst('img').absUrl('src').match(/url=([^&]+)/)[1]),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(order) {
	var url = JavaUtils.urlJoin(baseUrl, order);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		var elements = document.select(".cardlist > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.cardtitle').text(),

				//封面网址
				coverUrl: JavaUtils.decodeURI(element.selectFirst('img').absUrl('src').match(/url=([^&]+)/)[1]),
				
				//网址
				url: element.selectFirst('a').absUrl('href')
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
			name: document.selectFirst('.gap-unit-xs').text(),

			//作者
			author: document.selectFirst('.text-small > a > span').text(),

			//概览
			summary: document.selectFirst('.block > p').text(),
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(url, JavaUtils.urlJoin("https://api-get-v2.mgsearcher.com", `/api/manga/get?mid=${document.selectFirst('#firstchap').attr("data-mid")}&mode=all@header->referer:https://m.g-mh.org/`))
			//tocs: tocs(JavaUtils.urlJoin(baseUrl, `/manga/get?mid=${document.selectFirst('#firstchap').attr("data-mid")}&mode=all`))
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(detailUrl, url) {
	//创建章节数组
	var newChapters= [];
	
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const data = JSON.parse(response.body().string()).data;
		data.chapters.forEach(chapter => {
			newChapters.push({
				//章节名称
				name: chapter.attributes.title,

				//最近更新时间 仅兼容 1.4.9
				lastUpdateTime: JavaUtils.stringToTime(chapter.attributes.updatedAt, "yyyy-MM-dd'T'HH:mm:sss.SSS'Z'"),

				//章节网址
				url: JavaUtils.urlJoin("https://api-get-v2.mgsearcher.com",`/api/chapter/getinfo?m=${data.id}&c=${chapter.id}@header->referer:https://m.g-mh.org/`)
			})
		});
        return [{
            //目录名称
            name: "目录",
            //章节
            chapters: newChapters
        }]
    }
}
/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}

function tocs(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
        //创建章节数组
        var newChapters = [];
            
        //章节元素选择器
        var chapterElements = document.select('#allchapterlist > div');
        
        for (var i2 = 0;i2 < chapterElements.size();i2++) {
            var chapterElement = chapterElements.get(i2);
            newChapters.push({
                //章节名称
                name: chapterElement.selectFirst('.chaptertitle').text(),
            
                //最近更新时间 仅兼容 1.4.9
                lastUpdateTime: chapterElement.selectFirst('.italic').text(),

                //章节网址
                url: JavaUtils.urlJoin(baseUrl, `/chapter/getcontent?m=${chapterElement.selectFirst('a').attr('data-ms')}&c=${chapterElement.selectFirst('a').attr('data-cs')}`)
            });
        }
        return [{
            //目录名称
            name: "目录",
            //章节
            chapters: newChapters
        }]
    }
}
 */

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var images = [];
		JSON.parse(response.body().string()).data.info.images.images.forEach(element => {
			images.push(JavaUtils.urlJoin(JavaUtils.getPreference().getString("imgBaseUrl", imgBaseUrl1), element.url));
		});
		return JSON.stringify(images);
	}
}
/**
 * 内容
 * @params {string} url
 * @returns {string} content

function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
        var images = [];
        var elements = document.select('#chapcontent > div');
        for (var i2 = 0;i2 < elements.size();i2++) {
            var element = elements.get(i2);
            var img = element.selectFirst('img');
            var dataSrc = img.absUrl('data-src');
            if(dataSrc == null || dataSrc == ""){
                dataSrc = img.absUrl('src');
            }
            images.push(dataSrc)
        }
		return JSON.stringify(images);
	}
} 
*/