// pages/order_management/order_management.js
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
  /** 页面的初始数据 */
  data: {
    activeCategoryId: 0, //商品主页tab
    categories: [
      { name: "待接单", id: 0, count: 0 },
      { name: "已接单", id: 1, count: 0 },
      { name: "全部", id: 2, count: 0 },
    ],

    select: false, // 判断授权是否被选中

    authUserList: null, // 获取用户 授权 的list

    tatolList: null, // 接单  全部
    tatolListCount: "", // 接单  总数量

    daisongliaoList101: null, // 待送料列表
    daisongliaocount101: "", // 返回的总数量

    songliaoList101: null, // 送料列表
    songliaocount101: "", // 返回的总数量

    title1: "", // 用户的公司 的 store_id
    title2: "", // 用户的公司名称
    pageidx: "1", // 页码
    providerid: "", // 商家的私有id

    // providerid1: "",

    server_ip: "", // 请求的IP地址 请求的链接 从--我的订单--进入时使用
    // server_ip1: "", // 请求的IP地址 请求的链接

    store_id: "", // 商家的id 从--我的订单--进入时使用
    // store_id1: "", // 商家的id

    jdTime: "", // 接单时间

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

    // 头部数量
    titleDSLCount: 0, // 待送料
    titleSLCount: 0, // 已送料
    titleCount: 0, // 全部
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
    // console.log("order-managment:生命周期函数--监听页面加载", options);
    that.setData({
      providerid: options.providerid, // 私有id
      server_ip: options.server_ip, // 请求连接
      store_id: options.store_id, // 商家id
      title2: options.store_name,
    });

    setTimeout(() => {
      this.getTotalCountReturnDSL(); // 待接单 -- 数量
      this.getTotalCountReturnSL(); // 已接单 -- 数量
      this.getTotalCount(); // 全部订单 -- 数量
      setTimeout(() => {
        this.getTofeedList(); // 待接单 列表
        this.getPayofList(); // 已结单 列表
        this.getTatolList(); // 接单  全部
      }, 200);
    }, 200);

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

    that.setData({
      titleDSLCount: 0, // 待送料
      titleSLCount: 0, // 已送料
      titleCount: 0, // 全部
    });
    // 获取用户授权
    this.getUserAuthorization();

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

  /** 返回 -- title 待接单列表 -- 的总数量 */
  titleDSLCount: function (providerid, serverIp) {
    var that = this;
    var start_time = that.getBeforeDate(7);
    var end_time = that.data.Y + that.data.M + that.data.D;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ProManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let count1 = that.data.titleDSLCount;
        if (res.data.status == 1) {
          let count = res.data.result.ResultData[0]["count"];
          let total_count = Number(parseInt(count1) + parseInt(count));
          let tempTitleCount = "categories[0].count";
          that.setData({
            titleDSLCount: total_count,
          });
          setTimeout(() => {
            that.setData({
              [tempTitleCount]: that.data.titleDSLCount,
            });
          }, 200);
        }
      },
    });
  },
  /** 返回 -- title 已接单列表 -- 的总数量 */
  titleSLCount: function (providerid, serverIp) {
    var that = this;
    var start_time = that.getBeforeDate(7);
    var end_time = that.data.Y + that.data.M + that.data.D;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let count1 = that.data.titleSLCount;
        if (res.data.status == 1) {
          let count = res.data.result.ResultData[0]["count"];
          let total_count = Number(parseInt(count1) + parseInt(count));
          let tempTitleCount = "categories[1].count";
          that.setData({
            titleSLCount: total_count,
          });
          setTimeout(() => {
            that.setData({
              [tempTitleCount]: that.data.titleSLCount,
            });
          }, 200);
        }
      },
    });
  },
  /** 返回 -- title  全部订单列表 -- 的总数量  */
  titleCount: function (providerid, serverIp) {
    var that = this;
    var start_time = that.getBeforeDate(7);
    var end_time = that.data.Y + that.data.M + that.data.D;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_AllManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let count1 = that.data.titleCount;
        if (res.data.status == 1) {
          let count = res.data.result.ResultData[0]["POQTY"];
          let total_count = Number(parseInt(count1) + parseInt(count));
          let tempTitleCount = "categories[2].count";
          that.setData({
            titleCount: total_count,
          });
          setTimeout(() => {
            that.setData({
              [tempTitleCount]: that.data.titleCount,
            });
          }, 200);
        }
      },
    });
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
            setTimeout(() => {
              that.titleDSLCount(item.providerid, item.server_ip);
              that.titleSLCount(item.providerid, item.server_ip);
              that.titleCount(item.providerid, item.server_ip);
            }, 500);
          });
        }
      },
    });
  },

  /** ============================================搜索================================ */
  // 搜索框右侧 事件
  addhandle(e) {
    var that = this;
    // console.log("触发搜索框右侧事件", e);
    that.setData({ pageidx: "1" });
    this.searchTofeedList();
    this.searchPayofList();
    this.searchTatolList();
  },

  //搜索框输入时触发
  searchList(ev) {
    var that = this;
    var e = ev.detail.detail.value;

    that.setData({
      searchstr: e,
    });
    // console.log("搜索框输入时触发", e);
  },
  //搜索回调
  endsearchList(e) {
    var that = this;
    // console.log("查询数据");
  },
  // 取消搜索
  cancelsearch() {
    var that = this;
    this.setData({
      searchstr: "",
    });

    this.searchTofeedList();
    this.searchPayofList();
    this.searchTatolList();
  },
  //清空搜索框
  activity_clear(e) {
    // 获取 待送货列表
    var that = this;
    // console.log("触发搜索框右侧事件", e);
    this.setData({
      searchstr: "",
    });
  },
  /** ==============================================搜索================================== */

  /** 获取 --- 待接单列表  */
  getTofeedList: function () {
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
        "Wp_ProManagementOrder" +
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
        req_param_action: "inif_ManagementOrder:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        // 临时的数组
        let tempDatadsl3 = that.data.daisongliaoList101;
        if (res.data.status == 1 && that.data.pageidx == "1") {
          tempDatadsl3 = res.data.result.ResultData;
        } else {
          for (let item of res.data.result.ResultData) {
            tempDatadsl3.push(item);
          }
        }
        that.setData({
          daisongliaoList101: tempDatadsl3,
        });
        
      },
    });
  },
  /** 获取 ---- 已接单列表  */
  getPayofList: function () {
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
        "Wp_ManagementOrder" +
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
        req_param_action: "inif_ManagementOrder:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        // 临时的数组
        let tempDatasl3 = that.data.songliaoList101;
        if (res.data.status == 1 && that.data.pageidx == "1") {
          tempDatasl3 = res.data.result.ResultData;
        } else {
          for (let item of res.data.result.ResultData) {
            tempDatasl3.push(item);
          }
        }
        that.setData({
          songliaoList101: tempDatasl3,
        });
        // console.log('请求-已接单：',that.data.songliaoList101);
      },
    });
  },
  /** 获取 ---- 全部订单列表  */
  getTatolList: function () {
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
        "Wp_AllManagementOrder" +
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
        req_param_action: "inif_ManagementOrder:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        // 临时的数组
        let tempDataT3 = that.data.tatolList;
        if (res.data.status == 1 && that.data.pageidx == "1") {
          tempDataT3 = res.data.result.ResultData;
        } else {
          for (let item of res.data.result.ResultData) {
            tempDataT3.push(item);
          }
        }
        that.setData({
          tatolList: tempDataT3,
        });
      },
    });
  },
  /** 返回 -- 待接单列表 -- 的总数量 */
  getTotalCountReturnDSL: function () {
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
        "Wp_ProManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            daisongliaocount101: res.data.result.ResultData[0]["count"],
          });
        }

        // console.log("order-list:返回的总数量", that.data.daisongliaocount101);
      },
    });
  },
  /** 返回 -- 已接单列表 -- 的总数量 */
  getTotalCountReturnSL: function () {
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
        "Wp_ManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            songliaocount101: res.data.result.ResultData[0]["count"],
          });
        }

        // console.log("order-list:返回的总数量", that.data.songliaocount101);
      },
    });
  },
  /** 返回 -- 全部订单列表 -- 的总数量  */
  getTotalCount: function () {
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
        "Wp_AllManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            tatolListCount: res.data.result.ResultData[0]["POQTY"],
          });
        }

        // console.log("order-list:返回的总数量", that.data.songliaocount101);
      },
    });
  },
  /** 搜索 -- 待接单列表  */
  searchTofeedList: function () {
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
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ProManagementOrder" +
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
          req_param_action: "inif_ManagementOrder:CALL",
          req_param_paramet: params,
        },
        success: function (res) {
          // console.log("获取-待送货列表", res.data);
          if (res.data.status == 1) {
            that.setData({
              daisongliaoList101: res.data.result.ResultData,
            });
          }
          // console.log('待送料搜索：',that.data.daisongliaoList101);
        },
      });
    }
  },
  /** 搜索 --- 已接单列表  */
  searchPayofList: function () {
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
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ManagementOrder" +
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
          req_param_action: "inif_ManagementOrder:CALL",
          req_param_paramet: params,
        },
        success: function (res) {
          // console.log("获取-待送货列表", res.data);
          if (res.data.status == 1) {
            that.setData({
              songliaoList101: res.data.result.ResultData,
            });
          }
        },
      });
    }
  },
  /** 搜索 --- 全部 */
  searchTatolList: function () {
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
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_AllManagementOrder" +
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
          req_param_action: "inif_ManagementOrder:CALL",
          req_param_paramet: params,
        },
        success: function (res) {
          // console.log("获取-待送货列表", res.data);
          if (res.data.status == 1) {
            that.setData({
              tatolList: res.data.result.ResultData,
            });
          }
        },
      });
    }
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

  /** 搜索 -- title 待接单列表 -- 的总数量 */
  SearchTitleDSLCount: function (providerid, serverIp) {
    var that = this;
    var start_time = that.data.date;
    var end_time = that.data.date1;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ProManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let count1 = that.data.titleDSLCount;
        if (res.data.status == 1) {
          let count = res.data.result.ResultData[0]["count"];
          let total_count = Number(parseInt(count1) + parseInt(count));
          let tempTitleCount = "categories[0].count";
          that.setData({
            titleDSLCount: total_count,
          });
          setTimeout(() => {
            that.setData({
              [tempTitleCount]: that.data.titleDSLCount,
            });
          }, 200);
        }
      },
    });
  },
  /** 搜索 -- title 已接单列表 -- 的总数量 */
  SearchTitleSLCount: function (providerid, serverIp) {
    var that = this;
    var start_time = that.data.date;
    var end_time = that.data.date1;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let count1 = that.data.titleSLCount;
        if (res.data.status == 1) {
          let count = res.data.result.ResultData[0]["count"];
          let total_count = Number(parseInt(count1) + parseInt(count));
          let tempTitleCount = "categories[1].count";
          that.setData({
            titleSLCount: total_count,
          });
          setTimeout(() => {
            that.setData({
              [tempTitleCount]: that.data.titleSLCount,
            });
          }, 200);
        }
      },
    });
  },
  /** 搜索 -- title  全部订单列表 -- 的总数量  */
  SearchTitleCount: function (providerid, serverIp) {
    var that = this;
    var start_time = that.data.date;
    var end_time = that.data.date1;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_AllManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let count1 = that.data.titleCount;
        if (res.data.status == 1) {
          let count = res.data.result.ResultData[0]["POQTY"];
          let total_count = Number(parseInt(count1) + parseInt(count));
          let tempTitleCount = "categories[2].count";
          that.setData({
            titleCount: total_count,
          });
          setTimeout(() => {
            that.setData({
              [tempTitleCount]: that.data.titleCount,
            });
          }, 200);
        }
      },
    });
  },

  /** 返回 -- 待接单列表 -- 的总数量  */
  searchTotalCountReturnDSL: function () {
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
        "Wp_ProManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            daisongliaocount101: res.data.result.ResultData[0]["count"],
          });
        }

        // console.log("order-list:返回的总数量", that.data.daisongliaocount101);
      },
    });
  },
  /** 返回 -- 已接单列表 -- 的总数量  */
  searchTotalCountReturnSL: function () {
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
        "Wp_ManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            songliaocount101: res.data.result.ResultData[0]["count"],
          });
        }

        // console.log("order-list:返回的总数量", that.data.songliaocount101);
      },
    });
  },
  /** 返回 -- 全部订单列表 -- 的总数量   */
  searchTotalCount: function () {
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
        "Wp_AllManagementOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ManagementOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            tatolListCount: res.data.result.ResultData[0]["POQTY"],
          });
        }

        // console.log("order-list:返回的总数量", that.data.songliaocount101);
      },
    });
  },

  /** =======================  时间选择器  开始  ================================ */
  // 年  月  日
  changeDate(e) {
    var that = this;
    // var start_time = that.data.date;
    // var end_time = that.data.date1;
    // // 将标准时间  准换成  时间戳
    // var timestamp = new Date(start_time).getTime();
    // var timestamp1 = new Date(end_time).getTime();
    // var timestamp2 = timestamp - timestamp1;
    let tempOldDate = e.detail.value
    that.setData({ date: tempOldDate.replace(/-/g, '/') });
    that.setData({
      pageidx: "1",
      titleDSLCount: 0, // 待送料
      titleSLCount: 0, // 已送料
      titleCount: 0, // 全部
    });
    // if (timestamp2 > 0) {
    //   wx.showModal({
    //     title: "警告",
    //     content: "开始时间不能大于结束时间!",
    //     success(res) {
    //       if (res.confirm) {
    //         // console.log('用户点击确定')
    //       } else if (res.cancel) {
    //         // console.log('用户点击取消')
    //       }
    //     },
    //   });
    // }
    // if (timestamp2 < 0) {
    // 列表
    this.searchTofeedList();
    this.searchPayofList();
    this.searchTatolList();
    // 数量
    this.searchTotalCountReturnDSL();
    this.searchTotalCountReturnSL();
    this.searchTotalCount();

    // }
    //  根据日期选择  获得title的数量
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
            setTimeout(() => {
              that.SearchTitleDSLCount(item.providerid, item.server_ip);
              that.SearchTitleSLCount(item.providerid, item.server_ip);
              that.SearchTitleCount(item.providerid, item.server_ip);
            }, 500);
          });
        }
      },
    });
  },
  changeDate1(e) {
    var that = this;
    // var start_time = that.data.date;
    // var end_time = that.data.date1;
    // // 将标准时间  准换成  时间戳
    // var timestamp = new Date(start_time).getTime();
    // var timestamp1 = new Date(end_time).getTime();
    // var timestamp2 = timestamp - timestamp1;
    let tempOldDate = e.detail.value
    that.setData({ date1: tempOldDate.replace(/-/g, '/') });
    that.setData({
      pageidx: "1",
      titleDSLCount: 0, // 待送料
      titleSLCount: 0, // 已送料
      titleCount: 0, // 全部
    });
    // if (timestamp2 > 0) {
    //   wx.showModal({
    //     title: "警告",
    //     content: "开始时间不能大于结束时间!",
    //     success(res) {
    //       if (res.confirm) {
    //         // console.log('用户点击确定')
    //       } else if (res.cancel) {
    //         // console.log('用户点击取消')
    //       }
    //     },
    //   });
    // }
    // if (timestamp2 < 0) {
    // 列表
    this.searchTofeedList();
    this.searchPayofList();
    this.searchTatolList();
    // 数量
    this.searchTotalCountReturnDSL();
    this.searchTotalCountReturnSL();
    this.searchTotalCount();

    // }

    //  根据日期选择  获得title的数量
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
            setTimeout(() => {
              that.SearchTitleDSLCount(item.providerid, item.server_ip);
              that.SearchTitleSLCount(item.providerid, item.server_ip);
              that.SearchTitleCount(item.providerid, item.server_ip);
            }, 500);
          });
        }
      },
    });
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
    // console.log("年  月  日  时  分  秒 ==== 结束时间", e);
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
  /** =======================  时间选择器 结束  ================================ */

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
    // console.log("触底请求", typeof that.data.pageidx, that.data.pageidx);

    this.getTofeedList();
    this.getPayofList();
    this.getTatolList();


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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  goToSearchStore: function () {
    var that = this;
    wx.navigateTo({
      url:
        "/pages/search_store/search_store?goto1=2&store_id=" +
        that.data.store_id,
    });
  },
  onUnload: function (e) {
    wx.navigateBack({
      delta: 2, // 返回上一级页面。
    });
  },
});
