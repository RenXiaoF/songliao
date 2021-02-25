// pages/push-msg/push-msg.js
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
  /**  页面的初始数据 */
  data: {
    checkbox: [], // 选中的角色

    temp_taxpayerid: "", // 临时的税务识别码id
    taxpayerid_hiddenmodalput: true, // 弹框输入的税务识别码id
    isfous: false, // 是否有焦点
    taxpayerid: null, // 税务识别码id

    // 修改  角色
    group_hiddenmodalput: true,
    temp_userrole_id: "", //临时数据
      empty_group_hiddenmodalput:true,

    account: {
      store_name: " ",
      store_phone: " ",
      sc_id: " ",
      sc_name: " ",
      brand_list: [],
      user_role: [],
      role_list: [],
      taxpayerid: " ", //纳税人识别码
      product_num: "", //产能
      first_header: "",
        leader_store_name:""
    },
    exist_account: {
      user_role: [],
      store_name: "",
      sc_name: "",
      store_phone: "",
      taxpayerid: "",
      first_header: "",
        leader_store_name:""
    },
    rolelist: [],

    regname: "",
    regaddress: "",

    //入驻状态 0未入驻1已入驻2审核中
    supplierstatus: 0,
    //入驻信息
    entryinfo: {
      store_id: "",
      taxpayerid: "",
      store_name: "",
      sc_name: "",
      store_phone: "",
      user_role: [],
      first_header: "",
        leader_store_name:""
    },
    hidden_msg: 0,
    role_ids: "",
    role_ids_arr: null,

    // 1. 重新审核 时 的 输入
    inputComponyName:'', // 输入的公司名
    inputBrandName:'', // 输入的品牌名
    inputTaxpayerIDCode:'', // 输入的纳税人识别码
  },
  /**
   *第一次默认加载的方法
   * @param options
   */
  onLoad: function (options) {
    var that = this;
    if (options.hidden_msg == 1) {
      that.setData({
        hidden_msg: 1,
      });
    }
  },
  /**  生命周期函数--监听页面加载 */
  onShow: function (options) {
    var that = this;

    var tempUserRole = wx.getStorageSync('key');
    if(tempUserRole){
      that.setData({ "account.user_role": tempUserRole})
    }
      

    this.alertmsg(); // 温馨提示
    this.getSupplierstatus_old(); // 获取入驻状态或入驻信息(旧)
    this.getRoleList(); // 获取角色列表

    /** 3. 重新审核 时 的 输入 */ 
    // 3.1 本地取出临时缓存 输入的公司名
    var componyName = wx.getStorageSync('ComponyName');
    if(componyName){
      that.setData({inputComponyName:componyName});
    }
    // 3.2 本地取出临时缓存 输入的品牌名
    var brandName = wx.getStorageSync('BrandName');
    if(brandName){
      that.setData({inputBrandName:brandName});
    }
    // 3.3 本地取出临时缓存 输入的纳税人识别码
    var taxpayerIDCode = wx.getStorageSync('TaxpayerIDCode');
    if(taxpayerIDCode){
      that.setData({inputTaxpayerIDCode:taxpayerIDCode});
    }
  },
  /** 2. 重新审核 时 的 输入 开始*/
  // 2.1 本地临时缓存 输入的公司名
  onInputComponyName:function(e){
    var value = e.detail.value;
    if(value){
      wx.setStorageSync('ComponyName', value);
    }
  },
  // 2.2 本地临时缓存 输入的品牌名
  onInputBrandName:function(e){
    var value = e.detail.value;
    if(value){
      wx.setStorageSync('BrandName', value);
    }
  },
  // 2.3 本地临时缓存 输入的纳税人识别码
  onInputTaxpayerIDCode:function(e){
    var value = e.detail.value;
    if(value){
      wx.setStorageSync('TaxpayerIDCode', value);
    }
  },
  /** 重新审核 时 的 输入 结束*/

  /** 温馨提示 */
  alertmsg: function () {
    var that = this;
    if (that.data.hidden_msg == 0) {
      wx.showModal({
        title: "温馨提示",
        content: "如果你的企业已经入驻，请进入个人信息，绑定所属企业",
        success(res) {
            that.setData({
                hidden_msg:1
            });
        },
      });
    }
  },

  /** supplierstatus==1||supplierstatus==2 start*/
  /** 重新入驻 */
  again: function () {
    var that = this;
    // console.log('获取');
    // console.log(that.data.entryinfo);
    that.setData({
      supplierstatus: 0,
      "account.store_phone": that.data.entryinfo.store_phone,
        "account.first_header": that.data.entryinfo.first_header,
        "account.leader_store_name": that.data.entryinfo.leader_store_name,
    });

  },
  /** 绑定 反焦点 */
  bindFous() {
    this.setData({
      isfous: true,
    });
  },
  /** 修改 纳税人识别码id */
  setChangetaxpayerid: function (e) {
    let taxpayerid = e.detail.value;
    this.setData({
      temp_taxpayerid: taxpayerid,
    });
  },
  /** 打开 纳税人识别码id 弹窗 */
  taxpayerid_modalinput: function () {
    this.setData({
      taxpayerid_hiddenmodalput: !this.data.taxpayerid_hiddenmodalput,
        temp_taxpayerid:this.data.entryinfo.taxpayerid
    });
  },
  /** 纳税人识别码id 取消按钮 */
  taxpayerid_cancel: function () {
    this.setData({
      taxpayerid_hiddenmodalput: true,
    });
  },
  /**  纳税识别码id 确认按钮*/
  taxpayerid_confirm: function () {
    var that = this;
    this.setData({
      taxpayerid_hiddenmodalput: true,
      temp_taxpayerid: this.data.temp_taxpayerid
        ? this.data.temp_taxpayerid
        : entryinfo.taxpayerid
    });
    if (!that.data.temp_taxpayerid) {
      wx.showToast({
        title: "请填纳税识别码",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      taxpayerid: that.data.temp_taxpayerid,
      store_id: that.data.entryinfo.store_id,
    };
    request.post("User/altertaxpayerid", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          that.setData({
              "entryinfo.taxpayerid":that.data.temp_taxpayerid
          })
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
  /** supplierstatus==1||supplierstatus==2 end*/

  /** 获取 企业信息 */
  getSupplierstatus: function () {
    var that = this;
    app.request.post("User/getStoreInfo", {
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({ supplierstatus: res.data.result.store_state });
          if (res.data.result.store_state == 0) {
            that.setData({
              // account {}
              "account.user_role": res.data.result.user_role,
              "account.store_name": res.data.result.store_name,
              "account.sc_name": res.data.result.sc_name,
              "account.store_phone": res.data.result.store_phone,
              "account.taxpayerid": res.data.result.taxpayerid,
              "account.first_header": res.data.result.first_header,
                "account.leader_store_name":  res.data.result.leader_store_name,
              // exist_account
              "exist_account.user_role": res.data.result.user_role,
              "exist_account.store_name": res.data.result.store_name,
              "exist_account.sc_name": res.data.result.sc_name,
              "exist_account.store_phone": res.data.result.store_phone,
              "exist_account.taxpayerid": res.data.result.taxpayerid,
              "exist_account.first_header": res.data.result.first_header,
                "exist_account.leader_store_name":  res.data.result.leader_store_name,
            });
          } else {
            that.setData({ entryinfo: res.data.result });
          }
        }
      },
    });
  },
  /** 编辑 企业信息 */
  getExistStoreInfo: function () {
    var that = this;
    app.request.post("User/getExistStoreInfo", {
      success: function (res) {
        if (res.data.status == 1) {
          res.data.result.user_role.forEach((element) => {
            that.data.exist_account.user_role.push(element.id);
          });
          that.setData({
            "exist_account.store_name": res.data.result.store_name,
            "exist_account.sc_name": res.data.result.sc_name,
            "exist_account.store_phone": res.data.result.store_phone,
            "exist_account.taxpayerid": res.data.result.taxpayerid,
            "exist_account.first_header": res.data.result.first_header,
              "exist_account.leader_store_name":  res.data.result.leader_store_name,
          });
        }
      },
    });
  },
  /** 获取入驻状态或入驻信息(旧) */
  getSupplierstatus_old: function () {
    var that = this;
    app.request.post("User/getStoreInfo", {
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({ supplierstatus: res.data.result.store_state });
          if (res.data.result.store_state == 0) {
            app.request.post("User/getExistStoreInfo", {
              success: function (res) {
                if (res.data.status == 1) {
                  let userRole = [];
                  res.data.result.user_role.forEach((item, index) => {
                    userRole.push(item.id);
                    that.setData({ "account.user_role": userRole });
                  });

                  // console.log(
                  //   "获取入驻状态或入驻信息(旧)",
                  //   that.data.account.user_role
                  // );
                  // res.data.result.user_role.forEach((element) => {
                  //   that.data.exist_account.user_role.push(element.id);
                  // });
                  that.setData({
                    "account.store_name": res.data.result.store_name,
                    "account.sc_name": res.data.result.sc_name,
                    "account.store_phone": res.data.result.store_phone,
                    "account.taxpayerid": res.data.result.taxpayerid,
                    "account.first_header": res.data.result.first_header,
                      "account.leader_store_name":  res.data.result.leader_store_name,
                  });
                }
              },
            });
          } else {
            that.setData({ entryinfo: res.data.result });
          }
        }
      },
    });
  },

  /** 入驻 */
  submit: function (e) {
    var that = this;
    let data = e.detail.value;
    let params = {
      sc_name: data.sc_name,
      store_name: data.store_name,
      store_phone: data.store_phone,
      user_role: that.data.temp_userrole_id,
      taxpayerid: data.taxpayerid,
      product_num: '',
      oauth:'miniapp'
    };
    // console.log(params);
    if (
      !params.sc_name ||
      !params.store_name ||
      !params.store_phone ||
      !params.user_role
    ) {
      wx.showToast({
        title: "请填写完整",
        icon: "none",
        duration: 2000,
      });
    } else {
      request.showLoading();
      app.request.post("User/applyForCompanyAdd", {
        data: params,
        success: function (res) {
          request.hideLoading(); //关闭
          if (res.data.status == 1) {
              that.getSupplierstatus();
          }
        },
      });
    }
  },

  /** 获取角色类型 */
  getRoleList: function () {
    var that = this;
    app.request.post("User/getRoleList", {
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            "account.role_list": res.data.result,
          });
        }
      },
    });
  },

  /** 修改 角色 */
  addRoles: function (data) {
    var that = this;
    request.showLoading(); //关闭
    app.request.post("User/updateUserRole", {
      data: {
        id: data,
      },
      success: function (res) {
        request.hideLoading(); //关闭
        if (res.data.status == 1) {
          wx.showToast({
            title: "修改成功",
            icon: "success",
            duration: 2000,
          });
          this.getSupplierstatus();
        }else{
          wx.showToast({
            title: "请稍后再试",
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },

  /** checkbox 选中 */
  checkboxgroupBindchange: function (e) {
    var that = this;
    var rolelists = [];
    var hasrole = [];
    // console.log("checkbox发生change事件，携带value值为：", e.detail.value);
    let check_ids = e.detail.value;
    //获取选中的字符串
    // if(check_ids){
    //     hasrole = check_ids.split(',');
    // }else{
    //     hasrole = check_ids;
    // }

    // let role_ids_arr = [];
    // //遍历所有的选中
    // rolelists.forEach((val2) => {
    //     console.log(val2.id);
    //   let val_id =  val2.id;
    //   val_id = val_id.toString();//数字转换成字符串
    //   if(hasrole.lastIndexOf(val_id)>-1){
    //     val2.checked=true;
    //     role_ids_arr.push(val2.id);
    //   }
    // });
    // that.setData({role_ids_arr:role_ids_arr});
    // console.log('测试地址',that.data.role_ids_arr);
  },

  /** 修改  角色 */
  setGroup: function (e) {
    let check_ids = e.detail.value;
    check_ids = check_ids.map(Number);
    //字符串转换成数字
    this.setData({
      temp_userrole_id: check_ids,
    });
  },
  /** 打开弹窗  选择角色 */

  group_modalinput: function () {
      var that=this;
      var rolelists = [];
      var hasrole=[];
      that.data.account.role_list.forEach((val) => {
          let obj = {
              id: val.id,
              role: val.role,
              checked: false,
          };

          rolelists.push(obj);
      });
      that.data.entryinfo.user_role.forEach((val)=>{
              hasrole.push(val.id);
      });
      rolelists.forEach((a)=>{
          if( hasrole.indexOf(a.id) > -1 ){
              a.checked=true;
          }else if(a.id==2){//默认加上面料商
              a.checked=true;
          }
      });
      that.setData({
           group_hiddenmodalput: !this.data.group_hiddenmodalput,
          "account.role_list":rolelists,
          role_ids_arr:hasrole
      });
      return;
  },
  /** 取消按钮 选择角色 */

  group_cancel: function () {
    this.setData({
      group_hiddenmodalput: true,
    });
  },
  /** 确认  选择角色 */

  group_confirm: function () {
    var that = this;
    var rolelists = [];
    var hasrole = [];
    let temp_userrole_id = that.data.temp_userrole_id?that.data.temp_userrole_id:that.data.role_ids_arr;
    this.setData({
      group_hiddenmodalput: true,
      temp_userrole_id: temp_userrole_id
    });
    if (!that.data.temp_userrole_id) {
      wx.showToast({
        title: "角色类型不能为空",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    // 要传入 添加角色的  参数
    let data = {
      id:that.data.temp_userrole_id
    };
    // console.log(data);
    request.showLoading();
    request.post("User/updateUserRole", {
      data,
      success: (res) => {
        request.hideLoading(); //关闭
        if (res.data.status == 1) {
          this.getSupplierstatus();
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

    /** 打开弹窗  选择角色 */
    empty_group_modalinput: function () {
        var that=this;
        that.setData({
            empty_group_hiddenmodalput: !this.data.empty_group_hiddenmodalput
        });
        return;
    },
    /** 取消按钮 选择角色 */
    empty_group_cancel: function () {
        this.setData({
            empty_group_hiddenmodalput: true,
        });
    },
    /** 确认  选择角色 */
    empty_group_confirm: function () {
        var that = this;
        var rolelists = [];
        var hasrole = [];
        let temp_userrole_id =  hasrole = that.data.temp_userrole_id;
        this.setData({
            empty_group_hiddenmodalput: true,
            temp_userrole_id: temp_userrole_id
        });
        // console.log(temp_userrole_id);
        if (!that.data.temp_userrole_id) {
            wx.showToast({
                title: "角色类型不能为空",
                icon: "none",
                duration: 2000,
            });
            return;
        }
        that.data.account.role_list.forEach((val) => {
            let obj = {
                id: val.id,
                role: val.role,
                checked: false,
            };
            rolelists.push(obj);
        });
        let user_role = [];
        rolelists.forEach((a)=>{
            if( hasrole.indexOf(a.id) > -1 ){
                a.checked=true;
                user_role.push(a);
            }
        });
        that.setData({
            "account.role_list":rolelists,
            temp_userrole_id:temp_userrole_id,
            "account.user_role":user_role,
        });
        setTimeout(() => {
          wx.setStorageSync('key', that.data.account.user_role);
        }, 200);
          
        // console.log('当前的状态',user_role);
        // console.log('测试参数',that.data.temp_userrole_id);
        // console.log('测试参数2222',that.data.account.user_role);
    },
  /** 返回 */
  goBack: function () {
      wx.switchTab({ url: '/pages/logins/userinfo/userinfo' });
  },
  /** 去到  选择绑定的业务经理 */
  goOpManager: function () {
    wx.navigateTo({ url: "/pages/operation_manager/operation_manager" });
  },
    /** 去到  选择绑定的企业 */
    goLeaderStore: function () {
        wx.navigateTo({ url: "/pages/search_store_list/search_store_list?leader=1" });
    },
    onUnload: function (e) {
        wx.navigateBack({
            delta: 2  // 返回上一级页面。
        })
    }
});
