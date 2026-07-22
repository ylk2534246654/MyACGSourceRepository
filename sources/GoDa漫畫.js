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
		version: 2,

		//自述文件网址
		readmeUrlList: [
			"https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/README.md",
			"https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/README.md?ref=master",
			"https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/README.md",
		],
		
		//搜索源自动同步更新网址
		syncList: {
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/GoDa漫畫.js",
			"GitLink": "https://www.gitlink.org.cn/api/ylk2534246654/MyACGSourceRepository/raw/sources/GoDa漫畫.js?ref=master",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/GoDa漫畫.js",
		},
		
		//最近更新时间
		lastUpdateTime: 1784711649,
		
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
				summary: "不能加载的时候可以尝试切换",
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
				summary: "图片不能加载的时候可以尝试切换",
				itemList: {
					"线路1": imgBaseUrl1,
					"线路2": "https://t40-1-4.g-mh.online",
					"线路3": "https://c-nd3-1.6wm.top",
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
 * 不一样格式的英文漫画网站：
 * https://manhuascans.org
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
			var coverUrl = element.selectFirst('img').absUrl('src');
			if(coverUrl.contains("url=")){
				coverUrl = JavaUtils.decodeURI(coverUrl.match(/url=([^&]+)/)[1]);
			}
			result.push({
				//名称
				name: element.selectFirst('.cardtitle').text(),

				//封面网址
				coverUrl: coverUrl,
				
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
			var coverUrl = element.selectFirst('img').absUrl('src');
			if(coverUrl.contains("url=")){
				coverUrl = JavaUtils.decodeURI(coverUrl.match(/url=([^&]+)/)[1]);
			}
			result.push({
				//名称
				name: element.selectFirst('.cardtitle').text(),

				//封面网址
				coverUrl: coverUrl,
				
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
		var apiHost = document.selectFirst('#chapterDrawerConfig').attr("data-api-host");
		if(apiHost == null || apiHost == ""){
			apiHost = "https://api-get-v2.mgsearcher.com";
		}
		
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
			tocs: tocs(apiHost, JavaUtils.urlJoin(apiHost, `/api/manga/get?mid=${document.selectFirst('#firstchap').attr("data-mid")}&mode=all@header->referer:https://m.g-mh.org/`))
			//tocs: tocs(JavaUtils.urlJoin(baseUrl, `/manga/get?mid=${document.selectFirst('#firstchap').attr("data-mid")}&mode=all`))
		});
	}
	return null;
}

/**
 * 目录V1
 * @return {[{name, chapters:{[{name, url}]}}]}
function tocsV1(apiHost, url) {
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
				url: JavaUtils.urlJoin(apiHost,`/api/chapter/getinfo?m=${data.id}&c=${chapter.id}@header->referer:https://m.g-mh.org/`)
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
 * 目录v2
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(apiHost, url) {
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
				url: JavaUtils.urlJoin(apiHost,`/api/v2/chapter/getinfo?m=${data.id}&c=${chapter.id}@header->referer:https://m.g-mh.org/`)
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


// https://godamh.com/assets/runtime/chapter-decoder.js
const _0x5d1904 = {
        'UQINq': function(_0x4c4521, _0x21902f) {
            return _0x4c4521 < _0x21902f;
        },
        'luVKn': function(_0x57732c, _0x4e9fb7) {
            return _0x57732c < _0x4e9fb7;
        },
        'gsEHF': function(_0x2dc5a8, _0x33ead3) {
            return _0x2dc5a8 + _0x33ead3;
        },
        'IWXNJ': function(_0xe76570, _0x2769ed) {
            return _0xe76570 % _0x2769ed;
        },
        'yLCLC': function(_0x5b85bd, _0x59df68) {
            return _0x5b85bd - _0x59df68;
        },
        'oNDXx': function(_0x1fec0a, _0x5df924) {
            return _0x1fec0a % _0x5df924;
        },
        'khuiw': function(_0x18c756, _0x3ff301) {
            return _0x18c756(_0x3ff301);
        },
        'QdwQA': 'HGVSl',
        'etLbf': function(_0x3430e6, _0x569a2d) {
            return _0x3430e6 !== _0x569a2d;
        },
        'OJzpZ': 'string',
        'ISSKy': function(_0x219870, _0x2790b6) {
            return _0x219870 <= _0x2790b6;
        },
        'PbACA': function(_0x536c41, _0x2dc5b6) {
            return _0x536c41 - _0x2dc5b6;
        },
        'RMkUZ': function(_0x3ba606, _0x142c0a) {
            return _0x3ba606 + _0x142c0a;
        },
        'ZtoXb': function(_0x27bdaf, _0x265d86) {
            return _0x27bdaf + _0x265d86;
        },
        'rGoGM': function(_0x20f348, _0x5bdeef) {
            return _0x20f348 + _0x5bdeef;
        },
        'UdwUk': function(_0x31efb8, _0x3ff72b) {
            return _0x31efb8 !== _0x3ff72b;
        },
        'CAOrn': function(_0x4614d9, _0x5d8e49) {
            return _0x4614d9 !== _0x5d8e49;
        },
        'eybnv': function(_0x4b3f20, _0x4e746f) {
            return _0x4b3f20(_0x4e746f);
        },
        'Ubrst': function(_0x3caaf3, _0x2a70fb) {
            return _0x3caaf3(_0x2a70fb);
        },
        'vTChn': 'manhuafree.com,godamh.com,g-mh.org,m.g-mh.org,m.baozimh.org,m.bzmh.org,bzmh.org,baozimh.org,m.baozimh.one',
        'ixzdz': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
        'Ryqja': '_-9876543210abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'FtrwO': 'J7r',
        'urhos': 'W4s'
    }
      , _0x2c5364 = 'manhuafree.com,godamh.com,g-mh.org,m.g-mh.org,m.baozimh.org,m.bzmh.org,bzmh.org,baozimh.org,m.baozimh.one'
      , _0x2dcf88 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
      , _0x3b2e67 = '_-9876543210abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      , _0x501991 = 'J7r'
      , _0x6d4740 = 'kD'
      , _0x440d8f = 'W4s'
      , _0x2d6642 = 'nQ'
      , _0xef06b0 = 7
      , _0x4e5b35 = () => {
        if (!_0x2c5364)
            return;
        const _0x31e144 = 'godamh.com'
          , _0x3125b6 = _0x2c5364['split'](',')['map'](_0x3e4db4 => _0x3e4db4['trim']())['filter'](Boolean);
        if (!_0x3125b6['length'] || _0x3125b6['includes'](_0x31e144))
            return;
        throw new Error('x0');
    }
      , _0x2c510b = _0x547865 => {
        let _0x17f0f7 = '';
        for (let _0x22b752 = 0; _0x5d1904['UQINq'](_0x22b752, _0x547865['length']); _0x22b752++) {
            var _0x49ebc1 = _0x3b2e67['indexOf'](_0x547865[_0x22b752]);
            if (_0x5d1904['luVKn'](_0x49ebc1, 0))
                throw new Error('x1');
            _0x17f0f7 += _0x2dcf88[_0x49ebc1];
        }
        return _0x17f0f7;
    }
      , _0x26e536 = _0x24111f => {
        let _0x13487a = '';
        for (let _0x57de11 = 0, _0x57709d = 0; _0x57de11 < _0x24111f['length']; _0x57de11 += _0xef06b0,
        _0x57709d++) {
            var _0x17fef7 = _0x24111f['slice'](_0x57de11, _0x5d1904['gsEHF'](_0x57de11, _0xef06b0));
            _0x13487a += _0x5d1904['IWXNJ'](_0x57709d, 2) ? _0x17fef7['split']('')['reverse']()['join']('') : _0x17fef7;
        }
        return _0x13487a;
    }
      , _0x545eec = _0x31dd62 => {
        const _0x399d1d = _0x5d1904['IWXNJ'](_0x31dd62['length'], 4) ? '='['repeat'](_0x5d1904['yLCLC'](4, _0x5d1904['oNDXx'](_0x31dd62['length'], 4))) : ''
        return JavaUtils.bytesToStr(JavaUtils.base64Decode(_0x5d1904['gsEHF'](_0x31dd62, _0x399d1d)['replace'](/-/g, '+')['replace'](/_/g, '/')));
    }
      , _0x4e735b = _0x5c6f50 => {
        if (_0x5d1904['QdwQA'] === _0x5d1904['QdwQA']) {
            if (_0x5d1904['etLbf'](typeof _0x5c6f50, _0x5d1904['OJzpZ']) || !_0x5c6f50['startsWith'](_0x501991) || !_0x5c6f50['endsWith'](_0x2d6642))
                throw new Error('x2');
            const _0x2ae002 = _0x5c6f50['slice'](_0x501991['length'], -_0x2d6642['length'])
              , _0x5d1024 = _0x5d1904['yLCLC'](_0x2ae002['length'] - _0x6d4740['length'], _0x440d8f['length']);
            if (_0x5d1904['ISSKy'](_0x5d1024, 0x137b + 0x1d * -0x33 + -0xdb4))
                throw new Error('x3');
            const _0x4b6c0b = Math['floor'](_0x5d1024 / (-0x1 * 0x1a05 + -0x262d * 0x1 + 0x4035))
              , _0x1fa997 = Math['floor'](_0x5d1904['yLCLC'](_0x5d1024, _0x4b6c0b) / (2))
              , _0x46eea8 = _0x5d1904['yLCLC'](_0x5d1904['PbACA'](_0x5d1024, _0x4b6c0b), _0x1fa997)
              , _0x3f01a8 = _0x2ae002['slice'](0, _0x1fa997)
              , _0x458e0e = _0x2ae002['slice'](_0x1fa997, _0x5d1904['gsEHF'](_0x1fa997, _0x6d4740['length']))
              , _0x4d0fc2 = _0x2ae002['slice'](_0x1fa997 + _0x6d4740['length'], _0x5d1904['gsEHF'](_0x5d1904['RMkUZ'](_0x1fa997, _0x6d4740['length']), _0x46eea8))
              , _0xbb78e4 = _0x2ae002['slice'](_0x5d1904['RMkUZ'](_0x5d1904['ZtoXb'](_0x1fa997, _0x6d4740['length']), _0x46eea8), _0x5d1904['gsEHF'](_0x5d1904['rGoGM'](_0x1fa997, _0x6d4740['length']) + _0x46eea8, _0x440d8f['length']))
              , _0x4b4a27 = _0x2ae002['slice'](_0x5d1904['rGoGM'](_0x5d1904['rGoGM'](_0x1fa997 + _0x6d4740['length'], _0x46eea8), _0x440d8f['length']));
            if (_0x5d1904['UdwUk'](_0x458e0e, _0x6d4740) || _0x5d1904['CAOrn'](_0xbb78e4, _0x440d8f) || _0x4b4a27['length'] !== _0x4b6c0b)
                throw new Error('x4');
            return JSON['parse'](_0x5d1904['khuiw'](_0x545eec, _0x2c510b(_0x5d1904['eybnv'](_0x26e536, _0x5d1904['ZtoXb'](_0x4b4a27, _0x3f01a8) + _0x4d0fc2))));
        } else {
            const _0x247e49 = _0x872c94['indexOf'](_0x21188b[_0x228f2c]);
            if (_0x247e49 < 0)
                throw new _0x283200('x1');
            _0x5ae10e += _0x19d691[_0x247e49];
        }
    }
/**
 * 内容V0
 * @params {string} url
 * @returns {string} content

function contentV0(url) {
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
/**
 * 内容V1
 * @params {string} url
 * @returns {string} content
function contentV1(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var images = [];
		JSON.parse(response.body().string()).data.info.images.images.forEach(element => {
			images.push(JavaUtils.urlJoin(JavaUtils.getPreference().getString("imgBaseUrl", imgBaseUrl1), element.url));
		});
		return JSON.stringify(images);
	}
}
*/
/**
 * 内容v2
 * @params {string} url
 * @returns {string} content
 */
function content(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var data = JSON.parse(response.body().string()).data.info.images.images
	
		var images = [];
		_0x5d1904['Ubrst'](_0x4e735b, data).forEach(element => {
			images.push(JavaUtils.urlJoin(JavaUtils.getPreference().getString("imgBaseUrl", imgBaseUrl1), element.url));
		})
		return JSON.stringify(images);
	}
}