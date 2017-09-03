var commonCityData = require('../../utils/city.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    provinces:[],
    citys:[],
    districts:[],
    selProvince:'请选择',
    selCity:'请选择',
    selDistrict:'请选择',
    selProvinceIndex:0,
    selCityIndex:0,
    selDistrictIndex:0
  },
  bindCancel:function () {
    wx.navigateBack({})
  },
  bindSave: function(e) {
    var that = this;
    var linkMan = e.detail.value.cart_consignee;
    var address = e.detail.value.cart_address;
    var mobile = e.detail.value.cart_mobile;
    //var code = e.detail.value.code;

    if (linkMan == ""){
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel:false
      })
      return
    }
    if (mobile == ""){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      })
      return
    }
    if (this.data.selProvince == "请选择"){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    if (this.data.selCity == "请选择"){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    var city_name = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].name;
    var district_name;
    if (this.data.selDistrict == "请选择"){
      district_name = city_name;
    } else {
      district_name = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].name;
    }
    if (address == ""){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel:false
      })
      return
    }
    var _url = '/User/AddUserCartAddress',_data = {
      rd_session: app.globalData.rd_session,
      province: commonCityData.cityData[this.data.selProvinceIndex].name,
      city: city_name,
      district: district_name,
      consignee: linkMan,
      address: address,
      mobile: mobile,
      is_default: '1'
    };
    if (that.data.id) {
      _url = '/User/ModifyUserCartAddress';
      _data.id = that.data.id;
    }
    wx.showLoading({ title: '正在提交' });
    wx.request({
      url: app.globalData.domains + _url,
      data: _data,
      success: function(res) {
        var r = res.data;
        if (r.ack == 'success') { 
          // 跳转到结算页面
          wx.navigateBack({})
        }else{
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: r.errorMsg,
            showCancel: false
          });
          return;
        }
      }
    })
    // var apiAddoRuPDATE = "add";
    // var apiAddid = that.data.id;
    // if (apiAddid) {
    //   apiAddoRuPDATE = "update";
    // } else {
    //   apiAddid = 0;
    // }
    // wx.request({
    //   url: "https://api.it120.cc/" + app.globalData.subDomain + '/user/shipping-address/' + apiAddoRuPDATE,
    //   data: {
    //     token: app.globalData.token,
    //     id: apiAddid,
    //     provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
    //     cityId: cityId,
    //     districtId: districtId,
    //     linkMan:linkMan,
    //     address:address,
    //     mobile:mobile,
    //     //code:code,
    //     isDefault:'true'
    //   },
    //   success: function(res) {
    //     if (res.data.code != 0) {
    //       // 登录错误 
    //       wx.hideLoading();
    //       wx.showModal({
    //         title: '失败',
    //         content: res.data.msg,
    //         showCancel:false
    //       })
    //       return;
    //     }
    //     // 跳转到结算页面
    //     wx.navigateBack({})
    //   }
    // })
  },
  initCityData:function(level, obj){
    if(level == 1){
      var pinkArray = [];
      for(var i = 0;i<commonCityData.cityData.length;i++){
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces:pinkArray
      });
    } else if (level == 2){
      var pinkArray = [];
      var dataArray = obj.cityList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys:pinkArray
      });
    } else if (level == 3){
      var pinkArray = [];
      var dataArray = obj.districtList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts:pinkArray
      });
    }
    
  },
  bindPickerProvinceChange:function(event){
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince:selIterm.name,
      selProvinceIndex:event.detail.value,
      selCity:'请选择',
      selDistrict:'请选择'
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity:selIterm.name,
      selCityIndex:event.detail.value,
      selDistrict:'请选择'
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  onLoad: function (e) {
    var that = this;
    this.initCityData(1);
    var id = e.id;
    if (id) {
      // 初始化原数据
      wx.showLoading();
      wx.request({
        url: app.globalData.domains + '/User/GetUserCartAddress',
        data: {
          rd_session: app.globalData.rd_session,
          id:id
        },
        success: function (res) {
          wx.hideLoading();
          var r = res.data;
          if (r.ack == "success") {
            var _list = r.data;
            for (var i = 0;i<_list.length;i++){
              if (_list[i].id==id){
                that.setData({
                  id: id,
                  addressData: _list[i],
                  selProvince: _list[i].cart_province,
                  selCity: _list[i].cart_city,
                  selDistrict: _list[i].cart_district
                });
              }
            }
          } else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据',
              showCancel: false
            })
          }
        }
      })
      // 
    }
  },
  selectCity: function () {
    
  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.domains + '/User/DeleteUserCartAddress',
            data: {
              rd_session: app.globalData.rd_session,
              id: id
            },
            success: (res) => {
              wx.navigateBack({})
            }
          })
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  }
})
