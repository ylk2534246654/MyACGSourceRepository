function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1714390264,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240204,

		//优先级 1~100，数值越大越靠前
		priority: 40,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "Komiic漫畫",

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
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/Komiic漫畫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/Komiic漫畫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/Komiic漫畫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1714390264,
		
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
				"order": {
					"最新": "DATE_UPDATED",
					"最热": "MONTH_VIEWS",
				}
			},
			"漫画": ["order"]
		}
	});
}

const baseUrl = "https://komiic.com";
/**
 * https://patreon.com/user?u=85216091
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
    var data = `{"operationName":"searchComicAndAuthorQuery","variables":{"keyword":"${key}"},"query":"query searchComicAndAuthorQuery($keyword: String!) {\\n  searchComicsAndAuthors(keyword: $keyword) {\\n    comics {\\n      id\\n      title\\n      status\\n      year\\n      imageUrl\\n      authors {\\n        id\\n        name\\n        __typename\\n      }\\n      categories {\\n        id\\n        name\\n        __typename\\n      }\\n      dateUpdated\\n      monthViews\\n      views\\n      favoriteCount\\n      lastBookUpdate\\n      lastChapterUpdate\\n      __typename\\n    }\\n    authors {\\n      id\\n      name\\n      chName\\n      enName\\n      wikiLink\\n      comicCount\\n      views\\n      __typename\\n    }\\n    __typename\\n  }\\n}"}`
	var url = JavaUtils.urlJoin(baseUrl, `/api/query@post->${data}@header->Content-Type:application/json`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		JSON.parse(response.body().string()).data.searchComicsAndAuthors.comics.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//最后章节名称
				lastChapterName: child.lastChapterUpdate,

				//最近更新时间
				lastUpdateTime: JavaUtils.stringToTime(child.dateUpdated, "yyyy-MM-dd'T'HH:mm:ss'Z'"),

				//封面网址
				coverUrl: JavaUtils.urlJoin(baseUrl, child.imageUrl),
		
				//网址
				url: child.id
			});
		});
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(order) {
    var data
    if(order == "DATE_UPDATED"){
        data = `{"operationName":"recentUpdate","variables":{"pagination":{"limit":20,"offset":0,"orderBy":"DATE_UPDATED","status":"","asc":true}},"query":"query recentUpdate($pagination: Pagination!) {\\n  recentUpdate(pagination: $pagination) {\\n    id\\n    title\\n    status\\n    year\\n    imageUrl\\n    authors {\\n      id\\n      name\\n      __typename\\n    }\\n    categories {\\n      id\\n      name\\n      __typename\\n    }\\n    dateUpdated\\n    monthViews\\n    views\\n    favoriteCount\\n    lastBookUpdate\\n    lastChapterUpdate\\n    __typename\\n  }\\n}"}`
    }else{
        data = `{"operationName":"hotComics","variables":{"pagination":{"limit":20,"offset":0,"orderBy":"MONTH_VIEWS","status":"","asc":true}},"query":"query hotComics($pagination: Pagination!) {\\n  hotComics(pagination: $pagination) {\\n    id\\n    title\\n    status\\n    year\\n    imageUrl\\n    authors {\\n      id\\n      name\\n      __typename\\n    }\\n    categories {\\n      id\\n      name\\n      __typename\\n    }\\n    dateUpdated\\n    monthViews\\n    views\\n    favoriteCount\\n    lastBookUpdate\\n    lastChapterUpdate\\n    __typename\\n  }\\n}"}`
    }
	var url = JavaUtils.urlJoin(baseUrl, `/api/query@post->${data}@header->Content-Type:application/json`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
        var json;
        if(order == "DATE_UPDATED"){
            json = JSON.parse(response.body().string()).data.recentUpdate;
        }else{
            json = JSON.parse(response.body().string()).data.hotComics;
        }
		json.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//最后章节名称
				lastChapterName: child.lastChapterUpdate,

				//最近更新时间
				lastUpdateTime: JavaUtils.stringToTime(child.dateUpdated, "yyyy-MM-dd'T'HH:mm:ss'Z'"),

				//封面网址
				coverUrl: JavaUtils.urlJoin(baseUrl, child.imageUrl),
		
				//网址
				url: child.id
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
    var data = `{"operationName":"comicById","variables":{"comicId":"${id}"},"query":"query comicById($comicId: ID!) {\\n  comicById(comicId: $comicId) {\\n    id\\n    title\\n    status\\n    year\\n    imageUrl\\n    authors {\\n      id\\n      name\\n      __typename\\n    }\\n    categories {\\n      id\\n      name\\n      __typename\\n    }\\n    dateCreated\\n    dateUpdated\\n    views\\n    favoriteCount\\n    lastBookUpdate\\n    lastChapterUpdate\\n    __typename\\n  }\\n}"}`
    var url = JavaUtils.urlJoin(baseUrl, `/api/query@post->${data}@header->Content-Type:application/json`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var child = JSON.parse(response.body().string()).data.comicById;
		return JSON.stringify({
			//名称
			name: child.title,
		
			//最后章节名称
			lastChapterName: child.lastChapterUpdate,

			//最近更新时间
			lastUpdateTime: JavaUtils.stringToTime(child.dateUpdated, "yyyy-MM-dd'T'HH:mm:ss'Z'"),

			//封面网址
			coverUrl: JavaUtils.urlJoin(baseUrl, child.imageUrl),

			//启用章节反向顺序
			enableChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(id)
		});
	}
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(id) {
    var data = `{"operationName":"chapterByComicId","variables":{"comicId":"${id}"},"query":"query chapterByComicId($comicId: ID!) {\\n  chaptersByComicId(comicId: $comicId) {\\n    id\\n    serial\\n    type\\n    dateCreated\\n    dateUpdated\\n    size\\n    __typename\\n  }\\n}"}`
    var url = JavaUtils.urlJoin(baseUrl, `/api/query@post->${data}@header->Content-Type:application/json`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
        //创建目录数组
        var newCatalogs = [];
        
		//创建章节数组
		var newBook = [];
		var newChapters = [];

		JSON.parse(response.body().string()).data.chaptersByComicId.forEach((child) => {
            var dd = {
                //章节名称
                name: child.serial,

                //最近更新时间
                lastUpdateTime: JavaUtils.stringToTime(child.dateUpdated, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
                

				//概览
				summary:child.size + "p",

                //章节网址
                url: JavaUtils.urlJoin(baseUrl, `/comic/${id}/chapter/${child.id}/images/all`)
            }
            if(child.type == "chapter"){
                newChapters.push(dd);
            }else{
                newBook.push(dd);
            }
		});

        if(newBook.length > 0){
            newCatalogs.push({
                //目录名称
                name: " 卷 ",

                //章节
                chapters : newBook
            })
        }
        if(newChapters.length > 0){
            newCatalogs.push({
                //目录名称
                name: " 话 ",

                //章节
                chapters : newChapters
            })
        }

        return newCatalogs;
	}
	return null;
}

/**
 * 内容
 * @params {string} jsonStr
 * @returns {string} content
 */
function content(url_) {
    var chapterId = JavaUtils.substring(url_,"/chapter/","/");

    var data = `{"operationName":"imagesByChapterId","variables":{"chapterId":"${chapterId}"},"query":"query imagesByChapterId($chapterId: ID!) {\\n  imagesByChapterId(chapterId: $chapterId) {\\n    id\\n    kid\\n    height\\n    width\\n    __typename\\n  }\\n}"}`
    var url = JavaUtils.urlJoin(baseUrl, `/api/query@post->${data}@header->Content-Type:application/json`);
    const response = JavaUtils.httpRequest(url);
    if(response.code() == 200){
        var urls = []
        JSON.parse(response.body().string()).data.imagesByChapterId.forEach((child) => {
            urls.push(JavaUtils.urlJoin(baseUrl, `/api/image/${child.kid}@header->Referer:${url_}`));
        });
        return JSON.stringify(urls);
    }
}