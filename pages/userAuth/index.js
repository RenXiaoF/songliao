// pages/userAuth/index.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../utils/common.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse("button.open-type.getUserInfo")
  },
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
        // console.log('微信授权用户信息',e.detail.userInfo);
        app.getUserInfo(function(userInfo) {
            // console.log('获取2020的用户信息');
            // console.log(userInfo);
        }, true);
        // if(!app.globalData.userInfo){
        //     console.log('222');
        //
        // }else{
        //     wx.switchTab({ url: `/pages/index/index`, });
        // }
    }else{
        this.showError('微信授权失败,请重试!');
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log('组件版本',wx.canIUse("button.open-type.contact"));
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
