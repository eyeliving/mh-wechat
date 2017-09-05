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
    wx.showLoading({title: '正在提交订单'});
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
    var goodslist = that.data.goodsList, _all_count = 0, productData = [];
    for (var i = 0; i < goodslist.length;i++){
      _all_count += Number(goodslist[i].number);
      var _pobj = { "product_id": goodslist[i].goodsId, "product_count": goodslist[i].number, "product_price": goodslist[i].price, spec_det_id1: goodslist[i].childId}
      productData.push(_pobj);
    }
    var orderData = {};
    var curAddressData = that.data.curAddressData;
    //var User = that.globalData.users;
    //orderData.client_id = '';
    orderData.rd_session = app.globalData.rd_session;
    orderData.order_amount = this.data.allGoodsPrice;
    orderData.order_count = _all_count;
    orderData.order_expfee = 0;
    orderData.user_name = curAddressData.cart_consignee;
    orderData.tel_number = curAddressData.cart_mobile;
    orderData.province = curAddressData.cart_province;
    orderData.city = curAddressData.cart_city;
    orderData.district = curAddressData.cart_district;
    orderData.address = curAddressData.cart_address;
    //orderData.postal_code = User.postal_code;
    //orderData.exptime = '2017-09-07';
    orderData.leword = e.detail.value.remark;
    orderData.productData = productData;
    wx.request({
      url: app.globalData.domains + "/Orders/CreateOrder",
      //method:'POST',
      header: {
        //'content-type': 'application/x-www-form-urlencoded'
      },
      data: { orderData: orderData}, // 设置请求的 参数
      success: (res) =>{
        wx.hideLoading();
        var r = res.data;
        if (r.ack != "success") {
          wx.showModal({
            title: '提示',
            content: r.errorMsg,
            showCancel: false
          })
          return;
        }

        wx.requestPayment({
          'timeStamp': r.data.timeStamp,
          'nonceStr': r.data.nonceStr,
          'package': r.data.package,
          'signType': r.data.signType,
          'paySign': r.data.paySign,
          'success': function (res) {
            // 清空购物车数据
            wx.removeStorageSync('shopCarInfo');
            // 下单成功，跳转到订单管理界面
            wx.reLaunch({
              url: "/pages/order-list/index"
            });
          },
          'fail': function (res) {
          }
        })

      }
    })
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
          var _address_list = r.data, curAddressData = {};
          for (var i=0;i<_address_list.length;i++){
            if (_address_list[i].is_default=='1'){
              curAddressData = _address_list[i];
            }
          }
          that.setData({
            curAddressData: curAddressData
          });
        }else{
          r.errorMsg &&wx.showModal({title: '提示',content: r.errorMsg,showCancel: false})
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
