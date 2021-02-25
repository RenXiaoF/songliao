//logs.js
const util = require("../../utils/util.js");
Page({
  data: {},
    /**
     * 获取参数
     * @param e
     */
    onload:function(options){
        var that = this;
    },

  /** 账号密码 登陆 */
  gotoLogins: function() {
    wx.navigateTo({ url: "/pages/logins/login/login" });
  },
  /** 短信验证码 登陆  注册 */
  gotoCodeLogins: function() {
    wx.navigateTo({ url: "/pages/telcode_register/telcode_register" });
  },
  /** 微信 登陆 */
  gotoLoginWithWX: function() {
    wx.navigateTo({ url: "/pages/userAuth/index" });
  },
  /** 手机号快捷 注册 */
  gotoMPNQR: function() {
    wx.switchTab({ url: "/pages/index/index" });
  }
});