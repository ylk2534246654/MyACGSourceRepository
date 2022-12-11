function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1656743080,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220701,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 80,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "笔趣阁",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新网址
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/笔趣阁.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/笔趣阁.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/笔趣阁.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/笔趣阁.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/笔趣阁.js",
		},
		
		//更新时间
		updateTime: "2022年12月11日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 4,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截的请求处理，3：对内部浏览器拦截的框架处理
		contentType: 1,
		
		//自定义标签
		tag: ["小说"],
		
		//@NonNull 详情页的基本网址
		baseUrl: "https://infosxs.pigqq.com",//备用：apptuxing.com ，pysmei.com ，pigqq.com
	});
}

const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';
/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	//https://souxs.pigqq.com/search.aspx?key=
	//https://souxs.leeyegy.com/search.aspx?key=
	var url = `https://souxs.pigqq.com/search.aspx?key=${encodeURI(key)}&page=1&siteid=app2` + header;
	const response = httpRequest(url);
	var array= [];
	const $ = JSON.parse(response)
	$.data.forEach((child) => {
		array.push({
		//标题
		title: child.Name,
		
		//概览
		summary: child.Author,
		
		//封面
		cover: child.Img,
		
		//网址
		url: `https://infosxs.pigqq.com/BookFiles/Html/${parseInt(child.Id/1000) + 1}/${child.Id}/info.html`
		})
	  })
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{title, author, date, summary, cover, reverseOrder, catalog:{[{tag, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
	var $ = JSON.parse(response).data;
	return JSON.stringify({
		//标题
		title: $.Name,
		
		//作者
		author: $.Author,
		
		//日期
		date : $.LastTime,
		
		//概览
		summary: $.Desc,
		
		//封面
		cover : $.Img,
		
		//目录是否倒序
		reverseOrder: false,
		
		//目录网址/非外链无需使用
		catalog: catalog(`${parseInt($.Id/1000) + 1}/${$.Id}`)
	});
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {[{tag, chapter:{[{name, url}]}}]}
 */
function catalog(id) {
	const response = httpRequest(`https://infosxs.pigqq.com/BookFiles/Html/${id}/index.html`+ header).replace(new RegExp('},]','g'),'}]');
	const $ = JSON.parse(response)
	//创建目录数组
	var new_catalogs= [];
	//创建章节数组
	var newchapters= [];
	$.data.list.forEach((booklet) => {
		booklet.list.forEach((chapter) => {
		  newchapters.push({
			name: chapter.name,
			url: `https://contentxs.pigqq.com/BookFiles/Html/${id}/${chapter.id}.html`
		  })
		})
	})
	//添加目录
	new_catalogs.push({
		//目录名称
		tag: '目录',
		//章节
		chapter : newchapters
	});
	return new_catalogs;
}

/**
 * 内容
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = httpRequest(url + header);
	const $ = JSON.parse(response);
	return $.data.content.replace(new RegExp('@@﻿@@','g'),'').replace(new RegExp('正在更新中，请稍等片刻，内容更新后，重新进来即可获取最新章节！亲，如果觉得APP不错，别忘了点右上角的分享给您好友哦！','g'),'')
}

