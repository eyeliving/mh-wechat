var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data:{
    //statusType:["全部","待付款","待发货","待收货","已完成"],
     statusType: [{ status: '', name: "全部" }, 
       { status: 'unpay', name: "待付款" }, { status: 'unpay', name:"待发货"}, 
       { status: 'unpay', name: "待收货" }, { status: 'closed', name:"已完成"}],
    currentTpye:0,
    tabClass: ["", "", "", "", ""]
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.data.currentTpye = curType
     this.setData({
      currentTpye:curType
     });
     this.onShow();
  },
  orderDetail : function (e) {
    // var orderId = e.currentTarget.dataset.id;
    // wx.navigateTo({
    //   url: "/pages/order-details/index?id=" + orderId
    // })
  },
  cancelOrderTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
     wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: "https://api.it120.cc/" + app.globalData.subDomain + '/order/close',
            data: {
              token: app.globalData.token,
              orderId: orderId
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  toPayTap:function(e){
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wxpay.wxpay(app, money, orderId, "/pages/order-list/index");
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
   
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
 
  },
  getOrderStatistics : function () {
    var that = this;
    wx.request({
      url: "https://api.it120.cc/" + app.globalData.subDomain + '/order/statistics',
      data: { token: app.globalData.token },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          var tabClass = that.data.tabClass;
          if (res.data.data.count_id_no_pay > 0) {
            tabClass[1] = "red-dot"
          }
          if (res.data.data.count_id_no_transfer > 0) {
            tabClass[2] = "red-dot"
          }
          if (res.data.data.count_id_no_confirm > 0) {
            tabClass[3] = "red-dot"
          }
          if (res.data.data.count_id_success > 0) {
            tabClass[4] = "red-dot"
          }

          that.setData({
            tabClass: tabClass,
          });
        }
      }
    })
  },
  onShow:function(){
    // 获取订单列表
    // if (!app.globalData.users){
    //      wx.showModal({
    //        title: '提示',
    //        content: '您还未登录',showCancel:false,
    //        success: function (res) {
    //          if (res.confirm) {
    //             wx.reLaunch({
    //               url: "/pages/index/index"
    //             });
    //          } else if (res.cancel) {
    //            wx.reLaunch({
    //              url: "/pages/index/index"
    //            });
    //          }
    //        }
    //      })
    //      return;
    // }
    wx.showLoading({ title: '正在获取订单' });
    var that = this;
    var postData = {
      rd_session: app.globalData.rd_session,
      status: that.data.statusType[that.data.currentTpye].status
    };
    //this.getOrderStatistics();
    wx.request({
      url: app.globalData.domains + "/Orders/OrdersLists",
      data: postData,
      success: (res) => {
        wx.hideLoading();
        var r = res.data;
        if (r.ack == "success") {
          that.setData({
            orderList: res.data.data.lists,
            logisticsMap: {},
            goodsMap: {}
          });
        } else {
          this.setData({
            orderList: null,
            logisticsMap: {},
            goodsMap: {}
          });
        }
      },
      fail:(res) => {
        wx.hideLoading();
        wx.showModal({
           title: '提示',
           content: '请求错误，请稍后尝试',showCancel:false,
           success: function (res) {
             console.log(res)
            //  if (res.confirm) {
               
            //  }else if (res.cancel) {
              
            //  }
           }
        })
      }
    })
    
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
 
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
 
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
   
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  
  }
})