//地区区域弹框选择类
class Regions {
    /**
     * 加载指定区域的下级数据
     * options 对象，包含属性和方法如下：
     *   selectCall(e, parentId, regionName, address): 点击区域时候的回调
     *   endAreaLevel： 终止的第几级区域，默认最后一级（刚开始是第1级）
     *   endAreaLevelCall(parentId, regionName, address):  指定终止区域的回调函数
     */
    constructor(page, dataName, options) {
        this.page = page;
        this.options = options;
        this.address = {}, //address对象
        this.currentArea = 0;
        var that = this;
        this.page.openRegionsModal = function (e) {
            that.openRegionsModal(e);
        }
        this.page.closeRegionsModal = function () {
            that.closeRegionsModal();
        }
        this.dataName = dataName;
        this.page.setData({
            [dataName]: {}
        });
    }

    openRegionsModal(e) {
        var that = this;
        var parentId = e.currentTarget.dataset.id;
        var name = e.currentTarget.dataset.name;
        if (isNaN(parseInt(parentId)) || !parseInt(parentId)) {
            parentId = 0;
            this.currentArea = 0;
        } else {
            if (this.currentArea == 0) {
                this.address.province_name = name;
                this.address.province = parentId;
                this.address.city_name = '';
                this.address.city = 0;
                this.address.district_name = '';
                this.address.district = 0;
                this.address.twon_name = '';
                this.address.twon = 0;
            } else if (this.currentArea == 1) {
                this.address.city_name = name;
                this.address.city = parentId;
            } else if (this.currentArea == 2) {
                this.address.district_name = name;
                this.address.district = parentId;
            } else if (this.currentArea == 3) {
                this.address.twon_name = name;
                this.address.twon = parentId;
            }
            this.currentArea++;
        }
        if (typeof this.options.selectCall == 'function') {
            this.options.selectCall(e, parentId, name, this.address);
        }
        //结束的回调
        if (this.currentArea === this.options.endAreaLevel) {
            this.endCall(parentId, name);
            return;
        }
        getApp().request.get('index/get_region', {
            data: { parent_id: parentId },
            success: function (res) {
                if (res.data.result && res.data.result.length > 0) {
                    that.page.setData({
                        [that.dataName]: {
                            regions: res.data.result,
                            showRegionsModal: true
                        }
                    });
                } else {
                    that.endCall(parentId, name);
                }
            }
        });
    }

    closeRegionsModal () {
        this.page.setData({
            [this.dataName]: {
                showCategoryModal: false 
            }
        });
    }

    endCall(parentId, name) {
        this.closeRegionsModal();
        if (typeof this.options.endAreaLevelCall == 'function') {
            this.options.endAreaLevelCall(parentId, name, this.address);
        }
    }

}

export default Regions;