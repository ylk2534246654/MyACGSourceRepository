function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654838580,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,

		//优先级 1~100，数值越大越靠前
		priority: 0,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: true,
		
		//@NonNull 搜索源名称
		name: "vomic漫画",

		//搜索源作者
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/vomic漫画.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/vomic漫画.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/vomic漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1709974234,
		
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
					"api.vomicmh.com": "http://api.vomicmh.com",
					"119.23.243.52": "http://119.23.243.52",
				},
				defaultValue: 1
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
                    "热门榜": "1",
                    "实时榜": "2",
                    "一日榜": "3",
                    "一周榜": "4",
                    "一月榜": "5",
                    "收藏榜": "6",
                    "可惜榜": "7",
                    "上升榜": "8",
                    "其他榜": "9",
                    "热血榜": "10",
                    "玄幻榜": "11",
                    "冒险榜": "12",
                    "奇幻榜": "13",
                    "日本榜": "14",
                    "大陆榜": "15",
                    "韩国榜": "17",
                },
			},
			"漫画": ["order"]
		},

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64",
			"Referer": baseUrl,
		}
	});
}

const baseUrl = "https://www.iewoai.com";
const apiBaseUrl = JavaUtils.getPreference().getString("baseUrl", "http://119.23.243.52");
/**
 * 备份：
 * http://api.vomicmh.com
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(apiBaseUrl, `/api/v1/search/search-comic-data?title=${encodeURI(key)}&page=1`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.result.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//最近更新章节名称
				lastChapterName: child.latest_chapter.title,

            	//最近更新时间
            	lastUpdateTime: child.latest_chapter.update_time,

				//源子名称
				sourceSubName: child.site.site_cn,
		
				//封面网址
				coverUrl: child.cover_img_url,
		
				//网址
				url: child.mid
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
	var url = JavaUtils.urlJoin(apiBaseUrl, `/api/v1/rank/rank-data?rank_id=${order}&page=1`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const $ = JSON.parse(response.body().string());
		$.data.result.forEach((child) => {
			result.push({
				//名称
				name: child.title,
		
				//概览
				summary: child.description,
		
				//源子名称
				sourceSubName: child.site.site_en,

				//封面网址
				coverUrl: child.cover_img_url,
		
				//网址
				url: child.mid
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
	var url = JavaUtils.urlJoin(apiBaseUrl, `/api/v1/detail/get-comic-detail-data?mid=${id}`);
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
        const $ = JSON.parse(response.body().string());
        return JSON.stringify({
            //名称
            name: $.data.title,

            //作者
            author: $.data.authors_name,

            //最近更新时间
            lastUpdateTime: $.data.update_time,

            //概览
            summary: $.data.description,
		
			//源子名称
			sourceSubName: $.data.site.site_cn,

            //封面网址
            coverUrl: $.data.cover_img_url,

            //启用章节反向顺序
            enableChapterReverseOrder: true,

            //目录加载
            tocs: tocs($.data.mid)
        });
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(mid) {
    _mid = mid;
	var url = JavaUtils.urlJoin(apiBaseUrl, `/api/v1/detail/get-comic-detail-chapter-data?mid=${mid}`);
	const response = JavaUtils.httpRequest(url);
    //创建章节数组
    var newChapters = [];
	if(response.code() == 200){
        const $ = JSON.parse(response.body().string());
        
		$.data.forEach((child) => {
            newChapters.push({
                //章节名称
                name: child.title,
				
				//最近更新时间
				lastUpdateTime: child.update_time,

                //章节网址
                url: JSON.stringify({
                    mid: mid,
                    cid: child.cid
                })
            });
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
function content(jsonStr) {
    var json = JSON.parse(jsonStr);
    var cid = json.cid;
    var mid = String(json.mid).replace("\n", "");
    var iv = "k8tUyS$m";
    var jsonStr = "cid=" + cid + "&mid=" + mid;
    var randomStr = getRandomStr();
    var timeStamp = String(Date.now());
    var str = randomStr + iv + jsonStr + timeStamp;
    var sign = JavaUtils.base64EncodeToString(JavaUtils.encrypt3DES(JavaUtils.strToBytes(str), randomStr, "DESede/CBC/PKCS7Padding", iv));
    
    var chapterUrl = JavaUtils.urlJoin(apiBaseUrl, `/api/v2/page/get-comic-page-img-data?k=${randomStr}&t=${timeStamp}&e=${encodeURIComponent(sign)}`);
	const response = JavaUtils.httpRequest(chapterUrl);
	if(response.code() == 200){
        var arr = JSON.parse(response.body().string()).data;
        arr.map( (x) => {
          var bzcdn = "https://s1-fdca1-jptky.baozicdn.com";
         //上面为包子漫画图片cdn，可自行更换
          return x.replace(/http.*?baozi.*?com/g, bzcdn);
        });
        return JSON.stringify(arr);
    }
    return null;
}

function getRandomStr() {
    const salt_str = "zxcvbnmlkjhgfdsaqwertyuiop0987654321QWERTYUIOPLKJHGFDSAZXCVBNM";
    let str = "";
    for (let i = 0; i < 24; i++) {
            let index = parseInt(Math.random() * 61);
            str += salt_str.charAt(index);
    };
    return str;
};