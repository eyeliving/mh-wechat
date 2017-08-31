//app.js
App({
  onLaunch: function () {
    this.login();
  },
  login : function () {
    var that = this;
    var rd_session = that.globalData.rd_session;
    if (rd_session) {
      wx.request({
        url: that.globalData.domains + '/User/CheckLogin',
        data: {
          rd_session: rd_session
        },
        success: function (res) {
          var r = res.data;
          if (r.ack != 'SUCCESS') {
            that.globalData.rd_session = null;
            that.globalData.openid = null;
            that.login();
          }
        }
      })
      return;
    }
    wx.login({
      success: function (res) {
        wx.request({
          url: that.globalData.domains+"/User/GetOpenId",
          data: {
            code: res.code, 
            app_id: 'wx1da05f244060447a', 
            app_secret:'02e97eafc12217cbafc39fdaf8eda81e'
          },
          success: function (res) {
            var r = res.data;
            if (r.ack == 'success') {
              that.globalData.rd_session = r.data.rd_session;
            } else if (r.ack == 'FAILURE'){
              that.globalData.openid = r.data.openid;
              that.registerUser();
              return;
            }else{
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: r.errorMsg,
                showCancel: false
              })
              return;
            }
          }
        })
      }
    })
  },
  registerUser: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          lang:'zh_CN',
          success: function (res) {
            var _user = res.userInfo;
            var _data = {
              client_nickname: _user.nickName,
              client_name: _user.nickName,
              client_sex: _user.gender == 1 ? '男' :'女',
              client_head: _user.avatarUrl,
              client_wechat_openid: that.globalData.openid,
              client_province: _user.province,
              client_city: _user.city
            }
            wx.request({
              url: that.globalData.domains + '/User/CreateUser',
              data: _data,
              success: (res) =>{
                wx.hideLoading();
                var r = res.data;
                if (r.ack == 'success') {
                  that.globalData.rd_session = r.data.rd_session;
                }else{
                  wx.showModal({
                    title: '提示',
                    content: r.errorMsg,
                    showCancel: false
                  })
                }
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
    domains:'http://112.74.92.30',//'https://shop.szzbjt.com',
    users:null,
    rd_session:null,
    openid:null
  }
})