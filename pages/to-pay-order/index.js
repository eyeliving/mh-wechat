//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    mallName:'',//wx.getStorageSync('mallName')
    goodsList:[],
    isNeedLogistics:1, // 是否需要物流信息
    allGoodsPrice:0,
    yunPrice:0,

    goodsJsonStr:""
  },
  onShow : function () {
    this.initShippingAddress();
  },
  onLoad: function (e) {
    var that = this;
    var shopList = [];
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    if (shopCarInfoMem && shopCarInfoMem.shopList) {
      shopList = shopCarInfoMem.shopList
    }
    //var isNeedLogistics = 0;
    var allGoodsPrice = 0;

    var goodsJsonStr = "[";
    for (var i =0; i < shopList.length; i++) {
      var carShopBean = shopList[i];
      console.log(carShopBean);
      // if (carShopBean.logisticsType > 0) {
      //   isNeedLogistics = 1;
      // }
      allGoodsPrice += carShopBean.price * carShopBean.number

      var goodsJsonStrTmp = '';
      if (i > 0){
        goodsJsonStrTmp = ",";
      }
      goodsJsonStrTmp += '{"goodsId":'+ carShopBean.goodsId +',"number":'+ carShopBean.number +',"propertyChildIds":"'+ carShopBean.propertyChildIds +'","logisticsType":'+ carShopBean.logisticsType +'}';
      goodsJsonStr += goodsJsonStrTmp;
    }
    goodsJsonStr += "]";
    that.setData({
      goodsList:shopList,
      //isNeedLogistics:isNeedLogistics,
      allGoodsPrice:allGoodsPrice,
      goodsJsonStr:goodsJsonStr
    });

  },
  createOrder:function (e) {
    wx.showLoading();
    var that = this;
    var loginToken = app.globalData.token // 用户登录 token
    var remark = e.detail.value.remark; // 备注信息

    // var postData = {
    //   token: loginToken,
    //   goodsJsonStr: that.data.goodsJsonStr,
    //   remark: remark
    // };
    // postData.aaaa = 1234;
    // if (that.data.isNeedLogistics > 0) {
    //   if (!that.data.curAddressData) {
    //     wx.hideLoading();
    //     wx.showModal({
    //       title: '错误',
    //       content: '请选择您的收货地址',
    //       showCancel: false
    //     })
    //     return;
    //   }
    //   postData.provinceId = that.data.curAddressData.provinceId;
    //   postData.cityId = that.data.curAddressData.cityId;
    //   if (that.data.curAddressData.districtId) {
    //     postData.districtId = that.data.curAddressData.districtId;
    //   }
    //   postData.address = that.data.curAddressData.address;
    //   postData.linkMan = that.data.curAddressData.linkMan;
    //   postData.mobile = that.data.curAddressData.mobile;
    //   postData.code = that.data.curAddressData.code;
    // }
    var goodslist = that.data.goodsList, _all_count = 0;
    for (var i = 0; i < goodslist.length;i++){
      _all_count += Number(goodslist[i].number);
    }
    var orderData = {};
    var User = that.globalData.users;
    orderData.client_id = User.client_id;
    orderData.order_amount = this.data.allGoodsPrice;
    orderData.order_count = _all_count;
    orderData.order_expfee = 0;
    //orderData.user_name = User.user_name;
    //orderData.tel_number = User.tel_number;
    //orderData.province = User.province;
    //orderData.city = User.city;
    //orderData.address = User.address;
    //orderData.postal_code = User.postal_code;
    //orderData.exptime = User.exptime;
    orderData.leword = e.detail.value.remark;
    wx.request({
      url: app.globalData.domains + "/Orders/CreateOrder",
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: orderData, // 设置请求的 参数
      success: (res) =>{
        wx.hideLoading();
        var r = res.data;
        if (r.ack != "success") {
          wx.showModal({
            title: '错误',
            content: r.errorMsg,
            showCancel: false
          })
          return;
        }
        // 清空购物车数据
        wx.removeStorageSync('shopCarInfo');
        // 下单成功，跳转到订单管理界面
        wx.reLaunch({
          url: "/pages/order-list/index"
        });
      }
    })
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.domains + '/User/GetUserAddress',
      data: {
        rd_session: app.globalData.rd_session
      },
      success: (res) =>{
        console.log(res.data)
        var r = res.data;
        if (r.ack != "success") {
          that.setData({
            curAddressData: { address: r.data.client_address, mobile: r.data.mobile, linkMan:'对对对'}
          });
        }
      }
    })
  },
  addAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url:"/pages/select-address/index"
    })
  }
})
