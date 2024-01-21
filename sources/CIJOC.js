function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1704523847,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20231215,

		//优先级 1~100，数值越大越靠前
		priority: 50,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "CIJOC",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/CIJOC.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/CIJOC.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/CIJOC.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/CIJOC.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1704523847,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,

		//分组
		group: ["小说","轻小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"type": {
					"最新更新": "update",
					"日輕小說": "ranobe",
					"原創小說": "orujinaru",
				}
			},
			"轻小说": ["type"]
		},
        
		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64"
		}
	});
}

const baseUrl = "https://cijoc.com";
const baseUrlApi = "https://api.cijoc.com";

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrlApi, `/search?type=all&keyword=${key}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
    if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.kekka.novel.list.forEach((child) => {
			result.push({
                //名称
                name: child.novel_name,
        
                //最近更新时间
                lastUpdateTime: child.updatedAt,
        
                //封面网址
                coverUrl: child.novel_cover,
        
                //网址
                url: child.novel_id
			});
		});
    }
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(type) {
	var url = JavaUtils.urlJoin(baseUrlApi, `/novel/${type}`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
        var list = null
        if("ranobe" in $.kekka){
            list = $.kekka.ranobe
        }else {
            list = $.kekka.list
        }
        list.forEach((child) => {
			result.push({
                //名称
                name: child.novel_name,
        
                //最近更新时间
                lastUpdateTime: child.updatedAt,
        
                //封面网址
                coverUrl: child.novel_cover,
        
                //网址
                url: child.novel_id
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(id) {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrlApi, `/novel/id/${id}`));
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string()).kekka;
		return JSON.stringify({
			//标题
			name: $.novel_name,

            //作者
            author: $.author,

			//最近更新时间
			lastUpdateTime: $.updatedAt,
			
			//概览
			summary: $.novel_info,
	
			//封面网址
			coverUrl: $.poster.avatar,
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(id, $.volume)
		});
	}
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(id, volume) {
	//创建章节数组
	var newChapters = [];
    volume.forEach((child) => {
        child.chapter.forEach((child2) => {
			newChapters.push({
				//章节名称
				name: child2.chapter_name,
                
				//最近更新时间
				lastUpdateTime: child2.updatedAt,

				//章节网址
				url: JavaUtils.urlJoin(baseUrlApi,`/chapter/${id}/${child2.chapter_id}`)
			});
        });
    });
    if(newChapters.length == 0){
        newChapters.push({
            //章节名称
            name: "无资源",

            //章节网址
            url: "null",
        })
    }
	return [{
		//目录名称
		name: '目录',
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
		return JSON.parse(response.body().string()).kekka.chapter_content;
	}
	return null;
}

