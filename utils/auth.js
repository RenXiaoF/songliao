var common = require('./common.js');

/** 登录授权逻辑模块,不要在app.js使用 */
module.exports = {
    app: function () {
        return getApp();
    },

    /** 授权总入口，cb：成功回调函数 */
    auth: function (cb) {
        var app = this.app();
        var that = this;
        // 微信检查会议
        wx.checkSession({
            success: function () {
                // console.log("授权总入口，cb：成功回调函数-有授权作用22222");

                !app.globalData.wechatUser && that.wxLogin(cb);
            },
            fail: function () {
                // console.log("授权总入口，-授权失败-从新微信登陆444444");
                that.wxLogin(cb);
            }
        })
    },

    /** 是否已授权 */
    isAuth: function () {
        return (this.app().globalData.wechatUser) ? true : false;
    },

    /** 清除授权 */
    clearAuth: function () {
        this.app().globalData.wechatUser = null;
        wx.setStorageSync('isAuth', false);
    },

    /** 是否有登录过 */
    hadAuth: function () {
        try {
            return wx.getStorageSync('isAuth') ? true : false;
        } catch (e) {
            wx.setStorageSync('isAuth', false);
            return false;
        }
    },

    /**** 下面为内部函数，外部不要调用 ****/

    /** 登录商城,会更新用户信息,code五分钟过期 */
    login: function (code, wxUser, cb) {
        var app = this.app();
        var that = this;
        if (typeof code == 'undefined' || code == '') {
            app.globalData.wechatUser = null;
            that.alertLoginErrorAndGoHome('登录码为空，请重新尝试');
            return false;
        }
        // 第三方登录 微信登录
        app.request.post('user/wechat_thirdLogin', {
            data: {
                code: code,
                oauth: 'miniapp',
                nickname: wxUser.nickName,
                head_pic: wxUser.avatarUrl,
                sex: wxUser.gender,
                terminal: 'miniapp',
            },
            success: function (res) {
                // 保存 授权返回的 user_id 和  password  在本地
                if(res.data.result){
                    wx.setStorageSync('tempUserId', res.data.result.user_id);
                    wx.setStorageSync('tempPassword', res.data.result.password);
                }
                // console.log('第三方登录 微信登录1111111',res);
                wx.setStorageSync('isAuth', true);
                app.globalData.userInfo = res.data.result;
                app.globalData.userInfo.head_pic = common.getFullUrl(app.globalData.userInfo.head_pic);
                typeof cb == "function" && cb(app.globalData.userInfo, app.globalData.wechatUser);
                // 如果有手机号 ----> 首页
                wx.switchTab({ url: '/pages/index/index'});
               
            },
            failStatus: function (res) {
                //如果还没注册账户,关联账户
                if (res.data.result === '100') {
                    that.goHome();
                    wx.navigateTo({ url: '/pages/logins/relation_guide/relation_guide' });
                    return false;
                }
                //清除登录信息
                that.clearAuth();
                that.alertLoginErrorAndGoHome(res.data.msg);
                app.request.post('user/logout', {
                    isShowLoading: false,
                    data: { token: app.request.getToken() },
                    failStatus: function () {
                        return false;
                    }
                });
                return false;
            },
            fail: function (res) {
                that.clearAuth();
                that.alertLoginErrorAndGoHome();
                return false;
            }
        });
    },

    /** 微信登录,cb成功回调 */
    wxLogin: function (cb) {
        var that = this;
        wx.login({
            success: function (res) {
                if (!res.code) {
                    wx.showModal({
                        title: '获取用户登录态失败',
                        content: res.errMsg,
                        showCancel: false,
                        complete: function () {
                            that.goHome();
                        }
                    });
                    return;
                }
                that.doGetWxUser(res.code, cb);
            }
        });
    },
    /**获取微信用户 */
    doGetWxUser: function (code, cb) {
        var that = this;
        var app = that.app();
        wx.getUserInfo({
            success: function (user) {
                app.globalData.userInfo = user.userInfo;
                //app.globalData.wechatUser = user.userInfo;
                that.login(code, user.userInfo, cb);
            },
            fail: function () {
                that.failGetWxUser(code, cb);
            }
        });
    },
    /**获取微信用户失败 */
    failGetWxUser: function (code, cb) {
        var that = this;
        // console.log("index-onLoad:3333333333333333");
        wx.showModal({
            title: '请先授权登录哦',
            success: function (res) {
                // console.log(res);
                if (res.confirm) {
                  wx.getSetting({
                    success: function (ss) {
                      if (ss.authSetting['scope.userInfo']) {
                        wx.openSetting({
                          success: function (res) {
                            if (res.authSetting["scope.userInfo"]) {
                              that.doGetWxUser(code, cb);
                            } else {
                              that.alertNoAuthAndGoHome();
                            }
                          }
                        })
                      } else {
                        wx.navigateTo({
                        //   url: '/pages/userAuth/index',
                          url: '/pages/logs/logs', // 三种登陆方式
                        });
                      }
                    }
                  });

                } else if (res.cancel) {
                    that.alertNoAuthAndGoHome();
                }
            },
            fail: function (res) {
                that.goHome();
            }
        })
    },
    /**警告没有授权并返回首页 */
    alertNoAuthAndGoHome: function () {
        var that = this;
        this.app().showWarning('你尚未授权登录', function () {
            that.goHome();
        }, null, true);
    },
    /**警告登录错误并返回首页 */
    alertLoginErrorAndGoHome: function (msg) {
        if (!(typeof msg == 'string' && msg != '')) {
            msg = '登录时发生错误';
        }
        var that = this;
        this.app().showWarning(msg, function () {
            that.goHome();
        }, null, true);
    },
    /**返回首页 */
    goHome: function() {
        wx.switchTab({ url: '/pages/index/index' });
    }

}