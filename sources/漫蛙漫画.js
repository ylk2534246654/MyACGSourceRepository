function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1658148699,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20240122,
		
		//优先级 1~100，数值越大越靠前
		priority: 80,
		
		//启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		enableInvalid: false,
		
		//@NonNull 搜索源名称
		name: "漫蛙漫画",

		//搜索源作者
		author: "Alexmmc,雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 5,

		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/漫蛙漫画.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/漫蛙漫画.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/漫蛙漫画.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1787253299,
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 1,
		
		/*首选项配置 type：（1:文本框，2:开关，3:单选框，4:编辑框，5:跳转链接）
		preferenceList: [
			{
				type: 3,
				key: "drive",
				name: "选择节点",
				itemList: {
					"节点1": "manwawang.com",
					
				},
				defaultValue: 0
			}
		],
		*/
		findList: {
			category: {
				"order": {
				
					"国产漫画": "1",
					"日本漫画": "2",
					"韩国漫画": "3",
					"欧美漫画": "4",
					},
				"label": {
						"全部": "1",
						"科幻": "867",
						"后宫": "868",
						"机甲": "869",
						"都市": "870",
						"恋爱生活": "871",
						"恋爱": "872",
						"恋爱": "873",
						"其他": "874",
						"推理悬疑": "875",
						"魔法": "876",
						"奇幻": "877",
						"异世界": "878",
						"滑稽搞笑": "879",
						"重生": "880",
						"励志": "881",
						"浪漫": "882",
						"逆袭": "883",
						"脑洞": "884",
						"日常": "885",
						"热血机战": "886",
						"魔法/奇幻": "887",
						
					}
				
			},
		   "漫画": {
				functionName: "find",
				param: ["order","label"]
            }
        },
        
		//分组
		group: ["漫画"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://manwawang.com/",

		//全局 HTTP 请求头列表
		httpRequestHeaderList: {
			"user-agent-system": "Windows NT 10.0; Win64; x64",
			"referer" :"https://manwawang.com/"
		}
	});
}

//全局变量
const drive = "manwawang.com";
// 备用网站：https://manwali.cc/、https://manwamh5.com/、http://www.mwrr.cc/

const baseUrl 	= "https://" + drive;
const searchBaseUrl 	= "https://manwawang.com";
const imgBaseUrl   =  "https://img1.baipiaoguai.org";

//简化
var Jsoup = org.jsoup.Jsoup;

//序列化搜索数据
function unpack(data) {
        var result = [];
	    var doc=Jsoup.parse(data);
		var items=doc.getElementsByClass("manga-i-list-item");
		
		for (var i = 0;i < items.size();i++) {
		
		     var itemdoc=Jsoup.parse(items.get(i).html());
		     var title=itemdoc.getElementsByClass("manga-i-list-title").get(0).text();
		      var subtitle=itemdoc.getElementsByClass("manga-i-list-subtitle").get(0).text();
		      var imgurl=itemdoc.select("img[src]").get(0).attr("src");
		      var itemurl=itemdoc.select("a[href]").get(0).attr("href");
		      
			result.push({
				//名称
				name: title ,
				
				//概览
				summary: subtitle,
				//summary: imgurl,
				//封面
				coverUrl: imgurl,
				
				//网址
				url: searchBaseUrl+itemurl,
				
				//url: "url"
			});
		}     
		return JSON.stringify(result);
}


/**
 * 搜索
 * @param {string} key
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function search(key) {

   
	var murl = JavaUtils.urlJoin(searchBaseUrl, `/search?&key=${encodeURI(key)}`);
	var result = [];
	const response = JavaUtils.httpRequest(murl);
	JavaUtils.log(searchBaseUrl);
	if(response.code() == 200){
		//const $ = JSON.parse(response.body().string());
		
		   
			
			
		
		return unpack(response.body().getString());
	}else
	return null;
}


/**
 * 发现
 * @return {[{name, author, lastChapterName, lastUpdateTime, summary, coverUrl, url}]}
 */
function find(order , label) {
     const a1="/category/list/";
     const a2="/tags/";
     var ud="";
     switch (order)
      {  
       case "1":  
         ud=a1+"1";
         break;  
       case "2":  
         ud=a1+"2";
         break;
       case "3":  
         ud=a1+"3";
         break;      
       case "4":  
         ud=a1+"4";
         break;    
       default:  
         ud=a1+"1";
    // 如果 expression 不匹配任何 case 值，则执行 default 子句中的代码块  
         break;  
      }
      
      if(label!="1") {
      ud=ud+a2+label;
      }
      
	var url = JavaUtils.urlJoin(baseUrl, ud);
	var result = [];
	const response = JavaUtils.httpRequest(url);
		if(response.code() == 200){
		//const $ = JSON.parse(response.body().string());
		return unpack(response.body().getString());
	}else
	return null;
	
}


/**
 * 详情
 * @return {[{name, author, lastUpdateTime, summary, coverUrl, enableChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		//const document = response.body().cssDocument();
		
		var doc=Jsoup.parse(response.body().getString());
		
		//标题 作者
		var maindoc=Jsoup.parse(doc.getElementsByClass("detail-main").get(0).html());
		
		var title=maindoc.getElementsByClass("detail-main-title").get(0).text();
		var namedoc=Jsoup.parse(maindoc.getElementsByClass("detail-main-subtitle").get(0).html());
		var name1=namedoc.select("span").get(1).text();
		var content=maindoc.getElementsByClass("detail-main-content").get(0).text();
		//最后更新时间
		var updatetime=doc.getElementsByClass("detail-list-left").get(0).text();
		
		//章节
		var listdoc=Jsoup.parse(doc.getElementsByClass("detail-list-con").get(0).html());
		
		
		
		return JSON.stringify({
			//标题
			name: title,
			
			//作者
			author: name1,
			
			//最近更新时间
			lastUpdateTime: updatetime,
			
			//概览
			summary: content,
	
			//封面网址
			//coverUrl: document.selectFirst('div.video_detail_cover > img').absUrl('data-original'),
			
			//启用章节反向顺序
			enableChapterReverseOrder: true,
			
			//目录加载
			tocs: tocs(listdoc)
		});
	}
	return null;
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	//目录标签元素选择器
	
	var list=document.getElementsByClass("detail-list-item");
	//创建目录数组
	var newTocs = [];
	var newChapters = [];
	
	for (var i = 0;i < list.size();i++) {
		//创建章节数组
		
		var name=list.get(i).select("a").get(0);
		var url=list.get(i).select("a[href]").get(0).attr("href");
		
	    newChapters.push({
				//章节名称
				name: name.text(),
				//章节网址
				url: searchBaseUrl+url
			});
		
		
	}
	 newTocs.push({
			//目录名称
			name: "默认接口",
			//章节
			chapters : newChapters
		});
	
	return newTocs;
}

/**
 * 内容
 * @return {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	//创建漫画数组
	var result = [];
	if(response.code() == 200){
		 var ts=response.body().getString();
		 var start=ts.indexOf("params");
		 var end=ts.indexOf(";",start);
		 var out=ts.slice(start+9,end);
		 
		 var js="javascript:decryptParams("+out+")";
		 var jsout = JavaUtils.webViewEvalJS("https://manwawang.com/chapter/429108/140027",js);
		 
		 var jsondt=JSON.parse(jsout);
		 var images = jsondt.images;
	
	
		for(var i=0;i<images.length;i++){
			var imgurl = JavaUtils.urlJoin(imgBaseUrl, images[i]);
			result.push(
				imgurl
			);
		}
		return JSON.stringify(result);
	}
	return null;
}