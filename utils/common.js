var util = require('util.js');

/** 通用函数：这里放的是与系统配置和变量相关的函数 */
module.exports = {
    app: function () {
        return getApp();
    },

    getFullUrl: function (url) {
        if (!url || url.indexOf('http') == 0 || url.indexOf('www') == 0) {
            return url;
        }
        return this.app().globalData.setting.url + url;
    },

    /** 获取配置值，在app.getConfig回调中使用 */
    getConfigByName: function(config, name, type) {
        for (var i = 0; i < config.length; i++) {
            if (config[i].name === name && (typeof type == 'undefined' || (typeof type != 'undefined' && config[i].inc_type === type))) {
                return config[i].value;
            }
        }
        // console.warn(name);
        // console.warn(config);
        return null;
    },

    getCapache: function () {
        return this.app().request.modifyUrl('user/verify?is_image=1&t=' + (Date.parse(new Date)));
    },

    /** 跳到cart4页面 */
    jumpToCart4: function(order, isRedirect) {
        var params = {
            order_sn: order.order_sn,
            order_amount: order.order_amount,
        };
  
        if (order.master_order_sn) {
            params.master_order_sn = order.master_order_sn;
        } 
        params.is_virtual = order.is_virtual;
        var url = '/pages/cart/cart4/cart4?' + util.Obj2Str(params);
        if (isRedirect) {
            wx.redirectTo({ url: url });
        } else {
            wx.navigateTo({ url: url });
        }
    },

    /** 获取店铺评价 */
    getStoreScoreDecs: function (score) {
        score = parseFloat(score);
        var dec = '低';
        if (score >= 4 || score == 0) {
            dec = '高';
        } else if (score >= 3 && score < 4) {
            dec = '中';
        }
        return dec;
    },

    //网页中的图片加上域名
    wxParseAddFullImageUrl: function (page, contentStr) {
        if (typeof page.data[contentStr].images != 'undefined') {
            var content = page.data[contentStr];
            for (var i = 0; i < content.images.length; i++) {
                content.images[i].attr.src = this.getFullUrl(content.images[i].attr.src);
                content.imageUrls[i] = this.getFullUrl(content.imageUrls[i]);
            }
            // console.log(content);
            page.setData({ [contentStr]: content });
        }
    },

    /** 发送短信验证码 */
    sendSmsCode: function (mobile, scene, cb) {
        var that = this;
        if (mobile == "") {
            return that.app().showWarning('手机号码不能为空');
        }
        if (typeof scene == 'undefined' || scene === null) {
            scene = 6; //身份验证
        }
        var that = this;
        this.app().request.post('user/send_sms', {
            data: {
                mobile: mobile,
                scene: scene,
                type: 'mobile',
            },
            success: function (res) {
                // that.app().showSuccess('发送成功，请注意查收');
                typeof cb == 'function' && cb();
                that.app().confirmBox(res.data.msg);
            }
        });
    }

};