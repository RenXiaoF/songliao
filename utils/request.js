var util = require('util.js');
var common = require("common.js");
module.exports = {
    uniqueId: '',

    /**
     * 全局请求函数
     * 1、加入错误提醒
     * 2、options加入 failStatus 回调函数，在successs函数中status不为0时回调，函数返回false不自动提醒错误
     * 3、options加入 successReload 布尔值，true则success完全掉原有success函数
     * 4、options加入 failRollback 布尔值，true则发生错误时回退到页面栈中的前一个页面
     * 5、options加入 notAuthParam 布尔值，true则url不加入身份验证参数
     * 6、options加入 baseUrl 字符串，false则完整路径，不写并且url不以http开头则默认使用setting.url
     * 7、options加入 isShowLoading 布尔值，是否显示加载提醒框,默认true
     */
    request: function (method, url, options) {
        var that = this;
        //设置默认头部
        var header = options.header ? options.header : { "content-type": "application/x-www-form-urlencoded" };
        //设置请求方式并做相应处理
        method = method.toUpperCase();
        var data = (method != 'GET' && options.data) ? util.json2Form(options.data) : options.data;
        var request_url = url;
        //处理请求url
        url = this.modifyUrl(url, options);
        //是否显示加载图标
        wx.request(Object.assign({}, options, {
            url: url,
            method: method,
            data: data,
            header: header,
            success: function (res) {
                that.doSuccess(options, res,method,request_url);
            },
            fail: function (res) {
                that.doFail(options, res);
            }
        }));
    },
    /**
     * 请求失败重新请求
     * @param method
     * @param url
     * @param options
     */
    reRequest(method, url, options) {
        var that = this;
        //设置默认头部
        var header = options.header ? options.header : { "content-type": "application/x-www-form-urlencoded" };
        //设置请求方式并做相应处理
        method = method.toUpperCase();
        var data = (method != 'GET' && options.data) ? util.json2Form(options.data) : options.data;
        //处理请求url
        url = this.modifyUrl(url, options);
        wx.request(Object.assign({}, options, {
            url: url,
            method: method,
            data: data,
            header: header,
            success: function (res) {
                that.doSuccess(options, res);
            },
            fail: function (res) {
                that.doFail(options, res);
            }
        }));
    },
    /**
     * 全局请求函数
     * 1、加入错误提醒
     * 2、options加入 failStatus 回调函数，在successs函数中status不为0时回调，函数返回false不自动提醒错误
     * 3、options加入 successReload 布尔值，true则success完全掉原有success函数
     * 4、options加入 failRollback 布尔值，true则发生错误时回退到页面栈中的前一个页面
     * 5、options加入 notAuthParam 布尔值，true则url不加入身份验证参数
     * 6、options加入 baseUrl 字符串，false则完整路径，不写并且url不以http开头则默认使用setting.url
     * 7、options加入 isShowLoading 布尔值，是否显示加载提醒框,默认true
     */
    request2: function (method, url, options) {
        var that = this;
        //设置默认头部
        var header = options.header ? options.header : "";
        //设置请求方式并做相应处理
        method = method.toUpperCase();
        var data = (method != 'GET' && options.data) ? util.json2Form(options.data) : options.data;
        //处理请求url
        url = this.modifyUrl(url, options);
        //是否显示加载图标
        // options.isShowLoading = typeof options.isShowLoading == 'undefined' ? true : options.isShowLoading;
        // options.isShowLoading && this.showLoading();
        // console.log('app.request', url, );
        // console.log('app.request', options);
        // console.log('app.request', url, options);
        wx.request(Object.assign({}, options, {
            url: url,
            method: method,
            data: data,
            header: header,
            success: function (res) {
                // options.isShowLoading && that.hideLoading();
                that.doSuccess(options, res);
                // console.log("封装01",res);
            },
            fail: function (res) {
                // options.isShowLoading && that.hideLoading();
                that.doFail(options, res);
                // console.log("fail");
            }
        }));
    },

    /** get请求,说明同request() */
    get: function (url, options) {
        // console.log("封装02",url);
        this.request('GET', url, options);
    },
    
    /** post请求,说明同request() */
    post: function (url, options) {
        this.request('POST', url, options);
    },

    /** post请求,说明同request() */
    post2: function (url, options) {
        this.request2('POST', url, options);
    },

    /** 上传文件,说明同request(),在formData中附加参数,详看wx.uploadFile文档 */
    uploadFile: function (url, options) {
        var that = this
        url = this.modifyUrl(url, options);
        // console.log('app.request', url, options);
        options.isShowLoading = typeof options.isShowLoading == 'undefined' ? true : options.isShowLoading;
        options.isShowLoading && this.showLoading();
        wx.uploadFile(Object.assign({}, options, {
            url: url,
            filePath: options.filePath,
            name: options.name,
            success: function (res) {
                that.hideLoading();
                // console.log('app.request', res);
                res.data = JSON.parse(that.filterJsonData(res.data)); 
                that.doSuccess(options, res);
            },
            fail: function (res) {
                that.hideLoading();
                that.doFail(options, res);
            }
        }));
    },

    /******* 以下是内部函数 *******/

    /** 请求成功的处理函数 */
    doSuccess: function (options, res,method='',request_url='') {
        if (options.successReload == true) {
            typeof options.success == 'function' && options.success(res);
            return;
        }
        if (res.statusCode != 200) {

            this.showError('请求出错[' + res.statusCode + ']', options);
            return false;
        }
        if (res.data.status != 1) {
            if (typeof options.failStatus == 'function') {
                if (options.failStatus(res) == false) {
                    return false;
                }
            }
            /** token异常,重新用存储获取token */
            if (res.data.status == -1002 || res.data.status == -1005) {
                var app = getApp();
                app.globalData.wechatUser = null;
                this.getForeverLoginInfo();
                app.globalData.wechatUser = app.globalData.userInfo;
                if(!app.globalData.wechatUser){
                    wx.setStorageSync('isAuth', true);
                    app.auth.clearAuth();
                    app.showWarning('正在授权登录', function () {
                        var pages = getCurrentPages();
                        if (pages[pages.length - 1].route != 'pages/logins/userinfo/userinfo') {
                            wx.switchTab({ url: '/pages/logins/userinfo/userinfo' });
                        } else {
                            wx.switchTab({ url: '/pages/index/index' });
                        }
                    }, null, true);
                    return false;
                }
                return false;
            }
            if (res.data.status == -11){
                return false;
            }
            //小程序断线重连接口
            if (res.data.status == -10){
                if(request_url && method){
                    setTimeout(() => {
                        this.reRequest(method, request_url, options);
                    },500);
                    return false;
                }
            }
            //小程序短线重连
            var showMsg = (typeof res.data.msg == 'string') ? res.data.msg : '网络异常,请稍后再试!';
            this.showError(showMsg, options);
            return false;
        }
        // 请求返回的数据处理
        typeof options.success == 'function' && options.success(res);
    },
    getForeverLoginInfo(){
        // console.log('进来了55');
        var that = this;
        var tempUserId = wx.getStorageSync("tempUserId");
        var tempPassword = wx.getStorageSync("tempPassword");
        that.post("user/getForeverLoginInfo", {
                data: {
                    user_id: tempUserId,
                    password: tempPassword,
                },
                success:(res)=>{
                if(res.data.status == 1){
            // console.log('成功了55');
            var app = getApp();
            wx.setStorageSync("isAuth", true);
            app.globalData.userInfo = res.data.result;
            app.globalData.userInfo.head_pic = common.getFullUrl(
                app.globalData.userInfo.head_pic
            );
            typeof cb == "function" && cb(app.globalData.userInfo, app.globalData.wechatUser);
        }
    }
    });
    },

    /** 请求失败的处理函数 */
    doFail: function (options, res) {
        // console.log('app.request', res);
        if (typeof options.fail == 'function') {
            if (options.fail(res) == false) {
                return false;
            }
        }

        this.showError('请求失败', options);
    },

    /** 过滤一些莫名其妙产生的奇葩字符 */
    filterJsonData: function (data) {
        var tmp = data; 
        for (var i = 0; i < data.length; i++) {
            tmp = data.substr(i);
            if (data.charAt(i) == '{') {
                break;
            }
        }
        return tmp;
    },

    /** 加基地址,附加鉴权参数 */
    modifyUrl: function (url, options) {
        typeof options == 'undefined' && (options = {});
        if (url.indexOf('http') != 0) {
            if (typeof options.baseUrl == 'string') {
                url = options.baseUrl + url;
            } else if (typeof options.baseUrl == 'undefined') {
                var app = getApp();
                url = app.globalData.setting.url + url;
            }
        }
        if (typeof options.notAuthParam == 'boolean' && options.notAuthParam == true) {
            return url;
        }
        // 请求参数  拼接：uniqueid，作用相当于sessionid        token
        var params = 'is_json=1'+ '&unique_id=' + this.getUniqueId() + '&token=' + this.getToken();
        url += ((url.indexOf('?') > 0) ? '&' : '?') + params;
        return url;
    },

    /** 获取token */
    getToken: function () {
        var app = getApp();
        if (app.globalData.userInfo == null) {
            return '';
        }
        // console.log('获取token',app.globalData.userInfo.token)
        return app.globalData.userInfo.token;
    },

    /** 获取uniqueid，作用相当于sessionid */
    getUniqueId: function () {
        if (this.uniqueId) {
            return this.uniqueId;
        }
        this.uniqueId = 'miniapp' + util.randomString(17);
        return this.uniqueId;
    },
    /** 加载的loading */
    showLoading: function () {
        wx.showLoading({
            title: '请稍候',
        });
    },
    /** 隐藏loading */
    hideLoading: function () {
        wx.hideLoading();
    },
    /** 显示错误 */
    showError: function (msg, options) {
        wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000,
            success:function(){
                setTimeout(function () {
                    options.failRollback == true && wx.navigateBack();
                }, 500) //延迟时间
                }
        });
        // wx.showModal({
        //     title: msg,
        //     showCancel: false,
        //     complete: function () {
        //         options.failRollback == true && wx.navigateBack();
        //     }
        // });
    }

};