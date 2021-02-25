// pages/logins/relation_guide/relation_guide.js
var app = getApp();
var setting = app.globalData.setting;

Page({
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    wechatUser: null
  },

  onLoad: function() {
    this.setData({ wechatUser: app.globalData.wechatUser });
  },

  onUnload: function() {
    if (app.auth.isAuth()) {
      app.auth.clearAuth();
    }
  }
});
