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
        depart:'1',
        act:"add",
        group_name:"",
        store_id:'',
        store_name:'',
        group_id:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options) {
            this.setData({
                store_id:options.store_id,
                store_name:options.store_name,
                group_id:options.group_id,
                group_name:options.group_name,
                act:options.act
            })
        }
    },
    /** 获取所有的 商店列表 */
    alterdepart: function (e) {
        let data = e.detail.value;
        var that = this;
        app.request.post("User/groupHandle", {
            data: {
                act: that.data.act,
                store_id: that.data.store_id,
                group_id: that.data.group_id,
                group_name: data.group_name,
            },
            success: function (res) {
                if (res.data.status == 1) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: "success",
                        duration: 2000,
                    });
                    wx.navigateTo({ url: "/pages/gongsi-organization/gongsi-organization?store_id="+that.data.store_id+"&store_name="+that.data.store_name});
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
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
});
