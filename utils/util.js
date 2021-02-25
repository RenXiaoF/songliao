/** 工具函数：这里放的是与系统配置和变量无关的函数 */
module.exports = {
    formatTime,
    format,
    json2Form,
    randomString,
    inArray,
    sortSize,
    convertRequestArray,
    remainTime,
    transTime,
    Obj2Str,
    JumpTo,
}

/** 格式化时间 */
function formatTime(timestamp, hasSecord) {
    var date = ((timestamp) ? new Date(timestamp * 1000) : new Date());  
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var formatNumber = function (n) {
        n = n.toString();
        return n[1] ? n : '0' + n;
    };
    if (typeof hasSecord != 'undefined' && hasSecord == false) {
        return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
    }
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

/** json对象转字符串参数连接 */
function json2Form(json) {
    var str = [];
    for (var p in json) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
    }
    return str.join("&");
}

/** 产生随机字符串，len字符串长度 */
function randomString(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
　　var maxPos = chars.length;
　　var pwd = '';
　　for (var i = 0; i < len; i++) {
　　　　pwd += chars.charAt(Math.floor(Math.random() * (maxPos + 1)));
　　}
　　return pwd;
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// format(1234567891, "yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// format(1234567891, "yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
function format(timestamp, fmt) {
    var date = new Date();
    date.setTime(timestamp * 1000);
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (typeof fmt == 'undefined') fmt = 'yyyy-MM-dd hh:mm:ss';
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/** 元素是否在数组中 */
function inArray(element, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (element == arr[i]) {
            return true;
        }
    }
    return false;
}

/** 
 * 大小排序 
 * by: 0: 升序，1降序，不填升序
 */
function sortSize(arr, by) {
    if (typeof by == 'undefined') {
        by = 0;
    }
    if (by) {
        arr.sort(function (a, b) { return b - a });
    } else {
        arr.sort(function (a, b) { return a - b });
    }
    return arr;
}

/** 
 * 转换为请求形式的数组
 * 返回转换后的对象
 */
function convertRequestArray(name, arr) {
    var params = {};
    for (var i = 0; i < arr.length; i++) {
        params[name + '[' + i + ']'] = arr[i];
    }
    return params;
}

/**
 * 时间戳差 转为 剩余时间
 */
function remainTime(diffms) {
    const daysms = 24 * 60 * 60 * 1000;
    const hoursms = 60 * 60 * 1000;
    const minutems = 60 * 1000;
    const secondms = 1000;
    var result = '';
    var hasfrontVal = false;

    var differDay = Math.floor(diffms / daysms);
    result = differDay ? differDay + '天' : '0天';
    hasfrontVal = differDay ? true : false;

    diffms -= differDay * daysms;
    var differHour = Math.floor(diffms / hoursms);
    result += differHour ? differHour + '时' : '0时';
    hasfrontVal = differHour ? true : false;

    diffms -= differHour * hoursms;
    var differMinute = Math.floor(diffms / minutems);
    result += differMinute ? differMinute + '分' : '0分';

    diffms -= differMinute * minutems;
    var differSecond = Math.floor(diffms / secondms);
    result += differSecond ? differSecond + '秒' : '0秒';

    return result;
}

/**
 * 时间戳差 转为 剩余时间(时间对象)
 */
function transTime(diffms) {
    const hoursms = 60 * 60 * 1000;
    const minutems = 60 * 1000;
    const secondms = 1000;
    var result = {
        hour: '00',
        minute: '00',
        second: '00',
    };
    var hasfrontVal = false;
    var differHour = Math.floor(diffms / hoursms);
    result.hour = differHour ? (differHour > 9 ? differHour : '0' + differHour) : '00';
    hasfrontVal = differHour ? true : false;

    diffms -= differHour * hoursms;
    var differMinute = Math.floor(diffms / minutems);
    result.minute = differMinute ? (differMinute > 9 ? differMinute : '0' + differMinute) : '00';

    diffms -= differMinute * minutems;
    var differSecond = Math.floor(diffms / secondms);
    result.second = differSecond ? (differSecond > 9 ? differSecond : '0' + differSecond) : '00';

    return result;
}

/** 对象转为用'&'连接的字符串 */
function Obj2Str(obj) {
    var str = '';
    for (var i in obj) {
        str += (str ? '&' : '') + i + '=' + obj[i]
    }
    return str;
}

function JumpTo(url, data, isRedirect) {
    var param = Obj2Str(data);
    if (isRedirect) {
        wx.redirectTo({ url: url + param });
    } else {
        wx.navigateTo({ url: url + param });
    }
}