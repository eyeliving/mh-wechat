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
    _data.rd_session=app.globalData.rd_session;

    var _data1 = {
      id: _data.id,
      rd_session: app.globalData.rd_session,
      province: _data.cart_province,
      city: _data.cart_city,
      district: _data.cart_district,
      consignee: _data.cart_consignee,
      address: _data.cart_address,
      mobile: _data.cart_mobile,
      is_default: '1'
    };
    wx.request({
      url: app.globalData.domains + '/User/ModifyUserCartAddress',
      data: _data1,
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
