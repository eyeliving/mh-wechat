//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var that = this;
    var _index = e.currentTarget.dataset.index;
    var _data = that.data.addressList[_index];
    _data.is_default = 1;
    wx.request({
      url: app.globalData.domains + '/User/ModifyUserCartAddress',
      data: _data,
      success: (res) =>{
        wx.navigateBack({})
      }
    })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  
  onLoad: function () {

  },
  onShow : function () {
    this.initShippingAddress();
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.domains + '/User/GetUserCartAddress',
      data: {
        rd_session: app.globalData.rd_session
      },
      success: (res) =>{
        var r = res.data;
        if (r.ack == "success") {
          that.setData({
            addressList:r.data
          });
        }
      }
    })
  }

})
