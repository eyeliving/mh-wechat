var app = getApp()
Page({
  data:{
    //statusType:["全部","待付款","待发货","待收货","已完成"],
     statusType: [{ status: '', name: "全部" }, 
       { status: 'unpay', name: "待付款"}, 
       { status: 'payed', name: "待发货"}, //已支付
       { status: 'delivering', name: "待收货"}, 
       { status: 'received', name: "已完成"}],
    currentTpye:0,
    tabClass: ["", "", "", "", ""],
    page:0,
    current_taps:0,
    currentTpye_status:''
  },
  statusTap:function(e){
     var curType_index =  e.currentTarget.dataset.index;
     var curType_status = e.currentTarget.dataset.status;
     //this.data.currentTpye = curType
     this.setData({
       currentTpye: curType_index,
       currentTpye_status: curType_status,
       page:0
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
            url: app.globalData.domains + "/Orders/CancelOrder",
            data: {
              //rd_session: app.globalData.rd_session,
              order_id: orderId
            },
            success: (res) => {
              wx.hideLoading();
              var r = res.data;
              if (r.ack == "success") {
                that.onShow();
              }else{
                wx.showModal({ title: '提示', content: r.errorMsg, showCancel: false });
              }
            }
          })
        }
      }
    })
  },
  toPayTap:function(e){
    var orderId = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.domains + "/Orders/WechatPayment",
      data: {rd_session: app.globalData.rd_session,order_id: orderId},
      success: (res) => {
        wx.hideLoading();
        var r = res.data;
        if (r.ack == "success") {
          wx.requestPayment({
            'timeStamp': r.data.timeStamp,
            'nonceStr': r.data.nonceStr,
            'package': r.data.package,
            'signType': r.data.signType,
            'paySign': r.data.paySign,
            'success': function (res) {
                  wx.reLaunch({
                    url: "/pages/order-list/index"
                  });
            },
            'fail': function (res) {}
          });
        }else{
          wx.showModal({ title: '提示', content: r.errorMsg, showCancel: false });
        }
      }
    });
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
    this.getListData();
    
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
   // this.setData({page: this.data.page+1});
    this.getListData(true);
  },
  getListData: function (flag){
    wx.showLoading({ title: '正在获取订单' });
    var that = this, page = this.data.page+1;
    var postData = {
      rd_session: app.globalData.rd_session,
      status: this.data.currentTpye_status,
      page: page,
      page_size: 5
    };
    //this.getOrderStatistics();
    wx.request({
      url: app.globalData.domains + "/Orders/OrdersLists",
      data: postData,
      success: (res) => {
        wx.hideLoading();
        var r = res.data;
        if (r.ack == "success") {
          var _list = res.data.data.lists;
          for (var i = 0; i < _list.length;i++){
            if (_list[i].status == 'unpay'){
              _list[i].status_tips = '待付款'
            } else if (_list[i].status == 'payed') {
              _list[i].status_tips = '待发货'
            } else if (_list[i].status == 'delivering') {
              _list[i].status_tips = '待收货'
            } else if (_list[i].status == 'received') {
              _list[i].status_tips = '已完成'
            } else if (_list[i].status == 'canceled') {
              _list[i].status_tips = '已取消'
            }
          }
          var orderList = that.data.orderList
          if (orderList && orderList.length > 0 && flag){
            if(_list.length!=0){
              orderList = orderList.concat(_list);
            }else{
              page = page - 1;
            }
          }else{
            orderList = _list
            page = 1;
          }
          if (orderList.length <= 0) { orderList=null}
          that.setData({
            orderList: orderList,
            page:page,
            logisticsMap: {},
            goodsMap: {}
          });
        } else {
          this.setData({
            orderList: null,
            logisticsMap: {},
            goodsMap: {},
            page: 0
          });
        }
      },
      fail: (res) => {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '请求错误，请稍后尝试', showCancel: false,
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
  toPaySure:function(e){
    wx.showModal({
      title: '是否要确定收货？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.id;
          wx.request({
            url: app.globalData.domains + "/Orders/ConfirmOrderRecived",
            data: { rd_session: app.globalData.rd_session, order_id: orderId },
            success: (res) => {
              var r = res.data;
              if (r.ack == "success") {
                wx.reLaunch({
                  url: "/pages/order-list/index"
                })
              } else {
                wx.showModal({ title: '提示', content: r.errorMsg, showCancel: false });
              }
            }
          });
        }
      }
    });
  }
})