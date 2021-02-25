// pages/order_management_detail/order_management_detail.js
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require("../../utils/util.js");
var common = require("../../utils/common.js");
import LoadMore from "../../utils/LoadMore.js";
var base64 = require("../../utils/base64");
var load = new LoadMore();
// 选择图片
import { promisify } from "../../utils/promise.util";
import { $init, $digest } from "../../utils/common.util";

const wxUploadFile = promisify(wx.uploadFile);
// 弹框
let animationShowHeightB = 300;

Page({
  /** 页面的初始数据 */
  data: {
    defaultImage: "../../images/jietu.png",

    openBModal: false, //是否回货前需批色弹窗
    animationDataB: "",

    songliaoDetail: null, // 待送料详情
    title: "",
    listLength: 0, // 数组的长度
    jdTime: "", // 接单时间

    type: "", // 从 待接单  已接单  全部  进入
    Matioid: "", // 物料编号
    ActType: "", // 页码
    server_ip: "", // 请求的链接

    // modelIndex: 0, // 保存当前打开"去送料"窗口下标
    poid: "",
    desmodelIndex: 0, //修改備註 的 index
    changeTimeModelIndex: 0, // 选择时间的  index

    des: "", //備註
    FQDeliverdate: "", // 预计交期
    picture: "", // 图片

    // 年月日
    Y: "", // 年
    M: "", // 月
    D: "", // 日
    // 时间选择器
    date: "",

    /** 1. 选择图片 变量 */
    content: "",
    images: [],
    picture1: "",
    picture2: "",
  },

  /* 生命周期函数--监听页面加载 */
  onShow: function (options) {
    // onLoad: function (options) {
    var that = this;

    // 1.1 选择图片 初始化
    $init(this);

    // 获取当前小程序的页面栈
    let pages = getCurrentPages();

    // 数组中索引最大的页面--当前页面
    let currentPage = pages[pages.length - 1];

    // 打印出当前页面中的 options
    options = currentPage.options;
    // console.log("order_managenent-onShow", options);
    // 上一页传过来的参数
    that.setData({
      type: options.type,
      Matioid: options.Matioid,
      ActType: options.ActType,
      server_ip: options.server_ip,
    });
    // 年月日  时分秒
    var timpdate = new Date();
    that.data.Y = timpdate.getFullYear() + "-"; // 年
    that.data.M =
      (timpdate.getMonth() + 1 < 10
        ? "0" + (timpdate.getMonth() + 1)
        : timpdate.getMonth() + 1) + "-"; // 月
    that.data.D = timpdate.getDate() + " "; // 日
    that.setData({
      // date: that.data.Y + that.data.M + that.data.D,
    });

    /** 获取 -- 详情 */
    // 1. 待接单详情
    if (that.data.type == "已审核" || that.data.type == "待接单") {
      // 动态修改页面标题
      wx.setNavigationBarTitle({
        title: "待接单详情",
      });
      // 待接单详情 -- 方法
      setTimeout(() => {
        that.getSLDetail1();
      }, 200);
    }
    // 2. 已接单
    if (!that.data.type || that.data.type == "已接单") {
      // 动态修改页面标题
      wx.setNavigationBarTitle({
        title: "已接单详情",
      });
      // 已接单详情 -- 方法
      setTimeout(() => {
        that.getSLDetail2();
      }, 200);
    }
    // 3. 全部
    if (that.data.type == "已作废") {
      // 动态修改页面标题
      wx.setNavigationBarTitle({
        title: "订单详情",
      });
      // 全部 订单详情 详情 -- 方法
      setTimeout(() => {
        that.getSLDetail3();
      }, 200);
    }
  },

  /** 更新采购单 -- 预计交期时间   */
  updateDeliveryTime() {
    var that = this;
    var actType = that.data.ActType;
    var poid = that.data.Matioid;
    var server_ip = that.data.server_ip;
    var FQDeliverdate = that.data.date;
    var item = that.data.songliaoDetail[that.data.changeTimeModelIndex];
    // console.log('详情'+item);
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
        "FQDeliverdate" +
        '"' +
        ":" +
        '"' +
        FQDeliverdate +
        '"' +
        "," +
        '"' +
        "model" +
        '"' +
        ":" +
        '"' +
        item.model +
        '"' +
        "," +
        '"' +
        "matid" +
        '"' +
        ":" +
        '"' +
        item.matid +
        '"' +
        // "," +
        // '"' +
        // "colorid" +
        // '"' +
        // ":" +
        // '"' +
        // item.colorid +
        // '"' +
        // "," +
        // '"' +
        // "color" +
        // '"' +
        // ":" +
        // '"' +
        // item.color +
        // '"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "updateFQDeliverdate:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.result.eCode == "1") {
          // console.log('测试地址');
          let timpFQDeliverdate = "songliaoDetail[" + that.data.changeTimeModelIndex + "].FQDeliverdate";
          that.setData({ [timpFQDeliverdate]: FQDeliverdate });
        } else {
          // console.log('测试地址2');
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            duration: 2000,
          });
        }
      },
    });
  },

  /** 根据 listLength 的 长度  多次执行  */
  affirmOrders: function () {
    var that = this;
    var tempFQDeliverdate = []; // 临时的预计交期数组
    that.data.songliaoDetail.forEach(function (item) {
      if (item.FQDeliverdate && item.FQDeliverdate != "undifined") {
        tempFQDeliverdate.push(item.FQDeliverdate);
      }
    });
    // console.log("确定接单-全部：",tempFQDeliverdate);
    // for (let idx = 0; idx < that.data.listLength; idx++) {
    //   this.affirmOrder();
    // }
    if (tempFQDeliverdate.length == that.data.listLength) {
      this.affirmOrder();
    } else {
        wx.showToast({
            title: '请选择预计交期!',
            icon: "none",
            duration: 2000,
        });
    }
  },

  /** 采购单详情确认接单 */
  affirmOrder: function () {
    var that = this;

    wx.showModal({
      // title: '提示',
      content: "确定接单？",
      success(res) {
        if (res.confirm) {
          // console.log('用户点击确定')
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
              "}"
          );
          request.post(requestUrl, {
            data: {
              req_url: "http://" + server_ip,
              req_api: "/ross/post/ReceiveMain",
              req_param_action: "updatePolistSatus:CALL",
              req_param_paramet: params,
            },
            success: function (res) {
              if (res.data.status == 1) {
                wx.showToast({
                  title: res.data.msg,
                  icon: "success",
                  duration: 2000,
                });
                wx.navigateBack({
                  delta: 1,
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
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      },
    });
  },

  /** 采购 -- 单上传图片 ----  */
  updatePicture() {
    var that = this;
    var actType = that.data.ActType;
    var poid = that.data.Matioid;
    var server_ip = that.data.server_ip;
    var picture1 = that.data.images[0];
    var picture2 = that.data.images[1];
    that.setData({
      picture1: "",
      picture2: "",
    });
    if (picture1) {
      // 将图片转成 base64
      wx.getFileSystemManager().readFile({
        filePath: picture1, //选择图片返回的相对路径
        encoding: "base64", //编码格式
        success: (res) => {
          let baseImg = "data:image/png;base64," + res.data;
          that.setData({
            picture1: baseImg,
          });
        },
      });
    }
    if (picture2) {
      // 将图片转成 base64
      wx.getFileSystemManager().readFile({
        filePath: picture2, //选择图片返回的相对路径
        encoding: "base64", //编码格式
        success: (res) => {
          let baseImg = "data:image/png;base64," + res.data;
          that.setData({
            picture2: baseImg,
          });
        },
      });
    }
    setTimeout(() => {
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
          "picture1" +
          '"' +
          ":" +
          '"' +
          that.data.picture1 +
          '"' +
          "," +
          '"' +
          "picture2" +
          '"' +
          ":" +
          '"' +
          that.data.picture2 +
          '"' +
          "}"
      );
      request.post(requestUrl, {
        data: {
          req_url: "http://" + server_ip,
          req_api: "/ross/post/ReceiveMain",
          req_param_action: "updatePolistPicture:CALL",
          req_param_paramet: params,
        },
        success: function (res) {
          if (res.data.result.eCode == "1") {
            let songliaoDetail =
              "songliaoDetail[" + that.data.desmodelIndex + "].picture";
            that.setData({
              [songliaoDetail]: that.data.picture1
                ? that.data.picture1
                : that.data.picture2,
              picture1: "",
              picture2: "",
            });
            // wx.showToast({
            //   title: res.data.msg,
            //   icon: "success",
            //   duration: 2000,
            // });
          } else {
            // wx.showToast({
            //   title: res.data.msg,
            //   icon: "none",
            //   duration: 2000,
            // });
          }
        },
      });
    }, 200);
  },


    /** 采购 -- 单上传图片 ----  */
    updateAllPicture() {
        var that = this;
        var actType = that.data.ActType;
        var poid = that.data.Matioid;
        var server_ip = that.data.server_ip;
        var picture1 = that.data.images[0];
        var picture2 = that.data.images[1];
        console.info('当前的数据',picture1);
        if(picture1 =='' || picture1 == undefined){
            wx.showToast({
                title: '请先点击每个物料底部的加号选择图片上传!',
                icon: "none",
                duration: 2000,
            });
            return;
        }
        that.setData({
            picture1: "",
            picture2: "",
        });
        if (picture1) {
            // 将图片转成 base64
            wx.getFileSystemManager().readFile({
                    filePath: picture1, //选择图片返回的相对路径
                    encoding: "base64", //编码格式
                    success: (res) => {
                    let baseImg = "data:image/png;base64," + res.data;
            that.setData({
                picture1: baseImg,
            });
        },
        });
        }
        if (picture2) {
            // 将图片转成 base64
            wx.getFileSystemManager().readFile({
                    filePath: picture2, //选择图片返回的相对路径
                    encoding: "base64", //编码格式
                    success: (res) => {
                    let baseImg = "data:image/png;base64," + res.data;
            that.setData({
                picture2: baseImg,
            });
        },
        });
        }
        setTimeout(() => {
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
            "picture1" +
            '"' +
            ":" +
            '"' +
            that.data.picture1 +
            '"' +
            "," +
            '"' +
            "picture2" +
            '"' +
            ":" +
            '"' +
            that.data.picture2 +
            '"' +
            "}"
        );
        request.post(requestUrl, {
            data: {
                req_url: "http://" + server_ip,
                req_api: "/ross/post/ReceiveMain",
                req_param_action: "updatePolistPicture:CALL",
                req_param_paramet: params,
            },
            success: function (res) {
                if (res.data.result.eCode == "1") {
                    let songliaoDetail =
                        "songliaoDetail[" + that.data.desmodelIndex + "].picture";
                    that.setData({
                        [songliaoDetail]: that.data.picture1
                            ? that.data.picture1
                            : that.data.picture2,
                        picture1: "",
                        picture2: "",
                    });
                    wx.showToast({
                        title: '上传成功!',
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
    }, 200);
    },

  /** 2. 选择图片 -- 选择本地图片 或者 调用相机 */
  chooseImage(e) {
    // console.log(
    //   "2. 选择图片 -- 选择本地图片 或者 调用相机",
    //   e.currentTarget.dataset.index
    // );

    wx.chooseImage({
      sizeType: ["original", "compressed"], //可选择原图或压缩后的图片
      sourceType: ["album", "camera"], //可选择性开放访问相册、相机
      success: (res) => {
        const images = this.data.images.concat(res.tempFilePaths);
        // 限制最多只能留下2张照片
        this.data.images = images.length <= 2 ? images : images.slice(0, 2);
        $digest(this);
        if (this.data.images.length > 0) {
          // console.log('上传图片');
          this.updatePicture();
        }
      },
    });
  },
  /** 3. 选择图片-- 删除 */
  removeImage(e) {
    const idx = e.target.dataset.idx;
    this.data.images.splice(idx, 1);
    $digest(this);
  },
  /** 4. 选择图片 -- 预览图片 */
  handleImagePreview(e) {
    const idx = e.target.dataset.idx;
    const images = this.data.images;
    wx.previewImage({
      current: images[idx], //当前预览的图片
      urls: images, //所有要预览的图片
    });
  },

  /** 获取 -- 待接单 -- 详情 */
  getSLDetail1: function () {
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
        '"Wp_ProManagementOrder"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderDetail:CALL",
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
          });
        }
        that.data.songliaoDetail.forEach((el) => {
          that.setData({
            title: el.poid,
          });
        });
        that.setData({
          listLength: that.data.songliaoDetail.length,
        });
      },
    });
  },
  /** 获取 -- 已接单 -- 详情 */
  getSLDetail2: function () {
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
        '"Wp_ManagementOrder"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderDetail:CALL",
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
          });
        }
        that.data.songliaoDetail.forEach((el) => {
          that.setData({
            title: el.poid,
            jdTime: el.SignInDate.substring(0, 10),
          });
        });
        that.setData({
          listLength: that.data.songliaoDetail.length,
        });
      },
    });
  },
  /** 获取 -- 已作废 接单 -- 详情 */
  getSLDetail3: function () {
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
        '"Wp_AbolishManagementOrder"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderDetail:CALL",
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
          });
        }
        that.data.songliaoDetail.forEach((el) => {
          that.setData({
            title: el.poid,
          });
        });
        that.setData({
          listLength: that.data.songliaoDetail.length,
        });
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

  // 年  月  日
  changeDate(e) {
    var that = this;
    console.log("选择时间", e.currentTarget.dataset.index);
    that.setData({changeTimeModelIndex: e.currentTarget.dataset.index})
    var timpFQDeliverdate = "songliaoDetail[" + e.currentTarget.dataset.index + "].FQDeliverdate";
    var itemValue = (timpFQDeliverdate = e.detail.value);
    this.setData({ date: itemValue });
    this.updateDeliveryTime();
  },

  /** 更新 -- 备注 */
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
          // console.log('当前的备注',songliaoDetail);
          that.setData({
            [songliaoDetail]: that.data.des,
            des: "",
          });
          // wx.showToast({
          //   title: res.data.result.msg,
          //   icon: "success",
          //   duration: 2000,
          // });
        } else {
          // wx.showToast({
          //   title: res.data.result.msg,
          //   icon: "none",
          //   duration: 2000,
          // });
        }
      },
    });
  },
  /** 双向绑定  更新备注 */
  bindTextAreaBlur(e) {
    var that = this;
    that.setData({
      des: e.detail.value,
    });
  },

  /** 打开回货前需批色 弹框 */
  openBModel: function (e) {
    // console.log("打开备注弹框：", e.currentTarget.dataset.index);
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
  },

  /** 返回上一页 */
  goBack: function () {
    wx.navigateBack({
      delta: 1,
    });
  },
});
