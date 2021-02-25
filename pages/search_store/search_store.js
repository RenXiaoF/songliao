// pages/search_store/search_store.js
const app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../utils/common.js");
var base64 = require("../../utils/base64");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    store_list: null,
    goto1: "",
    store_id: "",
    items: [{ name: "null", value: "暂无授权公司", checked: "true" }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      goto1: options.goto1,
      store_id: options.store_id,
    });
    this.getClientInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},
  getClientInfo: function () {
    var that = this;
    if (app.globalData.userInfo) {
      request.post("User/getUserAuth", {
        success: function (res) {
          // console.log(res);
          if (res.data.status == 1) {
            if (res.data.result) {
              let store_arr = res.data.result;
              // console.log("数量统计");
              // console.log(store_arr);
              let list = [];
              let store_id = null;
              store_arr.forEach(function (item, index) {
                let obj = null;
                if (index == 0) {
                  obj = {
                    name: item.store_id,
                    value: item.store_name,
                    checked: "true",
                  };
                  store_id = item.store_id;
                } else if (
                  that.data.store_id &&
                  that.data.store_id == item.store_id
                ) {
                  obj = {
                    name: item.store_id,
                    value: item.store_name,
                    checked: "true",
                  };
                  store_id = item.store_id;
                } else {
                  obj = { name: item.store_id, value: item.store_name };
                }
                list.push(obj);
              });
              that.setData({
                items: list,
                store_list: store_arr,
                store_id: store_id,
              });
            }
          }
        },
      });
    } else {
      app.getUserInfo(function (userInfo) {
        app.globalData.userInfo = userInfo;
        app.globalData.userInfo.head_pic = common.getFullUrl(
          app.globalData.userInfo.head_pic
        );
        typeof cb == "function" &&
          cb(app.globalData.userInfo, app.globalData.wechatUser);
        request.post("User/getUserAuth", {
          success: function (res) {
            if (res.data.status == 1) {
              if (res.data.result) {
                let store_arr = res.data.result;
                let list = [];
                let store_id = "";
                store_arr.forEach(function (item, index) {
                  let obj = null;
                  if (index == 0) {
                    obj = {
                      name: item.store_id,
                      value: item.store_name,
                      checked: "true",
                    };
                    store_id = item.store_id;
                  } else if (
                    that.data.store_id &&
                    that.data.store_id == item.store_id
                  ) {
                    obj = {
                      name: item.store_id,
                      value: item.store_name,
                      checked: "true",
                    };
                    store_id = item.store_id;
                  } else {
                    obj = { name: item.store_id, value: item.store_name };
                  }
                  list.push(obj);
                });
                that.setData({
                  items: list,
                  store_list: store_arr,
                  store_id: store_id,
                });
              }
            }
          },
        });
      }, true);
    }
  },
  radioChange: function (e) {
    this.data.store_id = e.detail.value;
  },
  // 送料 ----> 送料管理  order_list
  bindViewTap: function () {
    var that = this;
    var store_info = null;
    if (that.data.store_list) {
      that.data.store_list.forEach(function (item, index) {
        if (that.data.store_id == item.store_id) {
          store_info = item;
        }
      });
    }
    if (store_info) {
      let store_id = store_info.store_id;
      let provider_id = store_info.providerid;
      let server_ip = store_info.server_ip;
      let store_name = store_info.store_name;
      // wx.navigateTo({
      wx.redirectTo({
        url:
          "/pages/order-list/order-list?store_id=" +
          store_id +
          "&providerid=" +
          provider_id +
          "&server_ip=" +
          server_ip +
          "&store_name=" +
          store_name,
      });
    } else {
    }
  },
  // 订单 ----> 订单管理  order_management
  bindViewTap1: function () {
    var that = this;
    var store_info = null;
    if (that.data.store_list) {
      that.data.store_list.forEach(function (item, index) {
        if (that.data.store_id == item.store_id) {
          store_info = item;
          // console.log("ecarch_store确定",store_info);
        }
      });
    }
    if (store_info) {
      let store_id = store_info.store_id;
      let provider_id = store_info.providerid;
      let server_ip = store_info.server_ip;
      let store_name = store_info.store_name;
      // console.log("ecarch_store确定",store_id);
      // console.log("ecarch_store确定",provider_id);
      // console.log("ecarch_store确定",server_ip);
      // console.log("ecarch_store确定",store_name);
      wx.redirectTo({
        url:
          "/pages/order_management/order_management?store_id=" +
          store_id +
          "&providerid=" +
          provider_id +
          "&server_ip=" +
          server_ip +
          "&store_name=" +
          store_name,
      });
    } else {
    }
  },
  // 我的送料 ----> 送料列表  my_slList
  bindViewTap2: function () {
    var that = this;
    var store_info = null;
    if (that.data.store_list) {
      that.data.store_list.forEach(function (item, index) {
        if (that.data.store_id == item.store_id) {
          store_info = item;
          // console.log("ecarch_store确定",store_info);
        }
      });
    }
    if (store_info) {
      let store_id = store_info.store_id;
      let provider_id = store_info.providerid;
      let server_ip = store_info.server_ip;
      let store_name = store_info.store_name;
      // console.log("ecarch_store确定",store_id);
      // console.log("ecarch_store确定",provider_id);
      // console.log("ecarch_store确定",server_ip);
      // console.log("ecarch_store确定",store_name);
      wx.redirectTo({
        url:
          "/pages/my_sllist/my_sllist?store_id=" +
          store_id +
          "&providerid=" +
          provider_id +
          "&server_ip=" +
          server_ip +
          "&store_name=" +
          store_name,
      });
    } else {
    }
  },
  /** 返回送俩管理 */
  bindGoBack: function () {
    wx.navigateTo({
      url: "/pages/order-list/order-list",
    });
  },
  /** 返回订单管理 */
  bindGoBack1: function () {
    wx.navigateTo({
      url: "/pages/order_management/order_management",
    });
  },
  /** 返回 我的送料 */
  bindGoBack2: function () {
    wx.navigateTo({
      url: "/pages/my_sllist/my_sllist",
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // wx.navigateBack({
    //   delta: 2, // 返回上一级页面。
    // });
  },

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
