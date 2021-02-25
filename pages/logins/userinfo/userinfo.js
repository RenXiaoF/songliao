// pages/logins/userinfo/userinfo.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../../utils/common.js");

Page({
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    defaultAvatar: "../../../images/user.jpg",
    user: null,
    userData: null
  },

  // onShow: function() {
  onShow: function() {
    var that = this;
    if (!app.globalData.userInfo) {
      // console.log('222');
      app.getUserInfo(function(userInfo) {
        that.setData({
          user: userInfo
        });
      }, true);
    } else {
      that.setData({
        user: app.globalData.userInfo
      });
    }
    // 获取用户信息
    this.getUserData();
  },
  /** 获取用户信息 */
  getUserData: function() {
    var that = this;
    app.request.post("user/userinfo",{
      success: function(res) {
        if(res.data.status == 1){
          that.setData({
            userData:res.data.result
          })
        }else{
            that.setData({
                userData:app.globalData.userInfo
            })
        }
      }
    })
  },
  /** 编辑用户信息 */
  editUserInfo: function(e) {
    var type = e.currentTarget.dataset.type;
    if ((type == "password" || type == "paypwd") && !this.data.user.mobile) {
      return app.showWarning("请先绑定手机号码");
    }
    if (type && this.data.user) {
      wx.navigateTo({
        url: `/pages/user/userinfo_edit/userinfo_edit?type=${type}`
      });
    }
  },
  /** 换头像 */
  changeAvatar: function() {
    var that = this;
    wx.chooseImage({
      count: 1, //最多1张图片,默认9
      sizeType: ["compressed", "original"], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ["camera", "album"], //可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        request.uploadFile(that.data.url + "user/upload_headpic", {
          filePath: res.tempFilePaths[0],
          name: "head_pic",
          success: function(res) {
            var headPic = common.getFullUrl(res.data.result);
            that.setData({
              ["user.head_pic"]: headPic
            });
            app.globalData.userInfo.head_pic = headPic;
            app.showSuccess("设置头像成功");
          }
        });
      }
    });
  },

  /** 清除授权 */
  // clearAuth: function() {
  //   app.request.post("user/logout", {
  //     isShowLoading: false,
  //     data: {
  //       token: app.request.getToken(),
  //       oauth: "miniapp"
  //     },
  //     success: function(res) {
  //       app.globalData.userInfo = null;
  //       if (res.data.status == 1) {
  //         wx.navigateTo({
  //           url: "/pages/logs/logs"
  //         });
  //       }
  //     },
  //     failStatus: function() {
  //       return false;
  //     }
  //   });
  // },

  /** 去到用户注册 */
  gotoRegister: function() {
    wx.navigateTo({
      // url: "/pages/telcode_register/telcode_register"
      url: "/pages/yly_user_zhc/yly_user_zhc"
    });
  },
  /** 去到企业入驻 */
  gotoEnterprises: function() {
    wx.navigateTo({
      url: "/pages/push-msg/push-msg"
    });
  },
  /** 去到个人信息 */
  gotoPersonalDetail: function() {
    wx.navigateTo({
      url: "/pages/single_user_list/single_user_list"
    });
  },
  /** 去到 我的上级二维码 */
  gotoMyQRCode: function() {
    wx.navigateTo({
      url: "/pages/my_qrcode/my_qrcode"
    });
  }
});
