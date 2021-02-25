// pages/logins/login/login.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../../utils/common.js");
var base64 = require("../../../utils/base64");

Page({
  /* 页面的初始数据 */
  data: {
    realname: "",
    password: "",
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {},

  /**设置电话号码 */
  setMobile: function (e) {
    var that = this;
    that.setData({
      mobile: e.detail.value,
    });
    // this.data.realname = e.detail.value;
  },

  /**提交表单 */
  submitForm: function (e) {
    var values = e.detail.value;
    // console.log("提交表单", values);
    this.submitRegister(values);
  },

  /**手机登录 */
  submitRegister: function (values) {
    var that = this;
    Object.assign(values, { is_bind: 1 });
    request.post("user/login", {
      data: {
        username: values.realname,
        password: values.password,
        unique_id: "",
        push_id: "",
        capache: false,
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
        typeof cb == "function" && cb(app.globalData.userInfo, app.globalData.wechatUser);
        if (res.data.result && res.data.result.mobile) {
          wx.switchTab({ url: "/pages/index/index" });
        }
      },
    });
  },
  /** 回到首页 */
  goHome: function () {
    wx.switchTab({ url: "/pages/index/index" });
  },
  /** 忘记密码 跳转到 注册 */
  goRegister: function () {
    wx.navigateTo({
      url: "/pages/logins/register/register",
    });
  },
  /** 验证码 注册 */
  goTelCodeRegister: function () {
    wx.navigateTo({
      url: "/pages/telcode_register/telcode_register",
    });
  },
});
