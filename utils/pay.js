var app = getApp();
var request = app.request;

/** 微信支付 */
module.exports = {
    url: 'wxpay/dopay?trade_type=JSAPI',

    /** 充值接口 */
    rechange: function (money, success, failcb) {
        var that = this;
        request.post(this.url, {
            data: { account: money },
            success: function (res) {
                that.weixinPay(res.data.result, success, failcb);
            },
            fail: function() {
                typeof failcb == 'function' && failcb();
            },
            failStatus: function () {
                typeof failcb == 'function' && failcb();
            }
        });
    },

    /** 付款接口 */
    pay: function (orderSn, success, failcb) {
        var that = this;
        request.post(this.url, {
            data: { order_sn: orderSn },
            success: function (res) {
              //noncestr为null
            //   console.log("res");
            //   console.log(res);
              that.weixinPay(res.data.result, success, failcb);
            },
            fail: function () {
                typeof failcb == 'function' && failcb();
            },
            failStatus: function () {
                typeof failcb == 'function' && failcb();
            }
        });
    },


    /** 小程序内部支付接口 */
    weixinPay: function (param, success, failcb) {
        wx.requestPayment({
            timeStamp: String(param.timeStamp),
            nonceStr: param.nonceStr,//undefined
            package: param.package,
            signType: param.signType,//undefined
            paySign: param.sign,
            success: function (res) {
                // console.log(res);
                app.showSuccess('支付成功！', success);
            },
            fail: function (res) {
                // console.log(res);
                if (res.errMsg == 'requestPayment:fail') {
                    app.showWarning('支付失败');
                } else if (res.errMsg == 'requestPayment:fail cancel') {
                    app.showWarning('您已取消支付');
                } else {
                    // app.showWarning('支付失败：' + res.errMsg.substr('requestPayment:fail '.length));
                  app.showWarning("555");
                }
                typeof failcb == 'function' && failcb();
            },
        });
    }
}