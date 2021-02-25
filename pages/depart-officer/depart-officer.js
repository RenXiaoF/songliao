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
        group_id: '',
        store_id: '',
        store_name: '',
        group_name: '',
        searchname: '',
        group_user_count:0,
        user_list:null,
        indexs:['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options) {
            this.setData({
                group_id:options.group_id,
                store_id:options.store_id,
                searchname:searchname
            })
        }
        this.getusergongsi();
    },
    //搜索框文本内容显示
    inputBind: function (event) {
        this.setData({
            searchname: event.detail.value,
        });
        this.getphonebook();
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
    getphonebook: function () {
        var that = this;
        app.request.post("User/get_phonebook", {
            data: {
                name: that.data.searchname,
                store_id: that.data.store_id,
                group_id: that.data.group_id
            },
            success: function (res) {

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
