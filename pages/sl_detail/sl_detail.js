// pages/sl_detail/sl_detail.js

var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require("../../utils/util.js");
var common = require("../../utils/common.js");
import LoadMore from "../../utils/LoadMore.js";
var base64 = require("../../utils/base64");
var load = new LoadMore();

let animationShowHeightB = 500;

Page({
  /** 页面的初始数据 */
  data: {
    defaultImage: "../../images/jietu.png",

    openBModal: false, //是否回货前需批色弹窗
    animationDataB: "",
    desmodelIndex: 0, // 弹框的index

    songliaoDetail: null, // 待送料详情
    Matioid: "", // 物料编号
    ActType: "", // 页码
    server_ip: "", // 请求的链接
    listLength: 1, // 数组的长度

    fenjuanmingxi: true, // 分卷明细

    getTanKuangIngo: null, // 单个物料的送料明细
    Name: "", // 款名
    Colorid: "", // 需方色号
    color: "", // 需方颜色
    provcolorid: "", // 供方色号
    provcolor: "", // 供方颜色
    FGWeight: "", // 克重
    model: "", // 规格
    code: "", //
    multqty: "", // 送料数
    multunit:'', // 单位

    getFenJuanIngo: null, // 单个物料明细的分卷明细
    rollno: "", // 卷号
    fjCount: 0, // 分卷明细  的  数量
    fjNum: "", // 分卷明细  的 卷数
    ross_list: null,
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    var that = this;
    // console.log("sl_detail:生命周期函数--监听页面加载", options);
    that.setData({
      Matioid: options.Matioid,
      ActType: options.ActType,
      server_ip: options.server_ip,
    });

    setTimeout(() => {
      this.getSLDetail();
      setTimeout(() => {
        // this.getTanKuangIngo();
      }, 200);
    }, 200);
  },

  /** 获取 送料详情 */
  getSLDetail: function () {
    var that = this;
    request.showLoading();
    var POID = that.data.Matioid;
    var act_type = that.data.ActType;
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "POID" +
        '"' +
        ":" +
        '"' +
        POID +
        '"' +
        "," +
        '"' +
        "act_type" +
        '"' +
        ":" +
        '"' +
        "0" +
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
          });
        }
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

  /** 弹框里面的 fenjuanmingxi: true  关闭  分卷明细 */
  fenJuanInfo2: function (e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    let status = e.currentTarget.dataset.status;
    status = status == true ? false : true;
    let ross_list_status = "ross_list." + [index] + ".status";
    that.setData({
      [ross_list_status]: status,
    });
  },

  /** 单个物料明细的分卷明细 fenjuanmingxi: false, 打开 分卷明细  弹框里面的分卷明细 */
  list: function (e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    let deliveryID = e.currentTarget.dataset.deliveryid;
    let batchno = e.currentTarget.dataset.batchno;
    let code = e.currentTarget.dataset.code;
    let colorid = e.currentTarget.dataset.colorid;
    // console.log("分卷明细的数据", e);
    let ross_list_status = "ross_list." + [index] + ".status";
    let ross_list_list = "ross_list." + [index] + ".list";
    that.setData({
      [ross_list_status]: true,
        [ross_list_list]:null
    });
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "batchno" +
        '"' +
        ":" +
        '"' +
        batchno +
        '"' +
        "," +
        '"' +
        "deliveryID" +
        '"' +
        ":" +
        '"' +
        deliveryID +
        '"' +
          "," +
          '"' +
          "code" +
          '"' +
          ":" +
          '"' +
          code +
          '"' +
          "," +
          '"' +
          "colorid" +
          '"' +
          ":" +
          '"' +
          colorid +
          '"' +
        "," +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"Wp_ShipmentsOrder"' +
        "}"
    );
    setTimeout(() => {
      request.post(requestUrl, {
        data: {
          req_url: "http://" + server_ip,
          req_api: "/ross/post/ReceiveMain",
          req_param_action: "inif_MyShipmentsOrderDetailMatRoll:CALL",
          req_param_paramet: params,
        },
        success: function (res) {
          if (res.data.status == 1) {
            if (res.data.result.ResultData) {
              res.data.result.ResultData.forEach(function (val) {
                that.setData({
                  fjNum: val.num,
                });
              });
            }
            let ross_list_list = "ross_list." + [index] + ".list";
            setTimeout(() => {
              that.setData({
                [ross_list_list]: res.data.result.ResultData,
              });
            }, 200);
          }
        },
      });
    }, 300);
  },

  /** 单个物料的送料明细    弹框里面 */
  getTanKuangIngo: function (info) {
    var that = this;

    var POID = that.data.Matioid;
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "POID" +
        '"' +
        ":" +
        '"' +
        POID +
        '"' +
        "," +
        '"' +
        "Name" +
        '"' +
        ":" +
        '"' +
        (info.name != null ? info.name : "") +
        '"' +
        "," +
        '"' +
        "Colorid" +
        '"' +
        ":" +
        '"' +
        (info.ColorID != null ? info.ColorID : "") +
        '"' +
        "," +
        '"' +
        "color" +
        '"' +
        ":" +
        '"' +
        (info.color != null ? info.color : "") +
        '"' +
        "," +
        '"' +
        "provcolorid" +
        '"' +
        ":" +
        '"' +
        (info.ProvColorID != null ? info.ProvColorID : "") +
        '"' +
        "," +
        '"' +
        "provcolor" +
        '"' +
        ":" +
        '"' +
        (info.ProvColor != null ? info.ProvColor : "") +
        '"' +
        "," +
        '"' +
        "Code" +
        '"' +
        ":" +
        '"' +
        (info.code != null ? info.code : "") +
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
        req_param_action: "inif_MyShipmentsOrderDetailMat:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({ fjCount: 0 });
          if (res.data.result.ResultData) {
            res.data.result.ResultData.forEach(function (item, index) {
              item["status"] = true;
              item["list"] = null;
              that.setData({
                rollno: item.rollCount,
                fjCount: Math.floor(
                  ((that.data.fjCount + parseFloat(item.sendqty)) * 100) / 100
                ),
              });
            });
          }
          that.setData({
            getTanKuangIngo: res.data.result.ResultData,
          });
        }
      },
    });
  },

  /** 打开回货前需批色 弹框 */
  openBModel: function (e) {
    this.setData({ openBModal: true });
    var that = this;
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.sld;
    that.setData({
      Name: item.name,
      Colorid: item.ColorID,
      color: item.color,
      provcolorid: item.ProvColorID,
      provcolor: item.ProvColor,
      model: item.model,
      FGWeight: item.FGWeight,
      code: item.code,
      multqty: item.multqty,
      multunit: item.multunit,
        ross_list:null
    });
    that.getTanKuangIngo(that.data.songliaoDetail[index]);
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
});
