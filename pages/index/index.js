//index.js
//获取应用实例
const app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../utils/common.js");
var base64 = require("../../utils/base64");
import websocket from "./../../utils/wechat-websocket.js";
Page({
  data: {
    rul: setting.url,
    defaultImage: "../../images/defaultcompany.png",
    authUserList: null, // 获取用户 供应商的list

    serveripList: null, // server_ip
    server_ip1: "", // 请求的链接 1

    storeidList: null, // store_id
    store_id1: "", // 客户id 1

    provideridList: null, // 用户私有 的 providerid
    providerid1: "", // providerid

    store_nameList: null, // 用户名称列表
    store_name1: "", // 用户名称列表中的第一个

    Y: "", // 年
    M: "", // 月
    D: "", // 日
    h: "", // 时
    m: "", // 分
    s: "", // 秒

    pageidx: "1",

    daisongliaoListCount: 0, // 待送料列表的长度
    transportation_materials_count: 0,
    invite_str: null, // 邀请用户
    scene: 0,
    userinfo: null,
    websocketUrl: "wss://cloudpf.weunit.cn:9504",

    // isNewOpen: true, //判断当前页面是新打开还是从其他页面返回
  },
  /**
   * 获取参数
   * @param e
   */
  onload: function (options) {
    var that = this;
  },
    getForeverLoginInfo(){
      var that = this;
       var tempUserId = wx.getStorageSync("tempUserId");
       var tempPassword = wx.getStorageSync("tempPassword");
       request.post("user/getForeverLoginInfo", {
               data: {
                   user_id: tempUserId,
                   password: tempPassword,
               },
               success:(res)=>{
                   if(res.data.status == 1){

                       wx.setStorageSync("isAuth", true);
                       app.globalData.userInfo = res.data.result;
                       app.globalData.userInfo.head_pic = common.getFullUrl(
                           app.globalData.userInfo.head_pic
                       );
                       typeof cb == "function" && cb(app.globalData.userInfo, app.globalData.wechatUser);
                   }
   }
   });
   },
  sendwebsoket() {
    let data = {
      type_id: "0",
      type_group: "TransportationMaterials",
      url: "http://cloudpf.weunit.cn/cloudpf",
      user_id: 141773,
      store_id: 14,
      providerid: "7073",
      json_data: JSON.stringify([
        { key: "您有新的采购单需要审批", value: "PO2004-0095" },
      ]),
    };

    var login_data = { type: "push_TransportationMaterials", result: data };
    wx.sendSocketMessage({
      // 这里是第一次建立连接所发送的信息，应由前后端商量后决定
      data: JSON.stringify(login_data),
    });

    // websocket 发送待审核的信息。
  },

  /* 生命周期函数--监听页面加载 */
  onShow: function (opions) {
 
    var that = this;

    

    // 当前所在页面
    let pages = getCurrentPages();
    // 数组中索引最大的页面--当前页面
    let currentPage = pages[pages.length - 1];
    // 打印出当前页面中的 options 只有扫描二维码才赋值

    wx.getStorage({
      key: "scene",
      success(res) {
        that.setData({
          scene: res.data,
        });
        if (
          currentPage.options &&
          currentPage.options.scene &&
          (that.data.scene == 1047 ||
            that.data.scene == 1048 ||
            that.data.scene == 1049)
        ) {
          wx.setStorage({
            key: "invite_str",
            data: currentPage.options.scene,
          });
        }
      },
    });
    //如果是待确认的单则跳转待确认页面,通过currentPage.options.poid获取页面传入的poid

    //如果是待确认的单则跳转待确认页面
    var timpdate = new Date();
    that.data.Y = timpdate.getFullYear() + "-"; // 年
    that.data.M =
      (timpdate.getMonth() + 1 < 10
        ? "0" + (timpdate.getMonth() + 1)
        : timpdate.getMonth() + 1) + "-"; // 月
    that.data.D = timpdate.getDate() + " "; // 日
    that.data.h = timpdate.getHours() + ":"; // 时
    that.data.m = timpdate.getMinutes() + ":"; // 分
    that.data.s = timpdate.getSeconds(); // 秒
    setTimeout(() => {
      // 获取用户
      this.getClientInfo();
    }, 200);
  },

  // /** websoket 初始化 */
  // websoketinit(userinfo) {
  //   var that = this;
  //   //如果有值则获取数量
  //   if (userinfo) {
  //     // 创建websocket对象
  //     this.websocket = new websocket({
  //       // true代表启用心跳检测和断线重连
  //       heartCheck: true,
  //       isReconnection: true,
  //       userInfo: userinfo,
  //     });
  //     // // 建立连接
  //     this.linkWebsocket();
  //     // 监听websocket状态
  //     this.websocket.onSocketClosed({
  //       url: that.data.websocketUrl,
  //       success(res) {
  //         console.log(res);
  //       },
  //       fail(err) {
  //         console.log(err);
  //       },
  //     });
  //     // 监听网络变化
  //     this.websocket.onNetworkChange({
  //       url: that.data.websocketUrl,
  //       success(res) {
  //         console.log(res);
  //       },
  //       fail(err) {
  //         console.log(err);
  //       },
  //     });
  //     //监听服务器返回
  //     //websoket接收到的内容
  //     this.websocket.onReceivedMsg((result) => {
  //       let data = JSON.parse(result.data);
  //       that.setData({
  //         transportation_materials_count:
  //           data.data.transportation_materials_count,
  //       });
  //     });
  //     //websoket接收到的内容
  //   }
  // },
  // /** 连接 websoket */
  // linkWebsocket() {
  //   // 建立连接
  //   var that = this;
  //   this.websocket.initWebSocket({
  //     url: that.data.websocketUrl,
  //     success(res) {
  //       console.log(res);
  //     },
  //     fail(err) {
  //       console.log(err);
  //     },
  //   });
  // },
  /** 请求信息 */
  requestMsg() {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: ["BZuIBrF05QJBwqbAhLItT9_qjnku6HdQ6RhZYpiwlho"],
        success: (res) => {
          if (res["BZuIBrF05QJBwqbAhLItT9_qjnku6HdQ6RhZYpiwlho"] === "accept") {
            wx.showToast({
              title: "订阅成功！",
              duration: 1000,
              success(data) {
                //成功
                resolve();
                //调用推送方法
                that.pushOrderMsg();
              },
            });
          }
        },
        fail(err) {
          //失败
          console.error(err);
          reject();
        },
      });
    });
  },
  // 推送订单通知
  pushOrderMsg: function () {
    var that = this;
    let data = {
      oauth: "miniapp",
      miniprogram_state: "developer",
    };
    if (app.globalData.userInfo) {
      data,
        request.post2("Songliao/pushOrderMsg", {
          success: function (res) {
            if (res.data.status == 1) {
              wx.showToast({
                title: "订阅成功！",
                duration: 1000,
                success(data) {},
              });
            }
          },
        });
    }
  },

  // 获取用户
  getClientInfo: function () {
    var that = this;
    wx.getStorage({
      key: "invite_str",
      success(res) {
        that.setData({
          invite_str: res.data,
        });
      },
    });
    if (app.globalData.userInfo) {
      //有授权信息
      if (that.data.invite_str) {
        that.bindInviteUser();
        that.bindUserAuth();
      } else {
        that.bindUserAuth();
      }
    } else {
      //没有授权信息
        that.getForeverLoginInfo();
        if (app.globalData.userInfo) {
            //有授权信息
            if (that.data.invite_str) {
                that.bindInviteUser();
                that.bindUserAuth();
            } else {
                that.bindUserAuth();
            }
        }else{
            app.getUserInfo(function (userInfo) {
                app.globalData.userInfo = userInfo;
                app.globalData.userInfo.head_pic = common.getFullUrl(
                    app.globalData.userInfo.head_pic
                );
                typeof cb == "function" &&
                cb(app.globalData.userInfo, app.globalData.wechatUser);
                if (that.data.invite_str) {
                    that.bindInviteUser();
                    that.bindUserAuth();
                } else {
                    that.bindUserAuth();
                }
            }, true);
        }
    }
  },
  //会员绑定,用户扫码后会员绑定，绑定后更新权限信息
  bindInviteUser: function () {
    //跳转相关页面
    var that = this;

    if (that.data.invite_str) {
      let data = {
        data: that.data.invite_str,
      };
      request.post("Songliao/bindInviteUserNew", {
        data,
        success: function (res) {
          if (res.data.status == 1) {
            wx.setStorage({
              key: "invite_str",
              data: null,
            });
            that.setData({ invite_str: null });
            wx.setStorage({
              key: "scene",
              data: 0,
            });
            that.setData({ scene: 0 });
          }
        },
      });
    }
  },
  //请求授权接口
  bindUserAuth: function () {
    var that = this;
    request.post("User/getUserAuth", {
      success: function (res) {
        let auList = res.data.result;
        if (res.data.status == 1) {
          if (res.data.result) {
            that.setData({
              authUserList: res.data.result,
            });
          }
        }
        // 将server_ip 单独拿出来
        let timpServ = []; // 临时存放 server_ip 的数组
        // 将store_id 单独拿出来
        let timpStoreid = []; // 临时存放 store_id 的数组
        // 将 providerid 单独拿出来
        let timpProviderid = []; // 临时存放 providerid 的数组
        // 将 store_name 单独拿出来
        let timpstore_name = []; // 临时存放 store_id 的数组
        if (that.data.authUserList) {
          that.setData({
            daisongliaoListCount: 0,
          });
          if (auList) {
            auList.forEach(function (item, index) {
              timpServ.push(item.server_ip);
              that.setData({ serveripList: timpServ });
              that.setData({ server_ip1: timpServ[0] });
              // 本地存储 server_ip
              wx.setStorage({
                key: "server_ip1",
                data: that.data.server_ip1,
              });

              //store_id
              timpStoreid.push(item.store_id);
              that.setData({ storeidList: timpStoreid });
              // console.log("获取不同的请求连接777", that.data.storeidList);
              that.setData({ store_id1: timpStoreid[0] });
              // 本地存储 server_ip
              wx.setStorage({
                key: "store_id1",
                data: that.data.store_id1,
              });
              //providerid1
              timpProviderid.push(item.providerid);
              that.setData({ provideridList: timpProviderid });
              that.setData({ providerid1: timpProviderid[0] });

              wx.setStorage({
                key: "providerid1",
                data: that.data.providerid1,
              });
              timpstore_name.push(item.store_name);
              that.setData({ store_nameList: timpstore_name });
              that.setData({ store_name1: timpstore_name[0] });
              // 本地存储 server_ip
              wx.setStorage({
                key: "store_name1",
                data: that.data.store_name1,
              });
              //查询总数量
              // setTimeout(() => {
              //     that.getTofeedListCount(item); // item 传入一次执行一次
              // }, 500);
            });
          }
        }
        //调用websoket方法
        // that.websoketinit(res.data.userinfo);
        //调用websoket方法
      },
    });
  },
  // 送料管理 ----> 送料管理  order_list
  bindViewTap: function () {
    var that = this;
    wx.navigateTo({
      url:
        "/pages/order-list/order-list?providerid=" +
        that.data.providerid1 +
        "&server_ip=" +
        that.data.server_ip1 +
        "&store_id=" +
        that.data.store_id1 +
        "&store_name=" +
        that.data.store_name1,
    });
  },

  // 订单通知 ----> 送料管理  order_list
  bindPushOrder: function () {
    var that = this;
    wx.navigateTo({
      url:
        "/pages/order_management/order_management?providerid=" +
        that.data.providerid1 +
        "&server_ip=" +
        that.data.server_ip1 +
        "&store_id=" +
        that.data.store_id1 +
        "&store_name=" +
        that.data.store_name1,
    });
  },

  /** 获取 --- 待送料列表  */
  getTofeedListCount(data) {
    console.log('断线重连设置');
    var that = this;
    var homePage = that.data.pageidx;
    var start_time = that.data.Y + that.data.M + (that.data.D - 6);
    var end_time = that.data.Y + that.data.M + that.data.D;
    var providerid = data.providerid;
    var serverIp = data.server_ip;
    var requestUrl = "Forward/postApi";
    var params = base64.encode(
      "{" +
        '"' +
        "modelson" +
        '"' +
        ":" +
        '"' +
        "Wp_ProShipmentsOrder" +
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
        req_url: "http://" + serverIp,
        req_api: "/ross/post/ReceiveMain",
        req_param_action: "inif_ProShipmentsOrderCount:CALL",
        req_param_paramet: params,
      },
      success: function (res) {
        let count1 = that.data.daisongliaoListCount;
        if (res.data.status == 1) {
          let count = res.data.result.ResultData[0]["count"];
          let total_count = Number(parseInt(count1) + parseInt(count));
          that.setData({
            daisongliaoListCount: total_count,
          });
          // console.log('首页--总数',item);
        }
      },
    });
  },

});
