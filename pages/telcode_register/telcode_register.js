// pages/telcode_register/telcode_register.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../utils/common.js");
var base64 = require("../../utils/base64");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    typeAction: "mobile",
    capacheUrl: "",
    mobile: "",

    user: null,

    /** 验证码 */
    sendTime: "发送验证码",
    snsMsgWait: 60,
    invite_str: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log("telcode-生命周期函数", that.data.user);
  },

  /**获得capache */
  getCapache: function () {
    this.setData({ capacheUrl: common.getCapache() });
  },

  /**获得验证码 */
  getCode: function (e) {
    var that = this;
    this.sendSmsCode(that.data.mobile, 1);
  },

  /** 发送短信验证码 */
  sendSmsCode: function (mobile, scene, cb) {
    var that = this;

    // 验证手机号码的正则表达式
    var telReg = /^1[3456789]\d{9}$/;
    if (mobile == "" || mobile.length != 11) {
      wx.showToast({
        title: "手机号长度错误!",
        icon: "none",
        duration: 2000,
      });
    }
    if (!telReg.test(mobile)) {
      wx.showToast({
        title: "手机号码格式错误!",
        icon: "none",
        duration: 2000,
      });
    }
    if (typeof scene == "undefined" || scene === null) {
      scene = 6; //身份验证
    }
    if (telReg.test(mobile)) {
      app.request.post("user/send_sms", {
        data: {
          mobile: mobile,
          scene: scene,
          type: "mobile",
        },
        success: function (res) {
          if (res.data.status == 1) {
            typeof cb == "function" && cb();
            // 60秒后重新获取验证码
            var inter = setInterval(
              function () {
                that.setData({
                  smsFlag: true,
                  sendTime: that.data.snsMsgWait + "s后重发",
                  snsMsgWait: that.data.snsMsgWait - 1,
                });
                if (that.data.snsMsgWait < 0) {
                  clearInterval(inter);
                  that.setData({
                    sendTime: "获取验证码",
                    snsMsgWait: 60,
                    smsFlag: false,
                  });
                }
              }.bind(this),
              1000
            );
          }
          if (res.data.status != 1) {
            wx.showModal({
              title: "提示",
              content: "此号码当天接收验证码次数过多,请换一个号码重试!",
              success(res) {
                if (res.confirm) {
                } else if (res.cancel) {
                }
              },
            });
          }
        },
      });
    }
  },

  /**设置电话号码 */
  setMobile: function (e) {
    this.setData({ mobile: e.detail.value });
  },
  /**提交表单 */
  submitForm: function (e) {
    var typeAction = this.data.typeAction;

    if (!typeAction) {
      return;
    }
    var values = e.detail.value;
    if (typeAction == "mobile") {
      this.submitRegister(values);
    }
  },

  /**手机 验证码 登录 */
  submitRegister: function (values) {
    var that = this;
    Object.assign(values, { is_bind: 1 });
    let invite_str;
    wx.getStorage({
      key: "scene",
      success(res) {
        that.setData({
          invite_str: res.data,
        });
      },
    });
    request.post("User/smsLogin", {
      data: {
        username: values.username,
        code: values.code,
        invite_str: that.data.invite_str,
        oauth: "miniapp",
      },
      success: function (res) {
        // 保存 授权返回的 user_id 和  password  在本地
        if (res.data.result) {
          wx.setStorageSync("tempUserId", res.data.result.user_id);
          wx.setStorageSync("tempPassword", res.data.result.password);
        }
        // console.log("手机登陆", res);
        wx.setStorageSync("isAuth", true);
        app.globalData.userInfo = res.data.result;
        app.globalData.userInfo.head_pic = common.getFullUrl(
          app.globalData.userInfo.head_pic
        );
        typeof cb == "function" &&
          cb(app.globalData.userInfo, app.globalData.wechatUser);
        if (res.data.status == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 2000,
          });
          wx.setStorage({
            key: "scene",
            data: null,
          });
          wx.switchTab({ url: "/pages/index/index" });
          that.setData({ isRegister: true });
        } else if (res.data.status == -1) {
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },

  /** 回到 首页 */
  goHome: function () {
    wx.switchTab({ url: "/pages/index/index" });
  },

  /** 账号密码  登陆 */
  goTelPassword: function () {
    wx.navigateTo({
      url: "/pages/logins/login/login",
    });
  },

  /** 重新注册 */
  redoSignup: function () {
    var that = this;
    that.setData({ isRegister: false });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
