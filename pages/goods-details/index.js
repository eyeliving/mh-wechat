//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail:{},
    swiperCurrent: 0,  
    hasMoreSelect:false,
    selectSize:"选择：",
    selectSizePrice:0,
    shopNum:0,
    hideShopPopup:true,
    buyNumber:0,
    buyNumMin:0,
    buyNumMax:0,

    propertyChildIds:"",
    propertyChildNames:"",
    canSubmit:false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{},
    pics:[]
  },

  //事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  onLoad: function (e) {
    console.log('onLoad');
    var that = this;
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        console.log(res.data)
        that.setData({
          shopCarInfo:res.data,
          shopNum:res.data.shopNum
        });
      } 
    })

    wx.request({
      url: app.globalData.domains + "/Product/ProductInfoById",
      data: {
        product_id: e.id
      },
      success: function(res) {
        var r = res.data;
        that.setData({
           goodsDetail:r.data[0],
           selectSizePrice: r.data[0].sale_prices,
           buyNumMax:r.data[0].product_instocks,
           buyNumber: (r.data[0].product_instocks>0) ? 1: 0,
           pics: r.data[0].img_data
         });
        WxParse.wxParse('article', 'html', r.data[0].product_desc, that, 5);
        // var selectSizeTemp = "";
        // if (res.data.data.properties) {
        //   for(var i=0;i<res.data.data.properties.length;i++){
        //     selectSizeTemp = selectSizeTemp + " " + res.data.data.properties[i].name;
        //   }
        //   that.setData({
        //     hasMoreSelect:true,
        //     selectSize:that.data.selectSize + selectSizeTemp,
        //     selectSizePrice:res.data.data.basicInfo.minPrice,
        //   });
        // }
        // that.data.goodsDetail = res.data.data;
        // that.setData({
        //   goodsDetail:res.data.data,
        //   selectSizePrice:res.data.data.basicInfo.minPrice,
        //   buyNumMax:res.data.data.basicInfo.stores,
        //   buyNumber:(res.data.data.basicInfo.stores>0) ? 1: 0
        // });
        // WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
      }
    })


  },
  bindGuiGeTap: function() {
     this.setData({  
        hideShopPopup: false 
    })  
  },
  closePopupTap: function() {
     this.setData({  
        hideShopPopup: true 
    })  
  },
  numJianTap: function() {
     if(this.data.buyNumber > this.data.buyNumMin){
        var currentNum = this.data.buyNumber;
        currentNum--; 
        this.setData({  
            buyNumber: currentNum
        })  
     }
  },
  numJiaTap: function() {
     if(this.data.buyNumber < this.data.buyNumMax){
        var currentNum = this.data.buyNumber;
        currentNum++ ;
        this.setData({  
            buyNumber: currentNum
        })  
     }
  },
  labelItemTap: function(e) {
    var that = this;
    /*
    console.log(e)
    console.log(e.currentTarget.dataset.propertyid)
    console.log(e.currentTarget.dataset.propertyname)
    console.log(e.currentTarget.dataset.propertychildid)
    console.log(e.currentTarget.dataset.propertychildname)
    */
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.spec_det_data[e.currentTarget.dataset.propertyindex].list;
    for(var i = 0;i < childs.length;i++){
      that.data.goodsDetail.spec_det_data[e.currentTarget.dataset.propertyindex].list[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.spec_det_data[e.currentTarget.dataset.propertyindex].list[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.spec_det_data.length;
    var curSelectNum = 0;
    var propertyChildIds= "";
    var propertyChildNames = "";
    var all_price = Number(that.data.goodsDetail.sale_prices);//所有选中的规格价
    for (var i = 0; i < that.data.goodsDetail.spec_det_data.length;i++) {
      childs = that.data.goodsDetail.spec_det_data[i].list;
      for (var j = 0;j < childs.length;j++) {
        if(childs[j].active){
          curSelectNum++;
          all_price += Number(childs[j].sale_price)
          //propertyChildIds = propertyChildIds + that.data.goodsDetail.spec_det_data[i].spec_name + ":" + childs[j].spec_det_id +",";
          //propertyChildNames = propertyChildNames + that.data.goodsDetail.spec_det_data[i].spec_name + ":" + childs[j].det_name +"  ";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {//各个分类规格都必选一个
      canSubmit = true;
    }
    // 计算当前价格
    //if (canSubmit) {
      that.setData({
        selectSizePrice: all_price,
        //propertyChildIds: propertyChildIds,
        //propertyChildNames: propertyChildNames,
        //buyNumMax: res.data.data.stores,
        //buyNumber: (res.data.data.stores > 0) ? 1 : 0

        goodsDetail: that.data.goodsDetail,
        canSubmit: canSubmit
      });
    //}

    
  
  },
  addShopCar:function(){
    if (this.data.goodsDetail.spec_det_data.length>0 && !this.data.canSubmit) {
      this.bindGuiGeTap();
      return;
    }
    if(this.data.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '暂时缺货哦~',
        showCancel:false
      })
      return;
    }
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.product_id;
    shopCarMap.pic = this.data.goodsDetail.img_data[0];
    shopCarMap.name = this.data.goodsDetail.product_name;
    //shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    //shopCarMap.propertyChildIds=this.data.propertyChildIds;
    //shopCarMap.label=this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    //shopCarMap.logisticsType=this.data.goodsDetail.basicInfo.logisticsId;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum){
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList){
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0;i<shopCarInfo.shopList.length;i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number=shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex,1, shopCarMap);
    } else {
       shopCarInfo.shopList.push(shopCarMap);
    }

    this.setData({
      shopCarInfo:shopCarInfo,
      shopNum:shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key:"shopCarInfo",
      data:shopCarInfo
    })
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },
  goShopCar:function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  tobuy:function(){
    if (this.data.goodsDetail.spec_det_data && !this.data.canSubmit) {
      this.bindGuiGeTap();
      return;
    }
    if(this.data.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '暂时缺货哦~',
        showCancel:false
      })
      return;
    }
    this.addShopCar();
    this.goShopCar();
  },
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
