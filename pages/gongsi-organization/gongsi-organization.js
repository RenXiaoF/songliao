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
        store_id:'',
        store_name:'',
        departlist:[],
        gongsi_name:'加载ing~~',
        all_count_user:0,
        organizations:[],
        have_org:0,
        all_count:0,
        searchname:'',
        inputShowed: false //初始文本框不显示内容
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options) {
            this.setData({
                store_id:options.store_id,
                store_name:options.store_name
            })
        }
        this.getusergongsi();
    },
    //搜索框文本内容显示
    inputBind: function (event) {
        this.setData({
            searchname: event.detail.value,
        });
        this.getusergongsi();
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
    getusergongsi: function () {
        var that = this;
        app.request.post("User/get_this_organization", {
            data: {
                name: that.data.searchname,
                store_id: that.data.store_id
            },
            success: function (res) {
                if (res.data.status == 1) {
                    if (res.data.have_org) {
                        //有部门
                        that.setData({
                            have_org:1,
                            departlist:res.data.res,
                            all_count_user:res.data.all_count
                        })
                    } else {
                        //显示全部联系人

                        that.setData({
                            have_org:0,
                            departlist:res.data.res,
                            all_count:res.data.all_count
                        })
                    }
                } else {

                }
            },
        });
    },
    //新增部门
    gotoalterdepart:function () {
        var that = this;
        wx.navigateTo({ url: "/pages/alter-depart/alter-depart?act=add&store_id="+that.data.store_id+"&store_name="+that.data.store_name});
    },
    //修改部门
    gotodepartofficer:function (e) {
        var that = this;
        let data  = e.currentTarget.dataset.param;
        let group_id = data.group_id;
        let group_name = data.group_name;
        if(group_id>0){
            wx.navigateTo({ url: "/pages/alter-depart/alter-depart?act=edit&store_id="+that.data.store_id+"&store_name="+that.data.store_name+"&group_id="+group_id+"&group_name="+group_name});
        }else{
            wx.navigateTo({ url: "/pages/alter-depart/alter-depart?act=add&store_id="+that.data.store_id+"&store_name="+that.data.store_name});
        }

        // wx.navigateTo({ url: "/pages/depart-officer/depart-officer?store_id="+that.data.store_id+"&group_id="+group_id});
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
