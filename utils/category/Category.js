//商品筛选区域弹框选择类
class Category {
    /**
     * 加载指定区域的下级数据
     * options 对象，包含属性和方法如下：
     * endCall(parentId, regionName, address): 类目选完的回调函数
     */
    constructor(page, dataName, options) {
        this.page = page;
        this.options = options;
        this.category = {}, //category数据
        this.currentArea = 0;
        this.select = [];
        var that = this;
        this.page.openCategoryModal = function (e) {
            that.openCategoryModal(e);
        }
        this.page.closeCategoryModal = function () {
            that.closeCategoryModal();
        }
        this.page.categoryCheckboxChange = function (e) {
            that.categoryCheckboxChange(e);
        }
        this.dataName = dataName;
        this.page.setData({
            [dataName]: {}
        });
    }

    openCategoryModal(e) {
        var that = this;
        // console.log(e.currentTarget.dataset);
        var type = e.currentTarget.dataset.type
        var parentId = e.currentTarget.dataset.id;
        var name = e.currentTarget.dataset.name;
        if (type != 'confirm' && (isNaN(parseInt(parentId)) || !parseInt(parentId))) {
            parentId = 0;
            this.currentArea = 0;
            this.page.setData({ [that.dataName + '.currentArea']: this.currentArea });
        } else {
            if (this.currentArea == 0) {
                this.category.category1_name = name;
                this.category.category1 = parentId;
                this.category.category2_name = '';
                this.category.category2 = 0;
                this.category.category3_name = '';
                this.category.category3 = 0;
            } else if (this.currentArea == 1) {
                this.category.category2_name = name;
                this.category.category2 = parentId;
            } else if (this.currentArea == 2) {
                var select;
                var ids = [];
                var names = [];
                for (var i = 0; i < this.select.length; i++) {
                    select = this.select[i].split(',', 2);
                    ids.push(select[0]);
                    names.push(select[1]);
                }
                this.category.category3_name = names.join(',');
                this.category.category3 = ids.join(',');
            }
            this.page.setData({ [that.dataName + '.currentArea']: ++this.currentArea });
        }
        if (this.currentArea === 3) {
            return this.endCall();
        }
        getApp().request.get('goods/goodsCategoryList', {
            data: { parent_id: parentId },
            success: function (res) {
                if (res.data.result && res.data.result.length > 0) {
                    that.page.setData({
                        [that.dataName]: {
                            categories: res.data.result,
                            showCategoryModal: true,
                            currentArea: that.currentArea
                        }
                    });
                } else {
                    that.endCall();
                }
            }
        });
    }

    closeCategoryModal() {
        this.page.setData({
            [this.dataName]: {
                showCategoryModal: false,
                currentArea: 0,
            }
        });
    }

    endCall() {
        this.closeCategoryModal();
        if (typeof this.options.endCall == 'function') {
            this.options.endCall(this.category);
        }
    }

    categoryCheckboxChange(e) {
        this.select = e.detail.value;
    }

}

export default Category;