//app.js
App({
  onLaunch: function () {
    var that = this;
    var rd_session = wx.getStorageSync('rd_session') || '';
		if(rd_session){
        //wx.checkSession({
        //  success: function(){
            //session未过期，并且在本生命周期一直有效
            //验证rd_session是否合法
            wx.request({
              url: that.globalData.domains + '/User/CheckLogin',
              data: {rd_session: rd_session},
              success: function (res) {
                var r = res.data;
                if (r.ack != 'success') {
                  wx.showModal({ title: '提示', content: r.errorMsg, showCancel: false });
                }else if(r.ack == 'success'){
                  if (r.data.is_login == 'Y'){
                    //更新app data
                    that.globalData.rd_session = rd_session
                  } else if (r.data.is_login == 'N'){
                    //清空无效的rd_session
                    that.globalData.rd_session = null;
                    that.login();
                  }
                }
              }
            });
          //},
        //   fail: function(){
        //     //登录态过期 清空已失效的rd_session //每次login,后端都会更新rd_session有效期，所以登录态已过期，服务器端也可能过期了
        //     wx.setStorage({key:'rd_session',data:''});
        //     that.login();
        //   }
        // });
		}else{
        that.login();
		}
  },
  login : function () {
    var that = this;
    wx.login({
      success: function (res) {
        wx.request({
          url: that.globalData.domains +"/User/Login",
          data: {
            code: res.code, 
            app_id: 'wx47a4216a540b6516', 
            app_secret:'0899d87d8ef430a85671136528281603'
          },
          success: function (res) {
            var r = res.data;
            if (r.ack == 'success') {//测试大小写SUCCESS
              that.globalData.rd_session = r.data.rd_session;
              wx.setStorage({key:'rd_session',data:r.data.rd_session});
            } else if (r.ack == 'failure'){
              that.globalData.openid = r.data.openid;
              that.registerUser();
              return;
            } else {
              wx.showModal({title: '提示', content: r.errorMsg,showCancel: false});
              return;
            }
          }
        })
      }
    });
  },
  registerUser: function (cb) {
    var that = this;
    //wx.login一定会登录过，所以直接调用wx.getUserInfo
    wx.getUserInfo({
          lang:'zh_CN',
          success: function (res) {
            var _user = res.userInfo;
            var _data = {
              client_nickname: _user.nickName,
              client_name: _user.nickName,
              client_sex: _user.gender == 1 ? '男' :'女',
              client_head: _user.avatarUrl,
              openid: that.globalData.openid,
              client_province: _user.province,
              client_city: _user.city
            };
            wx.request({
              url: that.globalData.domains + '/User/CreateUser',
              data: _data,
              success: (res) =>{
                var r = res.data,flag = true;
                if (r.ack == 'success') {
                  that.globalData.rd_session = r.data.rd_session;
                  wx.setStorage({key:'rd_session',data:r.data.rd_session});
                }else{
                  wx.showModal({title: '提示',content: r.errorMsg,showCancel: false});
                  flag = false;
                }
                if(cb){
                  return typeof cb == "function" && cb(flag)
                } 
              }
            })
          },
          fail: function (res) { //拒绝授权
            wx.showModal({
              title: '用户未授权',
              content: '如需正常使用，请点击授权按钮，勾选用户信息并点击确定。',
              showCancel: false,
              success: function (res) {
                if(res.confirm){
                  wx.openSetting({
                    success: (res) => {
                      if(res.authSetting["scope.userInfo"]) { 
                        // 如果成功打开授权,再次注册
                        that.registerUser();
                      }else {
                        // 如果用户依然拒绝授权
                        //console.log('拒绝授权了')
                        if (cb) {
                          return typeof cb == "function" && cb(false)
                        }
                      } 
                    },
                    fail: function () { //调用失败，授权登录不成功
                      if (cb) {
                        return typeof cb == "function" && cb(false)
                      }
                    }
                  })
                }
              }
            })
          }
        });
  },
  globalData:{
    userInfo:null,
    subDomain:"mall",
	  defaultsite:"https://api.it120.cc/",
    domains: 'https://shop.szzbjt.com', //'http://112.74.92.30',//
    users:null,
    rd_session:null,
    openid:null
  }
})