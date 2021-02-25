// pages/logins/register/register.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../../utils/common.js");
var base64 = require("../../../utils/base64");

Page({
  data: {
    typeAction: "mobile",
    capacheUrl: "",
    mobile: "",
    tu_id: 0,
    user: null,

    /** 验证码 */
    sendTime: "发送验证码",
    snsMsgWait: 60,
  },

  /**生命周期 */
  onLoad: function (options) {
    // console.log("生命周期", options);
    this.data.tu_id = options.tu_id;
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
    var that = this;
    that.setData({
      mobile: e.detail.value,
    });
  },
  /**提交表单 */
  submitForm: function (e) {
    var typeAction = this.data.typeAction;
    // console.log("数据是多少2020：", this.data);
    // console.log("提交的类型是", typeAction);
    if (!typeAction) {
      return;
    }
    var values = e.detail.value;
    if (typeAction == "mobile") {
      values.tu_id = this.data.tu_id;
      values.oauth = "miniapp";
      this.submitRelate(values);
    } else if (typeAction == "password") {
      this.submitRegister(values);
    } else {
      app.confirmBox("处理类型出错:" + typeAction);
    }
  },
  /**提交关联信息 */
  submitRelate: function (values) {
    var that = this;
    request.post("user/wechat_register", {
      data: values,
      success: function (res) {
        // 保存 授权返回的 user_id 和  password  在本地
        if (res.data.result) {
          wx.setStorageSync("tempUserId", res.data.result.user_id);
          wx.setStorageSync("tempPassword", res.data.result.password);
        }
        // console.log(res);
        if (res.data.status == 1) {
          app.showSuccess("注册成功", function () {
            app.globalData.userInfo = res.data.result;
            that.goHome();
          });
        } else if (res.data.status == 4) {
          wx.navigateTo({ url: "/pages/logins/login/login" });
        } else {
          app.showWarning(res.data.msg);
        }
      },
    });
  },
  /**提交注册 */
  submitRegister: function (values) {
    if (
      values.password == "" ||
      values.password_confirm == "" ||
      values.mobile == "" ||
      values.code == ""
    ) {
      return app.showWarning("请先填写完表单信息");
    }
    if (values.password != values.password_confirm) {
      return app.showWarning("新密码两次输入不一致");
    }
    var that = this;
    Object.assign(values, { is_bind: 1 });
    request.post("user/reg", {
      data: values,
      success: function (res) {
        app.showSuccess("注册成功", function () {
          that.goHome();
        });
      },
    });
  },

  goHome: function () {
    wx.switchTab({ url: "/pages/index/index" });
  },
});
