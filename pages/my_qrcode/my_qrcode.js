// pages/my_qrcode/my_qrcode.js

var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../utils/common.js");
var base64 = require("../../utils/base64");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    img: "",
    msg: "正在获取图片...",
    statac: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取二维码
    this.get_my_qrcode();
  },

  /**获取二维码 */
  get_my_qrcode: function () {
    var that = this;
    var requestUrl = "Songliao/get_tgimgnew";
    request.get(requestUrl, {
      data: {
        oauth: "miniapp",
        page: "",
        act_type: "1",
        width: "10",
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            statac: 1,
            img: res.data.result,
          });
        } else if (res.data.status == 0) {
          that.setData({
            statac: 0,
            msg: "获取失败,请重新获取!",
          });
        }
      },
    });
  },
  // 保存海报 -- 方法 一
  SaveImg:function() {
    var that = this;
   
    wx.showLoading({
      title: '保存中...'
    })
    wx.downloadFile({
      url: that.data.img,
      success: function (res) {
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '您的推广海报已存入手机相册，赶快分享给好友吧',
              showCancel:false,
            })
          },
          fail: function (err) {
            if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                showCancel: false,
                success:modalSuccess=>{
                  wx.openSetting({
                    success(settingdata) {
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限成功,再次点击图片即可保存',
                          showCancel: false,
                        })
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限失败，将无法保存到相册哦~',
                          showCancel: false,
                        })
                      }
                    },
                    fail(failData) {
                      // console.log("failData",failData)
                    },
                    complete(finishData) {
                      // console.log("finishData", finishData)
                    }
                  })
                }
              })
            }
          },
          complete(res) {
            wx.hideLoading()
          }
        })
      }
    })
  },
  // 1. 长按保存图片 方法 二
  saveImg: function (e) {
    var that = this;
    // let url = e.currentTarget.dataset.url;
    let url = that.data.img;

    //用户需要授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting["scope.writePhotosAlbum"]) {
          wx.authorize({
            scope: "scope.writePhotosAlbum",
            success: () => {
              // 同意授权
              this.saveImg1(url);
            },
            fail: (res) => {
              // console.log(res);
            },
          });
        } else {
          // 已经授权了
          this.saveImg1(url);
        }
      },
      fail: (res) => {
        // console.log(res);
      },
    });
  },
  // 2. 长按保存图片
  saveImg1: function (url) {
    wx.getImageInfo({
      src: url,
      success: (res) => {
        let path = res.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: (res) => {
            // console.log(res);
          },
          fail: (res) => {
            // console.log(res);
          },
        });
      },
      fail: (res) => {
        // console.log(res);
      },
    });
  },
});
