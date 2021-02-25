/** 选择多张图片 */
module.exports = {
    /** 
     * 选择多张/单张图片 
     * filePaths:图片路径数组
     * idx: 选中的当前图片数组的下标
     * call(filePaths): 返回操作后端图片路径数组
     */
    selectPhotos: function (filePaths, idx, call) {
        var that = this;
        if (typeof filePaths[idx] != 'undefined') {
            //更改一张图片
            wx.chooseImage({
                count: 1, //最多1张图片
                sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['camera', 'album'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    filePaths[idx] = res.tempFilePaths[0];
                    call(filePaths);
                }
            });
            return;
        }
        //选择多张图片
        var remainNum = 5 - filePaths.length;
        if (remainNum > 0) {
            wx.chooseImage({
                count: remainNum, //可选择剩余的张数
                sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['camera', 'album'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    filePaths = filePaths.concat(res.tempFilePaths);
                    call(filePaths);
                }
            });
        }
    },

    /** 
     * 删除单张图片 
     * filePaths:图片路径数组
     * idx: 选中的当前图片数组的下标
     * call(filePaths): 返回操作后端图片路径数组
     */
    removePhoto: function (filePaths, idx, call) {
        if (typeof filePaths[idx] == 'undefined') {
            call(filePaths);
            return;
        }
        var that = this;
        wx.showModal({
            title: '确定删除该图片？',
            success: function (res) {
                if (res.confirm) {
                    filePaths.splice(idx, 1);
                    call(filePaths);
                }
            }
        })
    },

};
