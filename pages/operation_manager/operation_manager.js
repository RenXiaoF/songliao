// pages/operation_manager/operation_manager.js
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require("../../utils/util.js");
var dateTimePicker = require("../../utils/dateTimePicker.js");
var common = require("../../utils/common.js");
var base64 = require("../../utils/base64");
import LoadMore from "../../utils/LoadMore.js";
var load = new LoadMore();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    key: "",

    statacg: 0,

    filterback: {
      status: -1,
      item: null,
    },

    user_list: null,
    user_list_new: null,

    count: 0,
    page_num: 1,

    // 1. 搜索
    addflag: true, //判断是否显示搜索框右侧部分
    addimg: "../../images/search.png",
    searchstr: "",
    user_list_data: null,
    inputValue: "", //搜索的内容
    inputShowed: false, //初始文本框不显示内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.get_all_store();
  },
  //搜索框文本内容显示
  inputBind: function (event) {
    // console.log("bindInput", event.detail.value);
    this.setData({
      inputValue: event.detail.value,
    });
    this.get_all_store();
  },
  // 使文本框进入可编辑状态
  showInput: function () {
    this.setData({
      inputShowed: true, //设置文本框可以输入内容
    });
  },
  // 取消搜索
  hideInput: function () {
    this.setData({
      inputShowed: false,
    });
  },

  /** 获取所有的 商店列表 */
  get_all_store: function () {
    var that = this;
    app.request.post("User/getUserListNew", {
      data: {
        content: that.data.inputValue,
        page_num: that.data.page_num,
      },
      success: function (res) {
        if (res.data.status > 0) {
          that.setData({ statacg: 1, count: res.data.count });
          if (res.data.count > 0) {
            that.data.user_list = [];
          }

          let user_list_arr = that.data.user_list_data;

          if (res.data.status == 1 && that.data.page_num == 1) {
            user_list_arr = res.data.result;
          } else {
            let new_data = Array.from(res.data.result);

            for (let item of new_data) {
              user_list_arr.push(item);
            }
          }
          that.setData({
            user_list_data: user_list_arr,
          });
          let userList = [];
          for (let key in that.data.user_list_data) {
            let obj = { type: key, list: that.data.user_list_data[key] };
            userList.push(obj);
            that.setData({ user_list: userList });
          }
        }
      },
    });
  },

  /** 弹框 */
  go_info: function (e) {
    var that = this;
    // console.log(e.currentTarget.dataset.param);
    let item = e.currentTarget.dataset.param;
    wx.showModal({
      title: "提示",
      content: "确认绑定这个业务经理(" + item.nickname + ")吗？",
      success(res) {
        if (res.confirm) {
          // console.log("用户点击确定", res.confirm);
          that.setData({
            "filterback.status": 1,
            "filterback.item": item,
          });
          //确认后调用方法绑定
          that.updateStoreFirstHeader(item.user_id);
        } else if (res.cancel) {
          // console.log("用户点击取消", res.cancel);
        }
      },
    });
  },
  updateStoreFirstHeader(user_id) {
    var that = this;
    let data = {
      first_header_id: user_id,
    };
    request.post("User/updateStoreFirstHeader", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 2000,
          });
          wx.navigateTo({ url: "/pages/push-msg/push-msg?hidden_msg=1" });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },



  /**
   * =======================================================================
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
  onReachBottom: function () {
    var that = this;
    var num1 = Number(that.data.page_num);
    num1 += num1;
    that.setData({
      page_num: num1.toString(),
    });
    that.get_all_store();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
