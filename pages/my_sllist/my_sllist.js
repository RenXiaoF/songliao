// pages/my_sllist/my_sllist.js
var app = getApp();
var request = app.request;
var dateTimePicker = require("../../utils/dateTimePicker.js");
var base64 = require("../../utils/base64");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    select: false, // 判断授权是否被选中

    authUserList: null, // 获取用户 授权 的list

    daisongliaoList: null, // 待送料列表 3
    daisongliaocount: "", // 返回的总数量 3

    title3: "", // 用户的公司名称
    title1: "", // 用户的公司 的 store_id
    title2: "", // 用户的公司名称
    pageidx: "1", // 页码

    providerid: "", // 商家的私有id
    server_ip: "", // 请求的IP地址 请求的链接 从--我的订单--进入时使用
    store_id: "", // 商家的id 从--我的订单--进入时使用

    idx: 0,

    Y: "", // 年
    M: "", // 月
    D: "", // 日
    h: "", // 时
    m: "", // 分
    s: "", // 秒

    // 时间选择器
    date: "2020/03/10",
    date1: "2020/03/17",
    time: "12:00",
    dateTimeArray: null,
    dateTime: null,
    dateTimeArray1: null,
    dateTime1: null,
    startYear: 2000,
    endYear: 2050,

    // 1. 搜索
    addflag: true, //判断是否显示搜索框右侧部分
    addimg: "../../images/search.png",
    searchstr: "",
  },

  /** 生命周期函数--监听页面加载 */
  onShow: function (options) {
    // 获取当前小程序的页面栈
    let pages = getCurrentPages();
    // 数组中索引最大的页面--当前页面
    let currentPage = pages[pages.length - 1];
    // 打印出当前页面中的 options
    options = currentPage.options;
    var that = this;
    that.setData({
      title3: options.store_name, // 商家名称
      providerid: options.providerid, // 私有id
      server_ip: options.server_ip, // 请求连接
      store_id: options.store_id, // 商家id
    });

    wx.setStorage({ key: "server_ip", data: options.server_ip });
    wx.setStorage({ key: "store_id", data: options.store_id });
    wx.setStorage({ key: "providerid", data: options.providerid });
    wx.setStorage({ key: "title3", data: options.store_name });

    var timpdate = new Date();
    that.data.Y = timpdate.getFullYear() + "/"; // 年
    that.data.M = (timpdate.getMonth() + 1 < 10 ? "0" + (timpdate.getMonth() + 1) : timpdate.getMonth() + 1) + "/"; // 月
    that.data.D = timpdate.getDate() + " "; // 日
    that.data.h = timpdate.getHours() + ":"; // 时
    that.data.m = timpdate.getMinutes() + ":"; // 分
    that.data.s = timpdate.getSeconds(); // 秒
    let tempOldDate = that.data.Y + that.data.M + that.data.D;
    that.setData({
      date: that.getBeforeDate(7),
      date1: tempOldDate.replace(/-/g, '/'),
    });
    // 获取用户授权
    this.getUserAuthorization();

    // 获取 待送货列表
    setTimeout(() => {
      this.getTotalCountReturnDSL3(); //待送料数量
      setTimeout(() => {
        this.getTofeedList3(); //待送料列表
      }, 200);
    }, 200);

    // 1.获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(
      this.data.startYear,
      this.data.endYear
    );
    var obj1 = dateTimePicker.dateTimePicker(
      this.data.startYear,
      this.data.endYear
    );
    // 2.精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();
    // 3.数据赋值
    this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime,
    });
  },
  /**
   * 获取当前天数的前七天
   * @param n
   * @returns {string|*}
   */
  getBeforeDate(n) {
    var n = n;
    var d = new Date();
    var year = d.getFullYear();
    var mon = d.getMonth() + 1;
    var day = d.getDate();
    if (day <= n) {
      if (mon > 1) {
        mon = mon - 1;
      } else {
        year = year - 1;
        mon = 12;
      }
    }
    d.setDate(d.getDate() - n);
    year = d.getFullYear();
    mon = d.getMonth() + 1;
    day = d.getDate();
    let s =
      year +
      "/" +
      (mon < 10 ? "0" + mon : mon) +
      "/" +
      (day < 10 ? "0" + day : day);
    return s;
  },

  /** 获取用户授权 */
  getUserAuthorization: function () {
    var that = this;
    var requestUrl = "User/getUserAuth";
    request.post(requestUrl, {
      success: function (res) {
        // 临时的载体 用户授权
        let auList = res.data.result;
        if (res.data.status == 1) {
          if (res.data.result) {
            that.setData({
              authUserList: res.data.result,
            });
          }
        }
        if (that.data.authUserList) {
          that.data.authUserList.forEach(function (item, index) {
            that.setData({ title1: item.store_id });
            if (index == 0) {
              that.setData({
                providerid1: item.providerid,
                server_ip1: item.server_ip,
                store_id1: item.store_id,
              });
            }
          });
        }
      },
    });
  },

  /** ============================================搜索 开始================================ */
  // 搜索框右侧 事件
  addhandle(e) {
    var that = this;
    // console.log("触发搜索框右侧事件", e);
    that.setData({ pageidx: "1" });
    this.searchTofeedList3();
  },

  //搜索框输入时触发
  searchList(ev) {
    var that = this;
    var e = ev.detail.detail.value;

    that.setData({
      searchstr: e,
    });
  },
  //搜索回调
  endsearchList(e) {
    var that = this;
  },
  // 取消搜索
  cancelsearch() {
    var that = this;
    this.setData({
      searchstr: "",
    });

    this.getTofeedList3();
  },
  //清空搜索框
  activity_clear(e) {
    // 获取 待送货列表
    var that = this;
    this.setData({
      searchstr: "",
    });
  },
  /** ==============================================搜索  结束================================== */

  /** 搜索 --待送料列表   */
  searchTofeedList3: function () {
    var that = this;
    var pageidx = that.data.pageidx;
    var screen = that.data.searchstr;
    var start_time = that.data.date;
    var end_time = that.data.date1;
    var providerid = that.data.providerid;
    var serverIp = that.data.server_ip;
    var requestUrl = "Forward/postApi";
    // 将标准时间  准换成  时间戳
    var timestamp = new Date(start_time).getTime();
    var timestamp1 = new Date(end_time).getTime();
    var timestamp2 = timestamp - timestamp1;
    // console.log('order-list转换时间', timestamp,timestamp1,typeof(timestamp2), timestamp2);

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
        "pageidx" +
        '"' +
        ":" +
        '"' +
        pageidx +
        '"' +
        "," +
        '"' +
        "screen" +
        '"' +
        ":" +
        '"' +
        screen +
        '"' +
        "," +
        '"' +
        "beginDate" +
        '"' +
        ":" +
        '"' +
        start_time +
        '"' +
        "," +
        '"' +
        "endDate" +
        '"' +
        ":" +
        '"' +
        end_time +
        '"' +
        "," +
        '"' +
        "providerid" +
        '"' +
        ":" +
        '"' +
        providerid +
        '"' +
        "}"
    );

    if (timestamp2 > 0) {
      wx.showModal({
        title: "警告",
        content: "开始时间不能大于结束时间!",
        success(res) {
          if (res.confirm) {
            // console.log('用户点击确定')
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        },
      });
    }
    if (timestamp2 < 0) {
      request.post(requestUrl, {
        data: {
          req_url: "http://" + serverIp,
          req_api: "/ross/post/ReceiveMain",
          req_param_action: "inif_MyShipmentsOrder:CALL",
          req_param_paramet: params,
        },
        success: function (res) {
          // console.log("获取-待送货列表", res.data);

          if (res.data.status == 1) {
            that.setData({
              daisongliaoList: res.data.result.ResultData,
            });
          }
        },
      });
    }
  },

  /** 获取 --- 待送料列表  */
  getTofeedList3: function () {
    var that = this;
    var homePage = that.data.pageidx;
    var start_time = that.data.date;
    var end_time = that.data.date1;
    var providerid = that.data.providerid;
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
        "pageidx" +
        '"' +
        ":" +
        '"' +
        homePage +
        '"' +
        "," +
        '"' +
        "screen" +
        '"' +
        ":" +
        '"' +
        '"' +
        "," +
        '"' +
        "beginDate" +
        '"' +
        ":" +
        '"' +
        start_time +
        '"' +
        "," +
        '"' +
        "endDate" +
        '"' +
        ":" +
        '"' +
        end_time +
        '"' +
        "," +
        '"' +
        "providerid" +
        '"' +
        ":" +
        '"' +
        providerid +
        '"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        // req_url: "http://59.41.187.99:6790",
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_MyShipmentsOrder:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        // 临时的数组
        let tempDatadsl3 = that.data.daisongliaoList;
        if (res.data.status == 1 && that.data.pageidx == "1") {
          tempDatadsl3 = res.data.result.ResultData;
        } else {
          for (let item of res.data.result.ResultData) {
            tempDatadsl3.push(item);
          }
        }
        that.setData({
          daisongliaoList: tempDatadsl3,
        });
      },
    });
  },

  /** 返回的总数量 待送料列表  */
  getTotalCountReturnDSL3: function () {
    var that = this;
    var start_time = that.getBeforeDate(7);
    var end_time = that.data.Y + that.data.M + that.data.D;
    var providerid = that.data.providerid;
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
        "screen" +
        '"' +
        ":" +
        '"' +
        '"' +
        "," +
        '"' +
        "begindate" +
        '"' +
        ":" +
        '"' +
        start_time +
        '"' +
        "," +
        '"' +
        "enddate" +
        '"' +
        ":" +
        '"' +
        end_time +
        '"' +
        "," +
        '"' +
        "providerid" +
        '"' +
        ":" +
        '"' +
        providerid +
        '"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_MyShipmentsOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            daisongliaocount: res.data.result.ResultData[0]["count"],
          });
        }
        // console.log("order-list:返回的总数量", that.data.daisongliaocount);
      },
    });
  },

  /** 时间选择器 返回的总数量 待送料列表  */
  searchTotalCountReturnDSL3: function () {
    var that = this;
    var start_time = that.data.date;
    var end_time = that.data.date1;
    var providerid = that.data.providerid;
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
        "screen" +
        '"' +
        ":" +
        '"' +
        '"' +
        "," +
        '"' +
        "begindate" +
        '"' +
        ":" +
        '"' +
        start_time +
        '"' +
        "," +
        '"' +
        "enddate" +
        '"' +
        ":" +
        '"' +
        end_time +
        '"' +
        "," +
        '"' +
        "providerid" +
        '"' +
        ":" +
        '"' +
        providerid +
        '"' +
        "}"
    );
    request.post(requestUrl, {
      data: {
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_MyShipmentsOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            daisongliaocount: res.data.result.ResultData[0]["count"],
          });
        }
        // console.log("order-list:返回的总数量", that.data.daisongliaocount);
      },
    });
  },

  /** 切换 按钮 */
  tabClick: function (e) {
    var typeId = e.currentTarget.id;
    this.setData({
      activeCategoryId: typeId,
    });
    if (typeId == 1) {
      this.tabMaterialContent();
    }
  },
  /** 点击 送料记录 */
  tabMaterialContent: function () {
    this.setData({ activeCategoryId: 1 });
  },

  /** =======================时间选择器================================ */
  // 年  月  日
  changeDate(e) {
    var that = this;
    let tempOldDate = e.detail.value
    that.setData({ date: tempOldDate.replace(/-/g, '/') });
    // this.setData({ date: e.detail.value });
    that.setData({ pageidx: "1" });

    this.searchTofeedList3();
    this.searchTotalCountReturnDSL3();
  },
  changeDate1(e) {
    var that = this;
    let tempOldDate = e.detail.value
    that.setData({ date1: tempOldDate.replace(/-/g, '/') });
    // this.setData({ date1: e.detail.value });
    that.setData({ pageidx: "1" });

    this.searchTofeedList3();
    this.searchTotalCountReturnDSL3();
  },
  // 时  分
  changeTime(e) {
    this.setData({ time: e.detail.value });
  },
  // 年  月  日  时  分  秒 ==== 开始时间
  changeDateTime(e) {
    this.setData({ dateTime: e.detail.value });
  },
  // 年  月  日  时  分
  changeDateTimeColumn(e) {
    var arr = this.data.dateTime,
      dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(
      dateArr[0][arr[0]],
      dateArr[1][arr[1]]
    );

    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr,
    });
  },
  // 年  月  日  时  分  秒 ==== 结束时间
  changeDateTime1(e) {
    this.setData({ dateTime1: e.detail.value });
  },
  // 年  月  日  时  分
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1,
      dateArr = this.data.dateTimeArray1;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(
      dateArr[0][arr[0]],
      dateArr[1][arr[1]]
    );

    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr,
    });
  },
  /** =======================时间选择器================================ */

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var num1 = Number(that.data.pageidx);
    num1 += num1;
    that.setData({
      pageidx: num1.toString(),
    });
    this.getTofeedList3();
  },

  bindShowMsg() {
    this.setData({
      select: !this.data.select,
    });
  },
  mySelect(e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      select: false,
    });
  },

  /** 去到 供应商列表页 */
  goToSearchStore: function () {
    var that = this;
    wx.navigateTo({
      url:
        "/pages/search_store/search_store?goto1=3&store_id=" +
        that.data.store_id,
    });
  },
  /** 取消  返回 */
  onUnload: function (e) {
    wx.navigateBack({
      delta: 2, // 返回上一级页面。
    });
  },

  /** 删除 */
  onDelete: function (e) {
    // console.log("my_slList:删除", e);
    var that = this;
    var index = e.target.dataset.index;
    var detail = e.target.dataset.detail;
    var poid = e.target.dataset.detail.poid;
    wx.showModal({
      // title: '提示',
      content: "确认删除当前送料单？",
      success(res) {
        if (res.confirm) {
          var deliveryID = e.target.dataset.deliveryid;
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
              "poid" +
              '"' +
              ":" +
              '"' +
              poid +
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
              req_url: "http://" + serverIp,
              req_api: "/ross/post/ReceiveMain",
              req_param_action: "inif_MyShipmentsOrderDelete:CALL",
              req_param_paramet: params,
            },
            success: function (res) {
              if (res.data.result.eCode == "1") {
                // 1.删除一个，隐藏一个
                let daisongliaoList = that.data.daisongliaoList;
                daisongliaoList.splice(index, 1);
                that.setData({
                  daisongliaoList: daisongliaoList,
                  // 2.删除一个，隐藏一个
                  daisongliaocount: that.data.daisongliaocount - 1,
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
});
