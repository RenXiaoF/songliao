//app.js
var setting = require("setting.js");
var auth = require("./utils/auth.js");
var request = require("./utils/request.js");
var common = require("./utils/common.js");

App({
  globalData: {
    setting: setting, //用户可配置项
    wechatUser: null, //微信的用户信息
    userInfo: null, //商城的用户信息
    config: null, //app系统配置
    invite_str:'',//二维码推荐邀请人
      scene:0,
      websocketUrl: 'wss://cloudpf.weunit.cn:9504',
      websocketData:''//websoket返回的数据
  },

  /** 授权对象 */
  auth: auth,

  /** 全局请求对象，涉及业务的请求，请使用此接口 */
  request: request,

  /** 启动加载 */
  onLaunch: function(options) {
    var that = this;
    this.initExt();
    var setting = this.globalData.setting;
    setting.resourceUrl = setting.url + "/template/mobile/default";
      //this.globalData.scene=options.scene;
      wx.setStorage({
          key: "scene",
          data: options.scene
      });

  },
  onShow:function (options) {
      wx.setStorage({
          key: "scene",
          data: options.scene
      });
      // this.linkWebsocket();

  },
    onHide(){
        // 程序后台后的操作--关闭websocket连接
        // this.websocket.closeWebSocket();
    },
    linkWebsocket () {
        // 建立连接
        this.websocket.initWebSocket({
            url: this.globalData.websocketUrl,
            success(res) {
              //  console.log(res) 
              },
            fail(err) { 
              // console.log(err) 
            }
        })
    },
    getWebSocket(){
        // 向其他页面暴露当前websocket连接
        return this.websocket;
    },
  initExt: function() {
    var ext = wx.getExtConfigSync();
    var setting = this.globalData.setting;
    if (ext.store_name) {
      setting.appName = ext.store_name;
      setting.appLogo = ext.store_logo;
      setting.saas_app = ext.saas_app;
      if (ext.is_refactor) {
        setting.url = ext.request_url + "/saas/" + setting.saas_app;
      } else {
        setting.url = ext.request_url;
      }
      setting.ext_on = 1; //第三方配置开启
    } else {
      setting.saas_app = "";
      setting.ext_on = 0;
    }
  },

  /**
   * 获取用户信息（包括微信用户），有授权作用
   * cb：成功回调函数，入参:cb(userInfo,wechatUser)
   * force：是否强制更新数据（发出请求）
   */
  getUserInfo: function(cb, force, isShowLoading) {
    var that = this;
    if (auth.isAuth() && !force) {
      typeof cb == "function" &&
        cb(that.globalData.userInfo, that.globalData.wechatUser);
    } else {
      if (!auth.isAuth()) {

        // console.log("getUserInfo-如果没有授权11111-return auth.auth(cb); //授权操作");

        return auth.auth(cb); //授权操作
      } else {
        request.get("user/userInfo", {
          isShowLoading:
            typeof isShowLoading == "undefined" ? true : isShowLoading,
          success: function(res) {
            // console.log("微信授权登录", res);
            that.globalData.userInfo = res.data.result;
            that.globalData.userInfo.head_pic = common.getFullUrl(
              that.globalData.userInfo.head_pic
            );
            typeof cb == "function" &&
              cb(that.globalData.userInfo, that.globalData.wechatUser);
          }
        });
      }
    }
  },

  /** 获取app系统配置 */
  getConfig: function(cb, force) {
    var that = this;
    if (this.globalData.config && !force) {
      typeof cb == "function" && cb(this.globalData.config);
    } else {
      request.get("index/getConfig", {
        success: function(res) {
          that.globalData.config = res.data.result;
          typeof cb == "function" && cb(that.globalData.config);
        }
      });
    }
  },

  /** 获取前index页的数据，默认前一页 */
  getPrevPageData: function(index) {
    if (typeof index == "undefined") {
      index = 1;
    }
    var pages = getCurrentPages();
    return pages[pages.length - index - 1].data;
  },

  /** 加载提醒 */
  showLoading: function(func, time) {
    typeof time == "undefined" && (time = 1500);
    wx.showToast({
      title: "请稍候",
      icon: "loading",
      duration: time,
      mask: true,
      complete: function() {
        if (typeof func == "function") {
          setTimeout(func, time);
        }
      }
    });
  },

  showSuccess: function(msg, func, time) {
    typeof time == "undefined" && (time = 1000);
    wx.showToast({
      title: msg,
      icon: "none",
      duration: time,
      mask: true,
      complete: function() {
        if (typeof func == "function") {
          setTimeout(func, time);
        }
      }
    });
  },

  showWarning: function(msg, func, time, mask) {
    !time && (time = 1500);
    typeof mask == "undefined" && (mask = true);
    wx.showToast({
      title: msg,
      mask: mask,
      duration: time,
      image: "/images/gt.png",
      complete: function() {
        if (typeof func == "function") {
          setTimeout(func, time);
        }
      }
    });
  },

  confirmBox: function(msg, func) {
    wx.showModal({
      title: msg,
      showCancel: false,
      complete: function() {
        typeof func == "function" && func();
      }
    });
  },

  onShareAppMessage: function(res) {
    if (res.from === "button") {
      // console.log(res.target);
    }
    return {
      title: "送料通",
      path: "pages/index/index"
    };
  }
});
