//app.js
App({
  onLaunch: function () {
    this.login();
  },
  login : function () {
    var that = this;
    var token = that.globalData.token;
    if (token) {
      wx.request({
        url: defaultsite + that.globalData.subDomain + '/user/check-token',
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.code != 0) {
            that.globalData.token = null;
            that.login();
          }
        }
      })
      return;
    }
    wx.login({
      success: function (res) {console.log(res.code+" ===")
        wx.request({
          url: that.globalData.domains+"/User/GetOpenId",
          data: {
            code: res.code, 
            app_id: 'wx1da05f244060447a', 
            app_secret:'02e97eafc12217cbafc39fdaf8eda81e'
          },
          success: function(res) {
            var r = res.data;
            console.log(res.data);
            if(r.ack == "success") {
              that.globalData.token = r.data['3rd_session'];
            }
            // if (res.data.code == 10000) {
            //   // 去注册
            //   that.registerUser();
            //   return;
            // }
            // if (res.data.code != 0) {
            //   // 登录错误 
            //   wx.hideLoading();
            //   wx.showModal({
            //     title: '提示',
            //     content: '无法登录，请重试',
            //     showCancel:false
            //   })
            //   return;
            // }
            // that.globalData.token = res.data.data.token;
          }
        })
      }
    })


    // wx.login({
    //   success: function (res) {
    //     wx.request({
    //       url: "https://api.it120.cc/" + that.globalData.subDomain + '/user/wxapp/login',
    //       data: {
    //         code: res.code
    //       },
    //       success: function (res) {
    //         // if (res.data.code == 10000) {
    //         //   // 去注册
    //         //   that.registerUser();
    //         //   return;
    //         // }
    //         // if (res.data.code != 0) {
    //         //   // 登录错误 
    //         //   wx.hideLoading();
    //         //   wx.showModal({
    //         //     title: '提示',
    //         //     content: '无法登录，请重试',
    //         //     showCancel:false
    //         //   })
    //         //   return;
    //         // }
    //         // that.globalData.token = res.data.data.token;
    //       }
    //     })
    //   }
    // })
  },
  registerUser: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            var iv = res.iv;
            var encryptedData = res.encryptedData;
            // 下面开始调用注册接口
            wx.request({
              url: "https://api.it120.cc/" + that.globalData.subDomain +'/user/wxapp/register/complex',
              data: {code:code,encryptedData:encryptedData,iv:iv}, // 设置请求的 参数
              success: (res) =>{
                wx.hideLoading();
                that.login();
              }
            })
          }
        })
      }
    })
  },
  globalData:{
    userInfo:null,
    subDomain:"mall",
	  defaultsite:"https://api.it120.cc/",
    domains:'http://112.74.92.30',
    users:null
  }
})