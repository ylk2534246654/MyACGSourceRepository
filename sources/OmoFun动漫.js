function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://pan.baidu.com/s/1kVkWknH',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1654703176,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230207,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 70,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isInvalid: false,
		
		//@NonNull 搜索源名称
		name: "OmoFun动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 2,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/OmoFun动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/OmoFun动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/OmoFun动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/OmoFun动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/OmoFun动漫.js",
		},
		
		//更新时间
		updateTime: "2023年2月9日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		group: ["动漫"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://www.omofun.tv",
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, coverUrl, url}]}
 */
function search(key) {
	var url = `http://103.91.210.141:2515/xgapp.php/v2/search?pg=1&text=${encodeURI(key)}&token=&csrf=gqcMwzohO0l%2FcuKwQUeYY6TeY8l3M6D0SQwfwzNJTpvfNP2X30FiGs8um0tslhdkVxPTwLLXCGBkTA1ONXAXr6Ajx2fWb7fwHQdNnipq143De%2Brq%2FBAOrJ0Uqb9anV14kUbsbRr8P6ZKLG%2BANj%2BYZEyH%2Flu6a%2FAD4iekfTf9SA8%3D` + header;
	const response = httpRequest(url);
	var array = []
	const $ = JSON.parse(response);
	$.data.forEach((child) => {
		array.push({
			//标题
			title: child.vod_name,
			
			//概览
			summary: child.vod_class,
			
			//封面网址
			coverUrl: child.vod_pic,
			
			//网址
			url: child.vod_id,
		})
	})
	return JSON.stringify(array)
}

/**
 * 详情
 * @returns {[{title, author, date, summary, coverUrl, isReverseOrder, catalogs:{[{name, chapters:{[{name, url}]}}]}}]}
 */
function detail(id) {
	const response = httpRequest(`http://103.91.210.141:2515/xgapp.php/v2/video_detail?id=${id}&ck=PmJag8SWhbuByo%2FjYOpOO44qrkaqIKk1Gv4qgT2q47g3X5yfdyUcBmcpQLhBiPmS%2B1uCpYypSeedNYTJjbyESEbIfTaSadOG9keaxpB%2BVmJSOs9Mnt65Xo6QIX4%2Fjtpu2ilHN8%2B1VcVdOHZtVZWYd5bNZg1FrhcsqR7geK9%2BfYkPEjFutBbu2gBmgYJtFsYYN%2FOlMNsEZq8nuZUsx%2Bts9fT%2FzFuQHHBypst5UmcfaJ5PpV0caKgWB2Gcok5NSNe%2B5%2BfZcDe05BwqUG1V6OHTz1iq9IL6zqbY1Y7ukAhdO%2FYYEzXnygWqheM52HU1zABjNDux3K1HpxI9IXvNI3ga4DIGf2EzEQUTcLehdSJQ1IwKK8ZOyqfON9r%2F2S4ZIwI9xGLVs7a9BRKv99Qlf6KxSmqMy%2F4qUEOjoqesuSHcQVga%2F4xq1hNm3B18rf8aVM1g6H7Nu0X1uXSKvCtGeQf5Tdg3omZfwK9BYlx4p0JMkzxapMYZiTOcqLkNdTW3LkSbfQEbgd7QDh9DmFBWceA40XwZgJuIIs1ZvD9DyYurHUVzfrgtP45dFkZ0W4vuWqeDgV30C6kvacoE4SQOYpvITE7UUdgTWRXW6xcZDJRB50QicehcAfYACRDJt32arqSGSiNoNT3MU7il3B%2B%2BbZUNMHe6WQfGDVJvJn1x2JIGVVdabCM1DCpK8nJuwqu6N7ycMN2%2B7QuJ%2FGrU5kze6DmQMid%2FH0JudcYhel3AgNAte81amrO559TvaK%2B5xaxns7XqHcAL4e3cLLX2lbh7uqwZoyNUgCXs2bX9BgPoOnNHJmDrxf4pbw57c6kKmhgEcKu4fYWldh9flAvJB3zztfcQUA%3D%3D&pkid=tv.omofun.app&token=&csrf=o13Tgl%2B3XOGfJjcTsCYGUhvnobNCR0v7njbsw2IooR%2FoArjKrCyogNFpYO9wNtn%2FNgFXBQL2DGFd3zDR7ekTMY%2B0QHU7QR%2Fyl6c%2Boa7A6l7op%2Fn6gtg0jzO7%2FSDDSAvuv56Sg8Y2wo%2FPxDf012ABHeVt8V1%2F3sRtzPvVTUg5t2M%3D`+ header);
	const $ = JSON.parse(response)
	
	return JSON.stringify({
		//标题
		title : $.data.vod_info.vod_name,
		
		//作者
		//author: $.data.author,
		
		//日期
		date : $.data.vod_info.vod_time_add,
		
		//概览
		summary: $.data.vod_info.vod_content,

		//封面网址
		cover : $.data.vod_info.vod_pic,
		
		//目录是否倒序
		isReverseOrder: false,
		
		//目录网址/非外链无需使用
		catalogs: catalogs($.data.vod_info.vod_url_with_player)
	})
}

/**
 * 目录
 * @returns {[{name, chapters:{[{name, url}]}}]}
 */
function catalogs(catalogs) {
	//创建目录数组
	var newCatalogs= [];
	
	catalogs.forEach(catalog => {
		//创建章节数组
		var newChapters= [];
		
		//章节代码
		var chapters = catalog.url.split('#');
		for(var i = 0;i < chapters.length;i++){
			var chapter = chapters[i].split('$');
			newChapters.push({
				//章节名称
				name: chapter[0],
				//章节网址
				url: 'http://103.91.210.141:6100/jx.php?url=' + chapter[1]
			})
		}
		
		//添加目录
		newCatalogs.push({
			//目录名称
			name: catalog.name,
			//章节
			chapters : newChapters
		});
    })
	return newCatalogs;
}

/**
 * 内容(InterceptRequest)
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	const $ = JSON.parse(response)
	//浏览器请求结果处理
	return $.url;
}