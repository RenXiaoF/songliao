// pages/payof-list/payof-list.js
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require("../../utils/util.js");
var common = require("../../utils/common.js");
import LoadMore from "../../utils/LoadMore.js";
var base64 = require("../../utils/base64");
var load = new LoadMore();

let animationShowHeight = 450; // 弹框的高度

Page({
  /**
   * 页面的初始数据
   */
  data: {
    defaultImage: "../../images/jietu.png",
    //是否打开规格弹窗
    openSpecModal: false,
    animationData: "",
    payofList: null, // 送货列表
    payofListmultqty: 0, //  送货列表里面的数量
    store_id: "",
    poid: "",

    selected_all: false, //是否全选
    modelIndex: 0, //保存当前点击卡片下标
    // num:1,        //修改数量值

    // 保存去送料规格框信息
    payOffInfo: {
      batchno: 1, //批次号
      list: [{ num: 1, count: 1 }], // 卷号列表
      count: 1, //卷数
      is_roll: 0, //是否分权,默认0为不分卷
    },

    // 1. 确认送料
    push_data: {},
    Matioid: "", // 物料编号
    ActType: "", // 页码
    server_ip: "", // 请求的链接

    // 获取单个物料已送料的记录
    getOneSLInfo: null, // 获取单个物料已送料的记录
    multunit: "", // 单位
    lastNum: 0, // 最后的卷数
    TCount: 0, // 共多少米
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 获取--送料列表
    this.setData({
      store_id: options.store_id,
      poid: options.poid,
    });

    wx.getStorage({
      key: "server_ip",
      success(res) {
        that.setData({
          server_ip: res.data,
        });
      },
    });

    this.getPayofList();
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
  //改变分卷状态
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
  // 点击+
  addCartNum(e) {
    // 1. 点击加，让 卷号 和  送料数 加一行
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
  // 全选按钮
  selectAll() {
    this.setData({
      selected_all: !this.data.selected_all,
    });
    for (let i = 0; i < this.data.payofList.length; i++) {
      let tempSetData = "payofList[" + i + "].isChecked";
      this.setData({
        [tempSetData]: this.data.selected_all,
      });
    }
  },
  // 单选按钮
  selectPol(e) {
    let index = e.currentTarget.dataset.index; //当前点击下标
    let total_selected = 0; //已选总数
    let tempSetData = "payofList[" + index + "].isChecked";
    this.setData({
      [tempSetData]: !this.data.payofList[index].isChecked,
    });

    for (let item of this.data.payofList) {
      if (item.isChecked) {
        total_selected++;
      } else {
        break;
      }
    }
    if (this.data.payofList.length === total_selected) {
      this.setData({
        selected_all: true,
      });
    } else {
      this.setData({
        selected_all: false,
      });
    }
  },

  // 获取--送料列表
  getPayofList: function () {
    var that = this;
    var requestUrl = "Songliao/CartOption";
    request.post(requestUrl, {
      data: {
        act_type: "QrySendCart",
        poid: this.data.poid,
        store_id: this.data.store_id,
      },
      success: function (res) {
        let temppayofListmultqty = 0;
        if (res.data.status == 1) {
          for (let item of res.data.result) {
            item.isChecked = false;
            temppayofListmultqty = Math.floor((item.multqty * 100) / 100);
          }
          that.setData({
            payofList: res.data.result,
            payofListmultqty: temppayofListmultqty,
          });
        }
      },
    });
  },
  // 删除--送料单
  deleteOneOrder: function (e) {
    var that = this;
    var requestUrl = "Songliao/CartOption";
    let polistids = [];
    var count = 0;
    for (let item of this.data.payofList) {
      if (item.isChecked) {
        polistids.push(item.polistid);
        count++;
      }
    }
    if (polistids == "") {
      wx.showToast({
        title: "请先选择物料!",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      act_type: "DelSendCart",
      polistids: polistids.toString(),
      store_id: this.data.store_id,
      poid: this.data.poid,
    };
    request.post(requestUrl, {
      data,
      success: function (res) {
        let msgIcon = "success";
        if (res.data.status == 1) {
          let tempPayofList = that.data.payofList;
          tempPayofList.splice(that.data.modelIndex, count);
          that.setData({
            payofList: tempPayofList,
          });
        } else {
          msgIcon = "none";
        }
        wx.showToast({
          title: res.data.msg,
          icon: msgIcon,
          duration: 2000,
        });
      },
    });
  },
  // 打印--送料单
  printOrder: function (e) {
    var that = this;
    var requestUrl = "Songliao/printOrder";
    let polistids = [];
    for (let item of this.data.payofList) {
      if (item.isChecked) {
        polistids.push(item.polistid);
      }
    }
    if (polistids == "") {
      wx.showToast({
        title: "请先选择物料!",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      act_type: "list",
      polistids: polistids.toString(),
      store_id: this.data.store_id,
      poid: this.data.poid,
    };
    request.post(requestUrl, {
      data,
      success: function (res) {
        let msgIcon = "success";
        if (res.data.status == 1) {
        } else {
          msgIcon = "none";
        }
        wx.showToast({
          title: res.data.msg,
          icon: msgIcon,
          duration: 2000,
        });
      },
    });
  },

  //打印标签
  printaddCart() {
    let roll_list = [];
    for (let item of this.data.payOffInfo.list) {
      let tempItem = [];
      tempItem.push(item.num + 1);
      tempItem.push(item.count);
      roll_list.push(tempItem);
    }
    let item = this.data.payofList[this.data.modelIndex];
    let data = {
      act_type: "addcart",
      roll_list: JSON.stringify(roll_list),
      poid: item.poid,
      name: item.name,
      colorid: item.colorid,
      color: item.color,
      provcolorid: item.ProvColorID,
      provcolor: item.ProvColor,
      fgweight: item.FGWeight,
      multqty: item.multqty,
      multprice: item.multprice,
      multtotal: item.multtotal,
      batchno: this.data.batchno, //
      model: item.model,
      polistlsh: item.polistlsh, //缺少
      MultUnit: item.multunit, //缺少单位
      store_id: this.data.store_id, //缺少企业id
      matid: item.matid,
      matbarcodeid: this.generateMixed(16), //缺少
      polistid: item.polistid, //缺少
      code: item.code, //缺少
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

  // 编辑--送料数量
  addSongliaoList: function () {
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
    let item = this.data.payofList[this.data.modelIndex];
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
    // 判断总数是否超出
    if (total_count > item.total_multqty) {
      wx.showToast({
        title: "总数不能大于" + item.total_multqty,
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let data = {
      act_type: "AddSendCart",
      roll_list: JSON.stringify(roll_list),
      poid: item.poid,
      name: item.name,
      colorid: item.colorid,
      color: item.color,
      provcolorid: item.ProvColorID,
      provcolor: item.ProvColor,
      fgweight: item.FGWeight,
      multqty: item.total_multqty,
      multprice: item.multprice,
      multtotal: item.multtotal,
      batchno: this.data.batchno,
      model: item.model,
      polistlsh: item.polistlsh, //缺少
      MultUnit: item.multunit, //缺少单位
      store_id: this.data.store_id, //缺少企业id
      matid: item.matid,
      matbarcodeid: this.generateMixed(16), //缺少
      polistid: item.polistid, //缺少
      code: item.code, //缺少
    };
    request.post("Songliao/CartOption", {
      data,
      success: (res) => {
        if (res.data.status == 1) {
          // this.setData({
          //   count: res.data.result
          // });
          let tempSetData = "payofList[" + this.data.modelIndex + "].multqty";
          this.setData({
            [tempSetData]: total_count,
          });
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

  /** 获取单个物料已送料的记录 */
  getOneSLInfo: function (item) {
    var that = this;

    var server_ip = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "POID" +
        '"' +
        ":" +
        '"' +
        (item.poid != null ? item.poid : "") +
        '"' +
        "," +
        '"' +
        "model" +
        '"' +
        ":" +
        '"' +
        // (item.model != null ? item.model : '') +
        "" +
        '"' +
        "," +
        '"' +
        "code" +
        '"' +
        ":" +
        '"' +
        (item.code != null ? item.code : "") +
        '"' +
        "," +
        '"' +
        "colorid" +
        '"' +
        ":" +
        '"' +
        (item.colorid != null ? item.colorid : "") +
        '"' +
        "," +
        '"' +
        "color" +
        '"' +
        ":" +
        '"' +
        (item.color != null ? item.color : "") +
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
          if (res.data.result.ResultData) {
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
  },

  /** 打开规格弹窗 */
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
      polistid: this.data.payofList[index].polistid,
      poid: this.data.payofList[index].poid,
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

  /** 关闭规格弹窗 */
  closeSpecModal: function (e) {
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
    // 判断用户点击类型确认/取消
    if (e.currentTarget.dataset.action === "confirm") {
      this.addSongliaoList();
    } else {
      this.printaddCart();
    }
  },
  /** 关闭规格弹窗 右上角的 ‘X’按钮  单纯的关闭弹框 不调用任何方法 */
  closeSpecModalA: function (e) {
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
  },

  /**
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
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  openConfirm: function () {
    var that = this;
    wx.showModal({
      title: "操作提示",
      content: "是否确认送料?",
      success(res) {
        if (res.confirm) {
          that.onSendShipmentsOrder();
        } else if (res.cancel) {
          // console.log("用户点击取消");
        }
      },
    });
  },
  /**
   *确认送料
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
  /** 提交-- 确认送料 */
  submit: function () {
    var that = this;
    setTimeout(() => {
      //请求确认送料接口
      var data = that.data.push_data;
      var data_str = JSON.stringify(data.data);
      // console.log(data);
      // console.log("测试数据");
      // console.log(data_str);
      // console.log(data.userid);
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
          // console.log("接口返回的数据是", res.data.result);
          // console.log("接口返回的状态是", res.data.result.eCode);
          if (res.data.result.eCode == 1) {
            that.data.count = 0;
            that.DelAllSendCart();
            let msg = res.data.result.Msg;
            msg = msg ? msg : "发货成功!";
            wx.showModal({
              title: msg,
              showCancel: false,
              complete: function () {
                wx.navigateBack({
                  delta: 1,
                });
              },
            });
            //收完要跳转回列表页面
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
      });
    }, 200);
  },
});
