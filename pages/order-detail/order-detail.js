// pages/order-detail/order-detail.js

var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require("../../utils/util.js");
var common = require("../../utils/common.js");
import LoadMore from "../../utils/LoadMore.js";
var base64 = require("../../utils/base64");
var load = new LoadMore();

let animationShowHeight = 450; // 规格弹框的高度
let animationShowHeightB = 300; // 备注弹框的高度

Page({
  /** 页面的初始数据 */
  data: {
    defaultImage: "../../images/jietu.png",

    openSpecModal: false, //是否打开规格弹窗
    animationData: "",

    openBModal: false, //是否回货前需批色弹窗
    animationDataB: "",

    songliaoDetail: null, // 待送料详情
    title: "", // poid
    code: "", // code: "PIQ002"
    color: "", // color: "红色"
    listLength: 1, // 数组的长度

    batchno: 1, //批次号就是缸号

    // 从order-list 传过来的参数
    Matioid: "", // 物料编号
    ActType: "", // 页码
    server_ip: "", // 请求的链接
    deliverdate: "", // 要求货期

    // order-list 使用 setStorage 保存的 参数
    store_id: "", // 企业id
    providerid: "", // 供应商id
    title3: "", // 供应商名称

    inputValue: 1, // 卷数
    switchChecked: false, // 是否打开分卷
    modelIndex: 0, // 保存当前打开"去送料"窗口下标
    count: 0, // 保存加入物料列表数量
    poid: "",
    store_id: "14",
    push_data: {},
    desmodelIndex: 0, //修改備註 index
    des: "", //備註
    // 保存去送料规格框信息
    payOffInfo: {
      batchno: 1, //批次号
      list: [{ num: 1, count: 1 }], // 卷号列表
      count: 1, //卷数
      is_roll: 0, //是否分权,默认0为不分卷
    },
    // 0. 微信推送
    succRul: "", // 请求推送成功时 返回的url

    // 获取单个物料已送料的记录
    getOneSLInfo: null, // 获取单个物料已送料的记录
    multunit: '', // 单位
    lastNum: 0, // 最后的卷数
    TCount: 0, // 共多少米

  },

  /* 生命周期函数--监听页面加载 */
  onShow: function (options) {
    // 获取当前小程序的页面栈
    let pages = getCurrentPages();
    // 数组中索引最大的页面--当前页面
    let currentPage = pages[pages.length - 1];
    // 打印出当前页面中的 options
    options = currentPage.options;
    // console.log("order-detail-onshow:", options);
    var that = this;

    that.setData({
      Matioid: options.Matioid,
      ActType: options.ActType,
      server_ip: options.server_ip,
      deliverdate: options.deliverdate,
    });

    wx.setStorageSync('server_ip', that.data.server_ip);
      

    // store_id
    wx.getStorage({
      key: "store_id",
      success(res) {
        that.setData({
          store_id: res.data,
        });
      },
    });
    // title3
    wx.getStorage({
      key: "title3",
      success(res) {
        that.setData({
          title3: res.data,
        });
      },
    });

    //获取详情
    setTimeout(() => {
      that.getSLDetail();
    }, 200);
    //获取送料数量
    setTimeout(() => {
      that.QryAllSendCartCount();
    }, 200);
  },

  // 判断卷号是否重复
  checkVolumeUniq(array) {
    let flag = true;
    let temp = [];
    for (var i = 0; i < array.length; i++) {
      if (temp.indexOf(array[i].num) == -1) {
        temp.push(array[i].num);
      } else {
        break;
      }
    }
    if (temp.length !== array.length) {
      flag = false;
    }
    return flag;
  },
  generateMixed(num) {
    let chars = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];
    let res = "";
    for (let i = 0; i < num; i++) {
      let id = Math.ceil(Math.random() * 35);
      res += chars[id];
    }
    return res;
  },

  // 加入送料列表
  addSongliaoList() {
    var that = this;
    // 判断卷号列表是否重复
    let isUniq = this.checkVolumeUniq(this.data.payOffInfo.list);
    if (!isUniq) {
      wx.showToast({
        title: "卷号不能重复",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    let roll_list = [];
    let total_count = 0;
    let item = this.data.songliaoDetail[this.data.modelIndex];
    for (let volumeItem of this.data.payOffInfo.list) {
      if (!volumeItem.num) {
        wx.showToast({
          title: "卷号不能为空",
          icon: "none",
          duration: 2000,
        });
        return;
      }
      let tempItem = [];
      tempItem.push(volumeItem.num);
      tempItem.push(volumeItem.count);
      total_count += Number(volumeItem.count);
      roll_list.push(tempItem);
    }
    let data = {
      act_type: "AddSendCart",
      roll_list: JSON.stringify(roll_list),
      poid: item.poid != "undefined" ? item.poid : "",
      name: item.name != "undefined" ? item.name : "",
      colorid: item.colorid != "undefined" ? item.colorid : "",
      color: item.color != "undefined" ? item.color : "",
      provcolorid: item.ProvColorID != "undefined" ? item.ProvColorID : "",
      provcolor: item.ProvColor != "undefined" ? item.ProvColor : "",
      fgweight: item.FGWeight != "undefined" ? item.FGWeight : "",
      multqty: item.multqty != "undefined" ? item.multqty : "",
      multprice: item.multprice != "undefined" ? item.multprice : "",
      multtotal: item.multtotal!= "undefined" ? item.multtotal : "",
      batchno: this.data.batchno!= "undefined" ? this.data.batchno : "",
      model: item.model != "undefined" ? item.model : "",
      polistlsh: item.polistlsh != "undefined" ? item.polistlsh : "",
      MultUnit: item.multunit != "undefined" ? item.multunit : "", //
      store_id: this.data.store_id, //
      matid: item.matid != "undefined" ? item.matid : "", //
      matbarcodeid: this.generateMixed(16), //
      polistid: item.pinid != "undefined" ? item.pinid : "", //
      code: item.code != "undefined" ? item.code : "", //
      picture: item.picture != "undefined" ? item.picture : "",
      deliverDate: item.Deliverdate != "undefined" ? item.Deliverdate : "", //
      providerid: item.providerid != "undefined" ? item.providerid : "",
    };
    request.post("Songliao/CartOption", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          this.setData({
            count: res.data.result,
          });
          this.closeSpecModal();
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 1000,
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 1000,
          });
        }
      },
    });
  },
  //打印标签
  printaddCart() {
    // 判断卷号列表是否重复
    var that = this;
    let isUniq = this.checkVolumeUniq(this.data.payOffInfo.list);
    if (!isUniq) {
      wx.showToast({
        title: "卷号不能重复",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let roll_list = [];
    let total_count = 0;
    let item = this.data.songliaoDetail[this.data.modelIndex];
    for (let volumeItem of this.data.payOffInfo.list) {
      if (!volumeItem.num) {
        wx.showToast({
          title: "卷号不能为空",
          icon: "none",
          duration: 2000,
        });
        return;
      }
      let tempItem = [];
      tempItem.push(volumeItem.num);
      tempItem.push(volumeItem.count);
      total_count += Number(volumeItem.count);
      roll_list.push(tempItem);
    }
    let data = {
      act_type: "addcart",
      roll_list: JSON.stringify(roll_list),
      poid: item.poid != "undefined" ? item.poid : "",
      name: item.name != "undefined" ? item.name : "",
      colorid: item.colorid != "undefined" ? item.colorid : "",
      color: item.color != "undefined" ? item.color : "",
      provcolorid: item.ProvColorID != "undefined" ? item.ProvColorID : "",
      provcolor: item.ProvColor != "undefined" ? item.ProvColor : "",
      fgweight: item.FGWeight != "undefined" ? item.FGWeight : "",
      multqty: item.multqty != "undefined" ? item.multqty : "",
      multprice: item.multprice!= "undefined" ? item.multprice : "",
      multtotal: item.multtotal!= "undefined" ? item.multtotal : "",
      batchno: this.data.batchno != "undefined" ? this.data.batchno : "",
      model: item.ProvColorID != "undefined" ? item.ProvColorID : "",
      polistlsh: item.polistlsh!= "undefined" ? item.polistlsh : "",
      MultUnit: item.ProvColorID != "undefined" ? item.ProvColorID : "", //
      store_id: this.data.store_id,
      matid: item.matid != "undefined" ? item.matid : "",
      matbarcodeid: this.generateMixed(16), //
      polistid: item.pinid, //
      code: item.code, //
      providerid: that.data.providerid,
    };
    request.post("Songliao/printOrder", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 1000,
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 1000,
          });
        }
      },
    });
  },
  // 切换分卷状态
  switchChange(e) {
    this.setData({
      switchChecked: e.detail.value,
    });
  },
  // 实现卷号列表双向绑定
  inputNum(e) {
    if (!e.detail.value) {
      wx.showToast({
        title: "卷号不能为空",
        icon: "none",
        duration: 2000,
      });
    }
    let num = e.detail.value ? Number(e.detail.value) : "";
    let tempVolume =
      "payOffInfo.list[" + e.currentTarget.dataset.index + "].num";
    this.setData({
      [tempVolume]: num,
    });
  },
  // 实现卷数列表双向绑定
  inputCount(e) {
    let count = e.detail.value ? Number(e.detail.value) : 1;
    let tempVolume =
      "payOffInfo.list[" + e.currentTarget.dataset.index + "].count";
    this.setData({
      [tempVolume]: count,
    });
  },
  /** 修改备注的双向绑定 */
  bindTextAreaBlur(e) {
    let des = e.detail.value;
    this.setData({
      des: des,
    });
  },
  /** 点击+ */

  addCartNum(e) {
    // 1. 点击加，让 卷号 和  送料数 加一行
    var that = this;
    let tempVolume = [];
    let length = this.data.payOffInfo.list.length + 1;

    let tempNum = 0;
    let arr = this.data.payOffInfo.list;
    for (let i = 0; i < arr.length; i++) {
      tempNum = arr[i].num + 1;
    }

    let obj = { num: tempNum, count: 1 };
    
    tempVolume = this.data.payOffInfo.list.concat(obj);
    let tempSetData = "payOffInfo.list";
    this.setData({
      inputValue: length,
      [tempSetData]: tempVolume,
    });

  },
  // 点击-
  subCartNum(e) {
    // 1. 点击  - ，让 卷号 和  送料数 减一行。
    let index = e.currentTarget.dataset.index;
    let length = this.data.payOffInfo.list.length - 1;
    let list = this.data.payOffInfo.list;
    list.splice(index, 1);
    let tempSetData = "payOffInfo.list";
    this.setData({
      inputValue: length,
      [tempSetData]: list,
    });
  },
  // 实现卷数双向绑定
  bindKeyInput: function (e) {
    let tempVolume = [];
    for (let i = 0; i < e.detail.value; i++) {
      let obj = { num: i + 1, count: 1 };
      tempVolume.push(obj);
    }
    let tempSetData = "payOffInfo.list";
    this.setData({
      inputValue: e.detail.value,
      [tempSetData]: tempVolume,
    });
  },
  //获取送料数量
  QryAllSendCartCount: function () {
    var that = this;
    var requestUrl = "Songliao/CartOption";
    let data = {
      act_type: "QryAllSendCartCount",
      store_id: this.data.store_id,
      poid: this.data.Matioid,
    };
    request.post(requestUrl, {
      data,
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            count: res.data.result,
          });
        } else {
          that.setData({
            count: 0,
          });
        }
      },
    });
  },
  //删除所有订单
  DelAllSendCart: function () {
    var that = this;
    var requestUrl = "Songliao/CartOption";
    let data = {
      act_type: "DelAllSendCart",
      store_id: this.data.store_id,
      poid: this.data.Matioid,
    };
    request.post(requestUrl, {
      data,
      success: function (res) {
        let msgIcon = "success";
        if (res.data.status == 1) {
          that.setData({
            count: 0,
          });
        } else {
          msgIcon = "none";
          wx.showToast({
            title: res.data.msg,
            icon: msgIcon,
            duration: 2000,
          });
        }
      },
    });
  },

  /** 获取待送料详情 */
  getSLDetail: function () {
    var that = this;
    request.showLoading();
    var actType = that.data.ActType;
    var poid = that.data.Matioid;
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "POID" +
        '"' +
        ":" +
        '"' +
        poid +
        '"' +
        "," +
        '"' +
        "act_type" +
        '"' +
        ":" +
        '"' +
        actType +
        '"' +
        "," +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"Wp_ProShipmentsOrder"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ShipmentsOrderDetail:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        request.hideLoading(); //关闭
        if (res.data.status == 1) {
          res.data.result.ResultData.forEach(function (value, index, array) {
            var picture;
            array[index]["picture"] = picture = that.imageProcess(
              value.picture
            );
          });
          that.setData({
            songliaoDetail: res.data.result.ResultData,
              providerid: res.data.result.ResultData[0]['providerid']
          });
        }
        that.data.songliaoDetail.forEach((el) => {
          that.data.title = el.poid;
          that.data.code = el.code;
          that.data.color = el.color;
        });
        that.data.listLength = that.data.songliaoDetail.length;
      },
    });
  },
  /**
   * @name: 图片处理,转换成正常的base64图片
   * @msg:
   * @param {type}
   * @return:
   */
  imageProcess(picture) {
    if (!picture || picture == "" || picture == "?/w==") {
      picture = "../../images/jietu.png";
    } else {
      picture =
        "data:image/jpeg;base64," + picture.substring(1, picture.length);
    }
    //返回的数据
    return picture;
  },

  /** 去到送货列表 */
  onGotoPayoflist: function () {
    wx.navigateTo({
      url:
        "../payof-list/payof-list?poid=" +
        this.data.Matioid +
        "&store_id=" +
        this.data.store_id,
    });
  },

  /** 更新備註 */
  updateDes: function () {
    var that = this;
    var actType = that.data.ActType;
    var poid = that.data.Matioid;
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var item = this.data.songliaoDetail[this.data.desmodelIndex];
    var params = base64.encode(
      "{" +
        '"' +
        "POID" +
        '"' +
        ":" +
        '"' +
        poid +
        '"' +
        "," +
        '"' +
        "act_type" +
        '"' +
        ":" +
        '"' +
        actType +
        '"' +
        "," +
        '"' +
        "des" +
        '"' +
        ":" +
        '"' +
        this.data.des +
        '"' +
        "," +
        '"' +
        "matid" +
        '"' +
        ":" +
        '"' +
        item.matid +
        '"' +
        "," +
        '"' +
        "colorid" +
        '"' +
        ":" +
        '"' +
        item.colorid +
        '"' +
        "," +
        '"' +
        "color" +
        '"' +
        ":" +
        '"' +
        item.color +
        '"' +
        "," +
        '"' +
        "model" +
        '"' +
        ":" +
        '"' +
        item.model +
        '"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "intf_SendShipmentsOrderUpdate:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.result.eCode == "1") {
          that.closeBModal();
          let songliaoDetail =
            "songliaoDetail[" + that.data.desmodelIndex + "].des";
          that.setData({
            [songliaoDetail]: that.data.des,
            des: "",
          });

          wx.showToast({
            title: res.data.result.msg,
            icon: "success",
            duration: 2000,
          });
        } else {
          wx.showToast({
            title: res.data.result.msg,
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },

  /** 打开 规格 弹窗 */
  openSpecModel: function (e) {
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.sld;
    this.setData({
          getOneSLInfo:null
    })
    setTimeout(() => {
      this.getOneSLInfo(item);
    }, 200);
    let data = {
      act_type: "QryOneSendCart",
      polistid: this.data.songliaoDetail[index].pinid,
      poid: this.data.songliaoDetail[index].poid,
      store_id: this.data.store_id,
    };
    request.post("Songliao/CartOption", {
      data,
      success: (res) => {
        let payOffInfo = {
          batchno: 1,
          list: [{ num: 1, count: 1 }],
          count: 1,
          is_roll: 0,
        };
        if (res.data.status == 1 && res.data.result.list.length > 0) {
          payOffInfo = res.data.result;
        }
        this.setData({
          modelIndex: index,
          payOffInfo: payOffInfo,
          batchno: Number(payOffInfo.batchno),
          switchChecked: !!payOffInfo.is_roll,
          inputValue: Number(payOffInfo.count),
          openSpecModal: true,
        });
        this.closeBModal();
        var animation = wx.createAnimation({
          duration: 200,
          timingFunction: "linear",
          delay: 0,
        });
        this.animation = animation;
        animation.translateY(animationShowHeight).step();
        this.setData({
          animationData: animation.export(),
        });
        setTimeout(
          function () {
            animation.translateY(0).step();
            this.setData({
              animationData: animation.export(),
            });
          }.bind(this),
          0
        );
      },
    });
  },

  /** 关闭 规格 弹窗 */
  closeSpecModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0,
    });
    this.animation = animation;
    animation.translateY(animationShowHeight).step();
    this.setData({
      animationData: animation.export(),
    });
    setTimeout(
      function () {
        animation.translateY(0).step();
        this.setData({
          animationData: animation.export(),
          openSpecModal: false,
        });
      }.bind(this),
      200
    );
    //this.setData({ openSpecModal: false });
  },

  /** 打开回货前需批色 弹框 */
  openBModel: function (e) {
    this.closeSpecModal();
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0,
    });
    this.animation = animation;
    animation.translateY(animationShowHeightB).step();
    this.setData({
      animationDataB: animation.export(),
      openBModal: true,
      desmodelIndex: e.currentTarget.dataset.index,
    });
    setTimeout(
      function () {
        animation.translateY(0).step();
        let item = this.data.songliaoDetail[e.currentTarget.dataset.index];
        this.setData({
          animationDataB: animation.export(),
          des: item.des,
        });
      }.bind(this),
      0
    );
    //this.setData({ openSpecModal: true });
  },

  /** 关闭回货前需批色 弹窗 */
  closeBModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0,
    });
    this.animation = animation;
    animation.translateY(animationShowHeightB).step();
    this.setData({
      animationDataB: animation.export(),
    });
    setTimeout(
      function () {
        animation.translateY(0).step();
        this.setData({
          animationDataB: animation.export(),
          openBModal: false,
        });
      }.bind(this),
      200
    );
    //this.setData({ openSpecModal: false });
  },
  /** 1. 确认接单 */
  openConfirm: function () {
    var that = this;
    wx.showModal({
      title: "操作提示",
      content: "是否确认送料?",
      success(res) {
        if (res.confirm) {
          // 确认送料
          that.onSendShipmentsOrder();
        } else if (res.cancel) {
          // console.log("用户点击取消");
        }
      },
    });
  },

  /**
   * 2. 确认送料
   *首先请求送料列表
   * 在把请求推送接口端
   */
  onSendShipmentsOrder: function () {
    var that = this;
    var actType = that.data.ActType;
    var poid = that.data.Matioid;
    var user_id = app.globalData.userInfo.user_id;
    //1.先获取送料列表
    var requestUrl = "Songliao/CartOption";
    request.post(requestUrl, {
      data: {
        act_type: "QryAllSendCart",
        poid: poid,
        store_id: this.data.store_id,
      },
      success: function (res) {
        // console.log(res);
        if (res.data.status == 1) {
          that.setData({
            push_data: res.data.result,
          });
          // 3. 确认接单
          that.submit();
        } else {
          wx.showToast({
            title: "操作失败请重试!",
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },
  /** 3. 确认接单 */
  submit: function () {
    var that = this;
    request.showLoading();
    setTimeout(() => {
      //请求确认送料接口
      var data = that.data.push_data;
      var data_str = JSON.stringify(data.data);
      var server_ip = that.data.server_ip;
      var requestUrl = "Forward/postApi";
      var params = base64.encode(
        "{" +
          '"' +
          "data" +
          '"' +
          ":" +
          "" +
          data_str +
          "" +
          "," +
          '"' +
          "userid" +
          '"' +
          ":" +
          '"' +
          data.userid +
          '"' +
          "}"
      );
      request.post(requestUrl, {
        data: {
          req_url: "http://" + server_ip,
          req_api: "/ross/post/ReceiveMain",
          req_param_action: "intf_SendShipmentsOrder:CALL",
          req_param_paramet: params,
        },
        success: function (res) {
          //返回成功则调用删除送料列表的接口
          request.hideLoading(); //关闭
          if (res.data.result.eCode == 1) {
            that.data.count = 0;
            // 确定送料后 -- 删除 -- 从送料列表
            that.DelAllSendCart();
            // 1. 推送 信息  获取推送链接
            that.weiXiPushInformation(server_ip);
            let msg = res.data.result.Msg;
            msg = msg ? msg : "发货成功!";
            wx.showModal({
              title: msg,
              showCancel: false,
              //收完要跳转回列表页面
              complete: function () {
                wx.navigateBack({
                  delta: 1,
                });
              },
            });
          } else {
            let msg = res.data.result.Msg;
            msg = msg ? msg : "操作失败请重试!";
            wx.showToast({
              title: res.data.result.Msg,
              icon: "none",
              duration: 2000,
            });
          }
        },
        error: function (err) {
          request.hideLoading();
        },
      });
    }, 200);
  },

  /** 1. 推送 信息  获取推送链接*/
  pushInformation() {
    var that = this;
    var server_ip = that.data.server_ip;
    var poid = that.data.Matioid;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" + '"' + "poid" + '"' + ":" + "" + poid + "" + "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "intf_SendShipmentsOrderMsg:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          if (res.data.result.eCode == "1") {
            that.setData({
              succRul: res.data.result.ResultData,
            });
          }
        } else {
          that.setData({
            succRul: "",
          });
        }
      },
    });
  },

  /** 2. 微信推送 ,对返回值暂时不做处理*/
  weiXiPushInformation() {
    var that = this;
    setTimeout(() => {
      that.pushInformation();
    }, 200);
    setTimeout(() => {
      request.post("Songliao/WechatPushMsg", {
        data: {
          poid: that.data.Matioid, // 采购单号
          providerid: that.data.providerid, // 供应商id
          mlName: that.data.code + "/" + that.data.color, // 物料字符串，002/红色物料，003/黑色物料，code/name
          Provider: that.data.title3, // 供应商名称
          PlanDeliverDate: that.data.deliverdate, //要求货期
          store_id: that.data.store_id, // 企业id
          html_url: that.data.succRul, // 传入的链接
        },
        success: function (res) {
          if (res.data.status == 1) {
          } else {
          }
        },
      });
    }, 1000);
  },

  /** 获取单个物料已送料的记录 */
  getOneSLInfo:function(item){
    var that = this;
    
    var poid = that.data.Matioid;
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "POID" +
        '"' +
        ":" +
        '"' +
        poid +
        '"' +
        "," +
        '"' +
        "model" +
        '"' +
        ":" +
        '"' +
        // (item.model != null ? item.model : '') +
        '' +
        '"' +
        "," +
        '"' +
        "code" +
        '"' +
        ":" +
        '"' +
        (item.code != null ? item.code : '')  +
        '"' +
        "," +
        '"' +
        "colorid" +
        '"' +
        ":" +
        '"' +
        (item.colorid != null ? item.colorid : '') +
        '"' +
        "," +
        '"' +
        "color" +
        '"' +
        ":" +
        '"' +
        (item.color != null ? item.color : '') +
        '"' +

        "," +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"Wp_ShipmentsOrder"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ShipmentsOrderDetailRollCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          if(res.data.result.ResultData){
            res.data.result.ResultData.forEach(function (item, index) {
              that.setData({
                multunit: item.multunit,
                lastNum: item.num,
                TCount: Math.floor(
                  ((that.data.TCount + parseFloat(item.count)) * 100) / 100
                ),
              });
            });
          }
          that.setData({
            getOneSLInfo: res.data.result.ResultData,
          });
        }
    
      },
    });
  }

});
