// pages/my_sllist_detail/my_sllist_detail.js
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require("../../utils/util.js");
var common = require("../../utils/common.js");
import LoadMore from "../../utils/LoadMore.js";
var base64 = require("../../utils/base64");
var load = new LoadMore();

let animationShowHeight = 450;
let animationShowHeightB = 300;

Page({
  /** 页面的初始数据 */
  data: {
    defaultImage: "../../images/jietu.png",
    openSpecModal: false, //是否打开规格弹窗
    animationData: "",

    openBModal: false, //是否回货前需批色弹窗
    animationDataB: "",

    songliaoDetail: null, // 待送料详情
    POID: "", // poid
    matioid: "", // code: "PIQ002"
    color: "", // color: "红色"
    listLength: 0, // 数组的长度

    batchno: 1, //批次号就是缸号

    // 从my_sllist 传过来的参数
    deliveryID: "", // 送料单号
    server_ip: "", // 请求的链接

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
    desmodelIndex: 0, //修改備註

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

    getFenJuanIngo: null, // 单个物料明细的分卷明细
    fjCount: 0, // 分卷明细  的  数量
    fjNum: "", // 分卷明细  的 卷数
      multunit:""//单位
  },

  /* 生命周期函数--监听页面加载 */
  onShow: function (options) {
    // 获取当前小程序的页面栈
    let pages = getCurrentPages();
    // 数组中索引最大的页面--当前页面
    let currentPage = pages[pages.length - 1];
    // 打印出当前页面中的 options
    options = currentPage.options;
    var that = this;
    // console.log("my_slList_detail", options);
    that.setData({
      deliveryID: options.deliveryID,
      server_ip: options.server_ip,
      deliverdate: options.deliverdate,
      deliveryID: options.deliveryID,
    });

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
    // 1. 点击加，让 卷号 和  送料数 加一行
    // var that = this;
    // let tempInputValue = that.data.inputValue + 1;
    // let tempVolume = [];
    // for (let i = 0; i < tempInputValue; i++) {
    //   let obj = { num: i + 1, count: 1 };
    //   tempVolume.push(obj);
    // }
    // let tempSetData = "payOffInfo.list";
    // this.setData({
    //   inputValue: tempInputValue,
    //   [tempSetData]: tempVolume,
    // });

    // 2. 点击加 ， 让送料数加 1.  不要删除 有可能会恢复使用
    // let index = e.currentTarget.dataset.index;
    // if (!this.data.payOffInfo.list[index].count) {
    //   this.data.payOffInfo.list[index].count = 0;
    // }
    // let tempVolume = "payOffInfo.list[" + index + "].count";
    // this.setData({
    //   [tempVolume]: this.data.payOffInfo.list[index].count + 1,
    // });
  },
  // 点击-
  subCartNum(e) {
    let index = e.currentTarget.dataset.index;
    let length = this.data.payOffInfo.list.length - 1;
    let list = this.data.payOffInfo.list;
    list.splice(index, 1);
    let tempSetData = "payOffInfo.list";
    this.setData({
      inputValue: length,
      [tempSetData]: list,
    });
    // 1. 点击  - ，让 卷号 和  送料数 减一行。
    // var that = this;
    // let tempInputValue = that.data.inputValue - 1;
    // let tempVolume = [];
    // for (let i = 0; i < tempInputValue; i++) {
    //   let obj = { num: i + 1, count: 1 };
    //   tempVolume.push(obj);
    // }
    // let tempSetData = "payOffInfo.list";
    // this.setData({
    //   inputValue: tempInputValue,
    //   [tempSetData]: tempVolume,
    // });

    // 2. 点击 - ， 让送料数减 1.  不要删除 有可能会恢复使用
    // let index = e.currentTarget.dataset.index;
    // if (
    //   !this.data.payOffInfo.list[index].count ||
    //   this.data.payOffInfo.list[index].count == 1
    // ) {
    //   this.data.payOffInfo.list[index].count = 1;
    //   wx.showToast({
    //     title: "送料数不少于0",
    //     icon: "none",
    //     duration: 1000,
    //   });
    //   return;
    // }
    // let tempVolume = "payOffInfo.list[" + index + "].count";
    // this.setData({
    //   [tempVolume]: this.data.payOffInfo.list[index].count - 1,
    // });
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

  /** 获取待送料记录详情 */
  getSLDetail: function () {
    var that = this;
    request.showLoading();
    var deliveryID = that.data.deliveryID;
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ShipmentsOrder" +
        '"' +
        "," +
        '"' +
        "deliveryID" +
        '"' +
        ":" +
        '"' +
        deliveryID +
        '"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_MyShipmentsOrderDetail:CALL",
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
            // providerid: res.data.result.ResultData[0].providerid,
          });
        }
        that.data.songliaoDetail.forEach((el) => {
          that.setData({
            POID: el.POID,
            matioid: el.matioid,
            // color: el.color,
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

  /** 打开 规格 弹窗 */
  openSpecModel: function (e) {
    let index = e.currentTarget.dataset.index;
    var state = e.currentTarget.dataset.detail.state;
    if (state != "未收料") {
      wx.showToast({
        title: "该物料已经收料,无法修改!",
        icon: "none",
        duration: 2000,
      });
      return false;
    }
    this.getSpec(this.data.songliaoDetail[index]);
  },
  /** 获取规格明细 */
  getSpec(info) {
    var that = this;
    var deliveryID = that.data.deliveryID;
    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ShipmentsOrder" +
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
        "POID" +
        '"' +
        ":" +
        '"' +
        (info.POID != null ? info.POID : "") +
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
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + server_ip,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_MyShipmentsOrderDetailRoll:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let payOffInfo = {
          batchno: 1,
          list: [{ num: 1, count: 1 }],
          count: 1,
          is_roll: 0,
        };
        if (res.data.status == 1 && res.data.result.ResultData.length > 0) {
          let list = res.data.result.ResultData;
          payOffInfo.list = list;
          payOffInfo.batchno = list[0].batchno;
          payOffInfo.count = res.data.result.ResultData.length;
          if (res.data.result.ResultData.length > 1) {
            payOffInfo.is_roll = 1;
          }

          if (res.data.result.ResultData) {
            that.setData({ fjCount: 0 });
            res.data.result.ResultData.forEach(function (item, index) {
              that.setData({
                fjNum: item.num,
                fjCount: Math.floor((that.data.fjCount + parseFloat(item.count))*100)/100,
                  multunit:item.multunit
              });
            });
          }
          that.setData({
            getTanKuangIngo: res.data.result.ResultData,
          });
        }
        // console.log("卷号的数量", payOffInfo);
        that.setData({
          payOffInfo: payOffInfo,
          batchno: Number(payOffInfo.batchno),
          switchChecked: !!payOffInfo.is_roll,
          inputValue: Number(payOffInfo.count),
          openSpecModal: true,
        });
        // console.log("卷数", payOffInfo);
        var animation = wx.createAnimation({
          duration: 200,
          timingFunction: "linear",
          delay: 0,
        });
        this.animation = animation;
        animation.translateY(animationShowHeight).step();
        that.setData({
          animationData: animation.export(),
        });
        setTimeout(
          function () {
            animation.translateY(0).step();
            that.setData({
              animationData: animation.export(),
            });
          }.bind(this),
          0
        );
      },
    });
  },
  //打印标签
  printaddCart() {
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
      act_type: "addcart",
      roll_list: JSON.stringify(roll_list),
      poid: item.POID != "undefined" ? item.POID : "",
      name: item.name != "undefined" ? item.name : "",
      colorid: item.ColorID != "undefined" ? item.ColorID : "",
      color: item.color != "undefined" ? item.color : "",
      provcolorid: item.ProvColorID != "undefined" ? item.ProvColorID : "",
      provcolor: item.ProvColor != "undefined" ? item.ProvColor : "",
      fgweight: item.FGWeight != "undefined" ? item.FGWeight : "",
      multqty: item.multqty != "undefined" ? item.multqty : "",
      multprice: item.multprice != "undefined" ? item.multprice : "",
      multtotal: item.multtotal != "undefined" ? item.multtotal : "",
      batchno: this.data.batchno != "undefined" ? this.data.batchno : "",
      model: item.model != "undefined" ? item.model : "",
      polistlsh: item.polistlsh != "undefined" ? item.polistlsh : "",
      MultUnit: item.multunit != "undefined" ? item.multunit : "", //
      store_id: this.data.store_id, //
      matid: item.MatID != "undefined" ? item.MatID : "",
      matbarcodeid: this.generateMixed(16), //
      polistid: item.PinID != "undefined" ? item.PinID : "",
      code: item.code != "undefined" ? item.code : "",
      providerid: item.providerid != "undefined" ? item.providerid : "",
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

  /** 删除  */
  onDelete: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    var detail = e.target.dataset.detail;
    var state = e.target.dataset.detail.state;
    if (state != "未收料") {
      wx.showToast({
        title: "该物料已经收料,无法删除!",
        icon: "none",
        duration: 2000,
      });
      return false;
    }
    wx.showModal({
      // title: '提示',
      content: "确认删除当前送料单明细？",
      success(res) {
        if (res.confirm) {
          var deliveryID = e.target.dataset.deliveryid;
          var POID = that.data.POID;
          var serverIp = that.data.server_ip;
          var requestUrl = "Forward/postApi";
          var params = base64.encode(
            "{" +
              '"' +
              "modelson" +
              '"' +
              ":" +
              '"' +
              "Wp_ShipmentsOrder" +
              '"' +
              "," +
              '"' +
              "providerid" +
              '"' +
              ":" +
              '"' +
              detail.providerid +
              '"' +
              "," +
              '"' +
              "code" +
              '"' +
              ":" +
              '"' +
              detail.code +
              '"' +
              "," +
              '"' +
              "name" +
              '"' +
              ":" +
              '"' +
              detail.name +
              '"' +
              "," +
              '"' +
              "colorid" +
              '"' +
              ":" +
              '"' +
              (detail.ColorID != undefined ? detail.ColorID : "") +
              '"' +
              "," +
              '"' +
              "color" +
              '"' +
              ":" +
              '"' +
              detail.color +
              '"' +
              "," +
              '"' +
              "model" +
              '"' +
              ":" +
              '"' +
              detail.model +
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
              "poid" +
              '"' +
              ":" +
              '"' +
              POID +
              '"' +
              "}"
          );
          request.post(requestUrl, {
            data: {
              req_url: "http://" + serverIp,
              req_api: "/ross/post/ReceiveMain",
              req_param_action: "inif_MyShipmentsOrderDeletelist:CALL",
              req_param_paramet: params,
            },
            success: function (res) {
              if (res.data.result.eCode == "1") {
                let songliaoDetail = that.data.songliaoDetail;
                songliaoDetail.splice(index, 1);
                that.setData({
                  songliaoDetail: songliaoDetail,
                  listLength: that.data.listLength - 1,
                });
                wx.showToast({
                  title: "删除成功",
                  icon: "success",
                  duration: 2000,
                });
              } else {
                wx.showToast({
                  title: res.data.result.Msg,
                  icon: "none",
                  duration: 2000,
                });
              }
            },
          });
        } else if (res.cancel) {
          // console.log("用户点击取消");
        }
      },
    });
  },

  // 加入送料列表
  editSongliaoList() {
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
    that.setData({
      deliverdate: item.Deliverdate != null ? item.Deliverdate : "",
    });
    // console.log("当前测试的数据", item);
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
      act_type: "EditSendCart",
      roll_list: JSON.stringify(roll_list),
      poid: item.POID != "undefined" ? item.POID : "",
      name: item.name != "undefined" ? item.name : "",
      colorid: item.ColorID != "undefined" ? item.ColorID : "",
      color: item.color != "undefined" ? item.color : "",
      provcolorid: item.ProvColorID != "undefined" ? item.ProvColorID : "",
      provcolor: item.ProvColor != "undefined" ? item.ProvColor : "",
      fgweight: item.FGWeight != "undefined" ? item.FGWeight : "",
      multqty: item.multqty != "undefined" ? item.multqty : "",
      multprice: item.multprice != "undefined" ? item.multprice : "",
      multtotal: item.multtotal != "undefined" ? item.multtotal : "",
      batchno: this.data.batchno != "undefined" ? this.data.batchno : "",
      model: item.model != "undefined" ? item.model : "",
      polistlsh: item.polistlsh != "undefined" ? item.polistlsh : "",
      MultUnit: item.multunit != "undefined" ? item.multunit : "", //
      store_id: this.data.store_id, //
      matid: item.MatID != "undefined" ? item.MatID : "",
      matbarcodeid: this.generateMixed(16), //
      polistid: item.PinID != "undefined" ? item.PinID : "",
      code: item.code != "undefined" ? item.code : "",
      picture: item.picture != "undefined" ? item.picture : "",
      deliverDate: item.Deliverdate != "undefined" ? item.Deliverdate : "", //
      providerid: item.providerid,
    };
    request.post("Songliao/CartOption", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          this.setData({
            push_data: res.data.result,
          });
          that.closeSpecModal();
          that.submit(item);
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

  /** 3. 确认接单 */
  submit(info) {
    var that = this;
    request.showLoading();
    setTimeout(() => {
      //请求确认送料接口
      var data = that.data.push_data;
      var data_str = JSON.stringify(data.data);
      var server_ip = that.data.server_ip;
      var requestUrl = "Forward/postApi";
      var deliveryID = that.data.deliveryID;
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
          "," +
          '"' +
          "deliveryID" +
          '"' +
          ":" +
          '"' +
          deliveryID +
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
            // 1. 推送 信息  获取推送链接
            that.weiXiPushInformation(server_ip,info);
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
  /** 2. 微信推送 ,对返回值暂时不做处理*/
  weiXiPushInformation(server_ip,info) {
    var that = this;
    setTimeout(() => {
      that.pushInformation();
    }, 200);
    setTimeout(() => {
      request.post("Songliao/WechatPushMsg", {
        data: {
          poid: that.data.POID, // 采购单号
          providerid: that.data.providerid, // 供应商id
          mlName: info.code + "/" + info.color, // 物料字符串，002/红色物料，003/黑色物料，code/name
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

  /** 1. 推送 信息  获取推送链接*/
  pushInformation() {
    var that = this;
    var server_ip = that.data.server_ip;
    var poid = that.data.POID;
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
});
