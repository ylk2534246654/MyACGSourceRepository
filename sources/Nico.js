function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1713425276,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240419,

		//优先级 1~100，数值越大越靠前
		priority: 1,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "Nico",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/README.md",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md"
		],

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Nico.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Nico.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/Nico.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1713425276,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		//分组
		group: ["漫画", "动漫", "轻小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"date":{
					"本月": "monthly",
					"本季": "quarterly",
					"本年": "yearly",
				}
			},
			2: {
                "漫画": ["comic","date"],
            },
			3: {
                "动漫": ["video","date"],
            },
			4: {
                "轻小说": ["novel","date"],
            }
		}
	});
}

const baseUrl = "https://nicohub.cc";
/**
 * 备份：https://nicohub.net
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key, group, page) {
    var board = "";
    if(group != "全部"){
        if(group == "轻小说"){
            group = "小说";
        }
        board = "board:" + group + " ";
    }
	var url = JavaUtils.urlJoin(baseUrl, `/api/search/@post->query=${JavaUtils.encodeURIComponent(board + key)}&page=1`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.forEach((child) => {
			var resultType = 0;
			var resultGroup;
			if(child.category == "video"){
				resultType = 3;
				resultGroup = "动漫"
			}else if(child.category == "novel"){
				resultType = 4;
				resultGroup = "轻小说"
			}else if(child.category == "comic"){
				resultType = 2;
				resultGroup = "漫画"
			}else if(child.category == "sound"){
				resultType = 3;
				resultGroup = "音声"
			}
			result.push({
				//名称
				name: child.name,
		
				//作者
				author: child.author,
		
				//最后章节名称
				//lastChapterName: child.latest_chapter_name,

				//最近更新时间
				lastUpdateTime: child.update_time,
		
				//概览
				summary: child.introduction,
		
                //默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
                type: resultType,

				//分组
				group: resultGroup,

				//封面网址
				coverUrl: child.cover,
		
				//网址
				url: `category=${child.category}&id=${child.id}`
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(category, date) {
	var url = JavaUtils.urlJoin(baseUrl, `/api/get/rank/@post->date_type=${encodeURI(date)}&category=${encodeURI(category)}&page=1`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.forEach((child) => {
			var type = 0;
			if(child.category == "video"){
				type = 3;
			}else if(child.category == "novel"){
				type = 4;
			}else if(child.category == "comic"){
				type = 2;
			}
			result.push({
				//名称
				name: child.name,
		
				//作者
				author: child.author,
		
				//最后章节名称
				//lastChapterName: child.latest_chapter_name,

				//最近更新时间
				lastUpdateTime: child.update_time,
		
				//概览
				summary: child.introduction,
		
                //默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
                type: type,

				//封面网址
				coverUrl: child.cover,
		
				//网址
				url: `category=${child.category}&id=${child.id}`
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(data_) {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/api/get/info/@post->` + data_));
	if(response.code() == 200){
		var data = JSON.parse(response.body().string()).data;
		return JSON.stringify({
			//名称
			name: data.name,
			
			//作者
			author: data.author,
			
			//最近更新时间
			lastUpdateTime: data.update_time,
			
			//概览
			summary: data.introduction,
	
			//封面网址
			coverUrl: data.cover,
			
			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(data.category, data.id, data.episode_count)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(category, id, episode_count) {
	//创建章节数组
	var newChapters= [];

	const chunkSize = 20; // 要分批处理的数据量
	const size = Math.floor(episode_count / chunkSize) + 1;
	for (let i = 1; i <= size; i ++) {
		var response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/api/get/episode/page/@post->category=${category}&id=${id}&page=${i}&limit=${chunkSize}`));
		if(response.code() == 200){
			JSON.parse(response.body().string()).data.forEach((child) => {
				newChapters.push({
					//章节名称
					name: child.name,

					//最近更新时间
					lastUpdateTime: child.update_time,
					
					//章节网址
					url: `category=${category}&post_id=${id}&id=${child.id}`
				});
			});
		}
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
function content(data_) {
	const response = JavaUtils.httpRequest(JavaUtils.urlJoin(baseUrl, `/api/get/episode/@post->${data_}`));
	if(response.code() == 200){
		JavaUtils.log(response.body().string());
		var param = JSON.parse(response.body().string()).data.param;
		if(data_.indexOf("novel") != -1){
			return JavaUtils.base64DecodeToString(param);
		}else if(data_.indexOf("video") != -1){
			return param.hls.resolution[720].path;
		}else if(data_.indexOf("comic") != -1){
			var imgs = [];
			param.img.forEach((child) => {
				imgs.push(child.path);
			});
			return JSON.stringify(imgs);
		}
	}
}