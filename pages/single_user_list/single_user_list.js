// pages/single_user_list/single_user_list.js
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
    storeinfo: {
      store_id: "",
      store_name: "",
      taxpayerid: "",
    },
    userself: {
      job_num: "",
    },
    user: {
      factory_sec_id: "", //所属工段
    },

    storelist: [],
    storeradio: [],

    // you_group = '未选择部门';
    grouplist: null,
    groupradio: [],
    hasgrouplist: true,
    group: {
      group_id: "",
      name: "未选择部门",
    },

    // you_locate = '未选择门店';
    locatelist: null,
    locateradio: [],
    haslocatelist: true,
    locate: {
      locateid: "",
      name: "未选择门店",
    },

    factorylist: null,
    factoryradio: [],
    hasfactorylist: true,
    factory: {
      factoryid: "",
      name: "未选择工厂",
    },
    factorysectionlist: null,
    factorysectionradio: [],
    hasfactorysectionlist: true,
    factorysection: {
      factorysectionid: "",
      name: "未选择工段",
    },
    realname: null,
    mobile: "",
    job_num: "",
    erp_user_name: "",
    printer_user: "",
    printer_ukey: "",
    printer_sn: "",
    user_role_name: "无",
    //修改手机号
    smsFlag: false,
    sendTime: "获取验证码",
    snsMsgWait: 60,
    mobile_hiddenmodalput: true,
    temp_mobile: "", //临时数据
    temp_code: "",
    //修改部门
    group_hiddenmodalput: true,
    temp_group_id: "", //临时数据
    //修改用户名称
    realname_hiddenmodalput: true,
    temp_realname: "", //临时数据
    //修改密码
    password_hiddenmodalput: true,
    temp_password: "", //临时数据
    temp_confirm_password: "",
    //修改打印机配置
    print_hiddenmodalput: true,
    temp_printer_user: "",
    temp_printer_ukey: "",
    temp_printer_sn: "",
    //修改打印机配置
    isfous: false,
      path:''
  },

  /** 生命周期函数--监听页面加载 */
  onShow: function (options) {
    this.get_user();
    this.getstore();
    this.getuserself();
  },
  /** 获取用户信息 */
  get_user() {
    var that = this;
    request.post("User/getmycontent", {
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
            realname: res.data.my.realname,
            mobile: res.data.my.mobile,
            user_role_name: res.data.my.user_role_name,
          });
        } else {
          that.setData({
            realname: app.globalData.userInfo.realname,
            mobile: app.globalData.userInfo.user.mobile,
          });
        }
      },
    });
  },
  /**获得验证码 */
  getCode: function (e) {
    var that = this;
    if (!that.data.temp_mobile) {
      wx.showToast({
        title: "请先填写手机号",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    // 60秒后重新获取验证码
    var inter = setInterval(
      function () {
        that.setData({
          smsFlag: true,
          sendTime: this.data.snsMsgWait + "s后重发",
          snsMsgWait: this.data.snsMsgWait - 1,
        });
        if (this.data.snsMsgWait < 0) {
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
    common.sendSmsCode(that.data.temp_mobile, 1);
  },
  // //获取所属企业
  getstore() {
    var that = this;
    request.post("User/getStore", {
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
            storeinfo: res.data.result,
          });
          if (res.data.group) {
            that.setData({
              group: res.data.group,
            });
          }
          that.getgrouplist(res.data.result.store_id);
        }
      },
    });
  },
  //获取部门列表
  getgrouplist(id) {
    var that = this;
    that.grouplist = [];
    that.groupradio = [];
    let data = {
      id: id,
    };
    request.post("User/getgroupList", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
            grouplist: res.data.group_list,
          });
          if (that.data.grouplist) {
            that.data.hasgrouplist = true;
            let groupradio = [];
            let grouplist = res.data.group_list;
            grouplist.forEach(function (item, index) {
              item["checked"] =
                item.group_id == that.data.group.id ? true : false;
              groupradio.push(item);
            });
            that.setData({
              groupradio: groupradio,
            });
          } else {
            that.data.hasgrouplist = false;
          }
        }
      },
    });
  },
  //获取用户信息
  getuserself() {
    var that = this;
    request.post("User/getUserself", {
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
            userself: res.data.result,
            user: res.data.result,
            job_num: res.data.result.job_num,
            erp_user_name: res.data.result.user.erp_user_name,
            printer_user: res.data.result.printer_user,
            printer_ukey: res.data.result.printer_ukey,
            printer_sn: res.data.result.printer_sn,
          });
          if (res.data.result.locate) {
            that.setData({
              locate: res.data.result.locate,
            });
          }
          if (res.data.result.factory) {
            that.setData({
              factory: res.data.result.factory,
            });
          }
          if (res.data.result.factory_section) {
            that.setData({
              factorysection: res.data.result.factory_section,
            });
          }
        }
      },
    });
  },
  bindFous() {
    this.setData({
      isfous: true,
    });
  },
  //手机号修改
  setMobile: function (e) {
    let mobile = this.validateNumber(e.detail.value);
    this.setData({
      temp_mobile: mobile,
    });
  },
  validateNumber(val) {
    return val.replace(/\D/g, "");
  },
  setCode: function (e) {
    let code = this.validateNumber(e.detail.value);
    this.setData({
      temp_code: code,
    });
  },
  //打开弹窗
  mobile_modalinput: function () {
    this.setData({
      mobile_hiddenmodalput: !this.data.mobile_hiddenmodalput,
    });
  },
  //取消按钮
  mobile_cancel: function () {
    this.setData({
      mobile_hiddenmodalput: true,
      temp_mobile: "",
      temp_code: "",
      smsFlag: false,
      sendTime: "获取验证码",
      snsMsgWait: -1,
    });
  },
  //确认
  mobile_confirm: function () {
    var that = this;
    this.setData({
      mobile_hiddenmodalput: true,
      temp_mobile: that.data.temp_mobile,
      temp_code: that.data.temp_code,
    });
    if (!that.data.temp_mobile) {
      wx.showToast({
        title: "请填写手机号",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    if (!that.data.temp_code) {
      wx.showToast({
        title: "请填写验证码",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      phone: that.data.temp_mobile,
      code: that.data.temp_code,
    };
    // console.log(data);
    request.post("User/updateUserMobile", {
      data,
      success: (res) => {
        // console.log(res.data);
        if (res.data.status == 1) {
          that.setData({
            mobile: that.data.temp_mobile,
            temp_mobile: "",
            temp_code: "",
            smsFlag: false,
            sendTime: "获取验证码",
            snsMsgWait: -1,
          });
          // console.log(that.data.sendTime);
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 2000,
          });
        } else {
          that.setData({
            temp_mobile: "",
            temp_code: "",
            smsFlag: false,
            sendTime: "获取验证码",
            snsMsgWait: -1,
          });
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },
  //手机号修改完成
  //部门修改
  setGroup: function (e) {
    // console.log(e);
    let group_id = e.detail.value;
    this.setData({
      temp_group_id: group_id,
    });
  },
  //打开弹窗
  group_modalinput: function () {
    var that = this;
    if (!that.data.grouplist) {
      wx.showModal({
        title: "提示",
        content: "未建立部门，请到衣链云通讯录完善部门",
        success(res) {
          if (res.confirm) {
              wx.navigateTo({ url: "/pages/gongsi-organization/gongsi-organization?store_id="+that.data.storeinfo.store_id+"&store_name="+that.data.storeinfo.store_name});
          } else if (res.cancel) {
            // console.log("用户点击取消");
          }
        },
      });
      return;
    }
    this.setData({
      group_hiddenmodalput: !that.data.group_hiddenmodalput,
    });
  },
  //取消按钮
  group_cancel: function () {
    this.setData({
      group_hiddenmodalput: true,
    });
  },
  //确认
  group_confirm: function () {
    var that = this;
    this.setData({
      group_hiddenmodalput: true,
      temp_group_id: this.data.temp_group_id
        ? this.data.temp_group_id
        : this.data.group.id,
    });
    if (!that.data.temp_group_id) {
      wx.showToast({
        title: "请选择部门",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      group_id: this.data.temp_group_id,
      store_id: this.data.storeinfo.store_id,
    };
    // console.log(data);
    request.post("User/changegroup", {
      data,
      success: (res) => {
        // console.log(res.data);
        if (res.data.status == 1) {
          that.setData({
            group: { id: this.data.temp_group_id, name: res.data.group_name },
          });
          wx.showToast({
            title: "修改成功",
            icon: "success",
            duration: 2000,
          });
        } else {
          wx.showToast({
            title: "请稍后再试",
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },
  //部门修改完成
  //用户名修改
  setRealname: function (e) {
    let realname = e.detail.value;
    this.setData({
      temp_realname: realname,
    });
  },
  //打开弹窗
  realname_modalinput: function () {
    this.setData({
      realname_hiddenmodalput: !this.data.realname_hiddenmodalput,
    });
  },
  //取消按钮
  realname_cancel: function () {
    this.setData({
      realname_hiddenmodalput: true,
    });
  },
  //确认
  realname_confirm: function () {
    var that = this;
    this.setData({
      realname_hiddenmodalput: true,
      temp_realname: this.data.temp_realname
        ? this.data.temp_realname
        : this.data.realname,
    });
    if (!that.data.temp_realname) {
      wx.showToast({
        title: "请填写用户名",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      realname: this.data.temp_realname,
    };
    request.post("User/updateUserRealname", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
            realname: this.data.temp_realname,
          });
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 2000,
          });
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
  //用户名修改完成
  //密码修改
  setPassword: function (e) {
    let password = e.detail.value;
    this.setData({
      temp_password: password,
    });
  },
  setConfirm_password: function (e) {
    let confirm_password = e.detail.value;
    this.setData({
      temp_confirm_password: confirm_password,
    });
  },
  //打开弹窗
  password_modalinput: function () {
    this.setData({
      password_hiddenmodalput: !this.data.password_hiddenmodalput,
    });
  },
  //取消按钮
  password_cancel: function () {
    this.setData({
      password_hiddenmodalput: true,
    });
  },
  //确认
  password_confirm: function () {
    var that = this;
    this.setData({
      password_hiddenmodalput: true,
    });
    if (!that.data.temp_password || !that.data.temp_confirm_password) {
      wx.showToast({
        title: "请填写密码",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    if (that.data.temp_password != that.data.temp_confirm_password) {
      wx.showToast({
        title: "两次密码不一致",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      password: that.data.temp_password,
      confirm_password: that.data.temp_confirm_password,
    };
    request.post("User/updateUserPassword", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
            temp_password: "",
            temp_confirm_password: "",
          });
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 2000,
          });
        } else {
          that.setData({
            temp_password: "",
            temp_confirm_password: "",
          });
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },
  //密码修改完成
  //修改打印机配置
  // print_hiddenmodalput:true,
  // temp_printer_user: '',
  // temp_printer_ukey: '',
  // temp_printer_sn: '',
  //: function(e)
  setPrinteruser: function (e) {
    let temp_printer_user = e.detail.value;
    // console.log(e);
    this.setData({
      temp_printer_user: temp_printer_user,
    });
  },
  setPrinterukey: function (e) {
    let temp_printer_ukey = e.detail.value;
    // console.log(e);
    this.setData({
      temp_printer_ukey: temp_printer_ukey,
    });
  },
  setPrintersn: function (e) {
    let temp_printer_sn = e.detail.value;
    // console.log(e);
    this.setData({
      temp_printer_sn: temp_printer_sn,
    });
  },
  //打开弹窗
  print_modalinput: function () {
    this.setData({
      print_hiddenmodalput: !this.data.print_hiddenmodalput,
    });
  },
  //取消按钮
  print_cancel: function () {
    this.setData({
      print_hiddenmodalput: true,
    });
  },
  //确认
  print_confirm: function () {
    var that = this;
    this.setData({
      print_hiddenmodalput: true,
      temp_printer_user: that.data.temp_printer_user
        ? that.data.temp_printer_user
        : that.data.printer_user,
      temp_printer_ukey: that.data.temp_printer_ukey
        ? that.data.temp_printer_ukey
        : that.data.printer_ukey,
      temp_printer_sn: that.data.temp_printer_sn
        ? that.data.temp_printer_sn
        : that.data.printer_sn,
    });
    if (
      !that.data.temp_printer_user ||
      !that.data.temp_printer_ukey ||
      !that.data.temp_printer_sn
    ) {
      wx.showToast({
        title: "请填写完整打印机信息",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      printer_user: that.data.temp_printer_user,
      printer_ukey: that.data.temp_printer_ukey,
      printer_sn: that.data.temp_printer_sn,
    };
    request.post("User/updatePrintingSet", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
            printer_user: that.data.temp_printer_user,
            printer_ukey: that.data.temp_printer_ukey,
            printer_sn: that.data.temp_printer_sn,
          });
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 2000,
          });
        } else {
          that.setData({
            temp_printer_user: "",
            temp_printer_ukey: "",
            temp_printer_sn: "",
          });
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },
  //修改打印机配置
  /** 去到  选择绑定企业 */
  gotosearh_store: function () {
    wx.navigateTo({ url: "/pages/search_store_list/search_store_list" });
  },

  /** 返回 */
  goBack: function () {
      wx.switchTab({ url: '/pages/logins/userinfo/userinfo' });
  },

  /** 清除授权 */
  clearAuth: function () {
    app.request.post("user/logout", {
      isShowLoading: false,
      data: {
        token: app.request.getToken(),
        oauth: "miniapp",
      },
      success: function (res) {
        // console.log('测试进入2222');
        // 保存 授权返回的 user_id 和  password  在本地
        if (res.data.result) {
          wx.setStorageSync("tempUserId", '');
          wx.setStorageSync("tempPassword", '');
        }
        if (res.data.status == 1) {
          wx.navigateTo({
            url: "/pages/logs/logs",
          });
        }
      },
      failStatus: function () {
        return false;
      },
    });
  },
    onUnload: function (e) {
        wx.navigateBack({
            delta: 2  // 返回上一级页面。
        })
    }
});
