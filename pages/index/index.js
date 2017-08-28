//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,  
    selectCurrent:0,
    categories: [],
    activeCategoryId: 0,
    goods:[],
    scrollTop:"0",
    loadingMoreHidden:true
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  scroll: function (e) {
    //  console.log(e) ;
    var that = this,scrollTop=that.data.scrollTop;
    that.setData({
      scrollTop:e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /*
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    */
    wx.request({
      url: "https://api.it120.cc/"+ app.globalData.subDomain +'/banner/list',
      data: {
        key: 'mallName'
      },
      success: function(res) {
        that.setData({
          banners: res.data.data
        });
      }
    })
    wx.request({
      url: app.globalData.domains + "/Product/getCatInfo",
      success: function(res) {
        var r = res.data;
        var categories = [{ cat_id: 0, cat_name: "全部" }];
        if (r.ack == "success"){
            for (var i = 0; i < r.data.length; i++) {
              categories.push(r.data[i]);
            }
            that.setData({
              categories: categories,
              activeCategoryId: 0
            });
        }
        that.getGoodsList(0);
      }
    })

  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.request({
      url: app.globalData.domains + "/Product/ProductInfoList",
      data: {
        cat_id: categoryId
      },
      success: function(res) {
        var r = res.data;
        if (r.ack != "success"){
            that.setData({
              goods: [],
              loadingMoreHidden: false,
            });
            return;
        }
        var goods = [];
        for (var i = 0; i < r.data.length;i++){
          goods.push(r.data[i]);
        }
        that.setData({
          goods:goods,
          loadingMoreHidden: true
        });
      }
    })
  }
})
