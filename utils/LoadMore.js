var app = getApp();
var request = app.request;

/**
 * 用来增量请求页面数据
 */
class LoadMore {
    constructor() {
        this.data = {
            page: null, //依附的页面
            listName: '',
            resultName: '',
            resultListName: '',
            scrollTimeStamp: 0, //事件时间戳，用于去动
            goodsLoadFinishFlag: false, //加载完成标志
            goodsLoading: false //正在加载中标志
        }
    }

    /**
     * onload中调用：用于初始化加载相关配置
     * page:闯入当前页面，一般用this
     * listName：请求的结果result中列表数据所在的属性名或键值
     * resultName：保存在page页面data中请求数据result所在的属性名
     * resultListName：保存在page data中resultName中的列表数据的属性名，不填与listName一致
     */
    init(page, listName, resultName, resultListName) {
        this.data.scrollTimeStamp = 0;
        this.data.page = page;
        this.data.listName = listName;
        this.data.resultName = resultName;
        this.data.resultListName = (resultListName == undefined) ? listName : resultListName;
        this.data.goodsLoadFinishFlag = false;
        this.data.goodsLoading = false;
    }

    /**
     * 请求并更新列表数据
     */
    request(url, success, fail) {
        var that = this;
        if (that.data.goodsLoading) {
            //还在请求中
            return false;
        } else {
            that.data.goodsLoading = true;
        }
        request.get(url, {
            success: function (res) {
                var ret = true;
                if (typeof success == 'function') {
                    ret = success(res);
                }
                if (ret === false) {
                    return false;
                }

                // 本次请求，返回的商品列表
                var inList;
                var listName = that.data.listName;
                var resultName = that.data.resultName;
                var resultListName = that.data.resultListName;
                if (listName != '') {
                    inList = res.data.result[listName]; // console.log(inList);debugger;
                } else {
                    inList = res.data.result; //console.log(inList);debugger;
                }

                var hasPreData = false;
                var param = null;
                var page = that.data.page;
                if (page.data[resultName]) {
                    hasPreData = true;
                    var preData = null;
                    if (resultListName != '') {
                        preData = page.data[resultName];
                    } else {
                        preData = page.data[resultName];
                    }
                    [].push.apply(preData, inList);//数组合并
                    // param = page.data[resultName];
                    param = preData;
                } else {
                    param = inList;
                }
                page.setData({
                    [resultName]: param
                });
                if (!inList || inList.length == 0) {
                    that.data.goodsLoadFinishFlag = true;
                    hasPreData && app.showWarning('加载完啦', null, 500, false);
                }
            },
            fail: function (res) {
                var ret = true;
                // console.log(res);
                if (typeof fail == 'function') {
                    ret = fail(res);
                }
                return ret;
            },
            complete: function (res) {
                that.data.goodsLoading = false;
            }
        });
        return true;
    }

    /**
     * 是否可以加载更多数据，加载完成或去抖返回false
     */
    canloadMore() {
        // console.log('loadMore...Finish:', this.data.goodsLoadFinishFlag);
        var that = this;
        if (that.data.goodsLoadFinishFlag) {
            app.showWarning('加载完啦', null, 500, false);
            return false;
        }
        //抖动时间
        var timestamp = (new Date()).getTime();
        // console.log('loadMore...time:', timestamp);
        if (timestamp - that.data.scrollTimeStamp > 300) {
            that.data.scrollTimeStamp = timestamp;
            return true;
        }
        return false;
    }

    /**
     * 重置为未加载完成，数据的重置需要手动重置
     */
    resetConfig() {
        this.data.goodsLoadFinishFlag = false;
    }
}

export default LoadMore;