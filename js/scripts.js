var app = angular.module("nuttymeals",['ngAnimate','ngSanitize']);

app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://test.payu.in/_payment',
    'https://secure.payu.in/_payment'
  ]);
});

app.controller("mainCtrl",function($scope,$http){
  $scope.activeModal = "";
  $scope.loginLoading = 0;
  $scope.api_domain = "https://nuttymeals.pythonanywhere.com";
  $scope.loggedIn=0;
  $scope.userMenu=0;
  $scope.duration=30;
  $scope.time="monthly";
  $scope.isArray = function(input) {
      return angular.isArray(input);
  };
  $scope.initApp = function(){
    $scope.checklogin();
    $scope.getPlans();
  }
  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
  }
  $scope.load_video = function(){
    if(!$scope.video_played)
    {
      $scope.video_played=1;
      $(".video-container").html("<video width='500' autoplay> <source src='img/about-video.mp4' type='video/mp4'>Your browser does not support the video tag.</video>");
    }
  }
  $scope.payuform_submit = function(e){
    console.log("called");
    console.log($scope.address1);
    console.log($scope.address2);
    console.log($scope.pincode);
    if($scope.address1==null || $scope.address2==null || $scope.pincode==null || $scope.address1=="" || $scope.address2=="" || $scope.pincode==""  )
    {
      console.log("called2")
      e.preventDefault();
      alert("Please Fill all the address fields!")
    }
  }
  $scope.get_payuhash = function(){
    var session = getCookie('s_id');
    if(session.length!=0)
    {
      $http({
        method:"POST",
        url : $scope.api_domain + "/api/get/payu_hash",
        data : {email:$scope.currentUser.user.email,amount:$scope.final_order_price,product_info:$scope.current_plan[0].p_name,firstname:$scope.currentUser.user.username,udf1:"address"},
        headers: {'Authorization': "Token "+session}
      }).then(function(response){
        console.log(response.data);
        $scope.hash_data = response.data;
      },function(){
        console.log("error in getting hash");
      });
    }
    else {
      $scope.loggedIn=0;
    }
  }

  $scope.place_order = function(){
    $scope.final_order_price=0;
    $scope.activeModal='place_order';
    $scope.plan_modal=0;
    if($scope.delivery==true)
    {
      $scope.final_order_price = $scope.current_plan[0].delivery_charge + ($scope.qty*$scope.current_plan[0].price);
    }
    else {
      $scope.final_order_price = $scope.qty*$scope.current_plan[0].price;
    }
    $scope.get_payuhash();
  }



  $scope.getPlans = function(){
    $http({
      method:"GET",
      url : $scope.api_domain + "/api/get/all_plans",
    }).then(function(response){
      console.log(response.data);
      $scope.allPlans=response.data;
    },function(error){
      console.log(error);
    });
  }
  $scope.logout = function(){
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    $scope.checklogin();
  }
  $scope.checklogin = function(){
    var session = getCookie('s_id');
    if(session.length!=0)
    {
      $http({
        method:"GET",
        url : $scope.api_domain + "/api/get/user",
        headers: {'Authorization': "Token "+session}
      }).then(function(response){
        console.log(response.data);
        $scope.loggedIn=1;
        $scope.currentUser=response.data;
      },function(){
        $scope.loggedIn=0;
      });
    }
    else {
      $scope.loggedIn=0;
    }
  }

  $scope.login = function(){
    $scope.loginError="";
    $scope.loginLoading=1;
    $http({
      method:"POST",
      url : $scope.api_domain + "/api/login/",
      data:{"username":$scope.username,"password":$scope.password}
    }).then(function(response){
      document.cookie = "s_id="+response.data.token;
      console.log(response.data);
      $scope.checklogin();
      $scope.activeModal="";
    },function(response){
      $scope.loginError = "Wrong Username or password";
    });
    $scope.loginLoading=0;
  };


  $scope.signup = function(){
    $scope.signupError="";
    $scope.signupLoading=1;
    $http({
      method:"POST",
      url : $scope.api_domain + "/api/signup/",
      data:{"email":$scope.email,"username":$scope.username,"password":$scope.password,"phone":$scope.phone,"referral_code_signup":$scope.referral}
    }).then(function(response){
      $scope.username=response.data.user.username;
      $scope.login();
      $scope.activeModal="";
    },function(response){
      $scope.signupError = response.data;
    });
    $scope.signupLoading=0;
  }

  $scope.select_plan=function(id){
    $scope.plan_modal=1;
      $scope.current_plan = $scope.allPlans.filter(function( obj ) {
        return obj.id == id;
      });
      console.log($scope.current_plan);
  }

});
