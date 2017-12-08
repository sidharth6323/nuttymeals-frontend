var app = angular.module("nuttymeals",['ngAnimate','ngSanitize','uiGmapgoogle-maps']);

app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://test.payu.in/_payment',
    'https://secure.payu.in/_payment'
  ]);
});
app.config(function(uiGmapGoogleMapApiProvider){

  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyDjwwUEE6Y4EOPfLn7ae9Oaau29bCTO8wk',
    v: '3.28', //defaults to latest 3.X anyhow
  });

});

app.controller("mainCtrl",function($scope,$http){
  $(window).on("load",function(){
    $scope.main_loading=0;
  });
  $scope.activeModal = "";
  $scope.loginLoading = 0;
  $scope.active_review=1;
  //$scope.api_domain = "https://nuttymeals.pythonanywhere.com";
  $scope.api_domain = "http://localhost:8000"
  $scope.loggedIn=0;
  $scope.userMenu=0;
  $scope.duration=30;
  $scope.discount=0;
  $scope.meal_type = '';
  $scope.addons = "";
  $scope.show_addon=0;
  $scope.time="monthly";
  $scope.isArray = function(input) {
      return angular.isArray(input);
  };
  $scope.initApp = function(){
    $scope.checklogin();
    $scope.getPlans();
    $scope.getmenu();
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
  setInterval(function(){
    if($scope.active_review<3)
    {
      $scope.active_review = $scope.active_review + 1;
    }
    else {
      $scope.active_review=1;
    }
    $scope.$apply();
  },3000);
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
    if($scope.duration==1)
    {
      e.preventDefault();
      console.log($scope.current_plan)
      $http({
        method:"POST",
        url : $scope.api_domain + "/api/get/plan_availability",
        data : {meal_type:$scope.current_plan[0].meal_type},
      }).then(function(response){
        console.log(response.data.status);
        $scope.availability = response.data.status;
      },function(){
        console.log("error in getting hash");
      });
      if($scope.availability == "NA")
      {
        alert("Sorry! You need to make the booking atleast 2 hour before meal time.");
        return;
      }
    }
    if($scope.address1==null || $scope.address2==null || $scope.pincode==null || $scope.address1=="" || $scope.address2=="" || $scope.pincode==""  )
    {
      if(!($scope.duration==1 && !$scope.delivery))
      {
        console.log("called2")
        e.preventDefault();
        alert("Please Fill all the address fields!")
      }
      e.preventDefault();
      $scope.get_payuhash();
    }
    else {
      e.preventDefault();
      $scope.get_payuhash();
    }
  }
  $scope.set_delivery_status = function(){
    console.log("status_set")
    if(!$scope.current_plan[0].delivery_charge)
    {
      $scope.delivery=false;
    }
    else {
      $scope.delivery=true;
    }
  }
  $scope.get_payuhash = function(){
    var session = getCookie('s_id');
    if(session.length!=0)
    {
      if($scope.delivery==true)
        $scope.address=$scope.address1+", "+$scope.address2+", "+$scope.pincode;
      else {
        $scope.address="";
      }
      $('.loader-container').show();
      $('.loader-container').css('display','block');
      $http({
        method:"POST",
        url : $scope.api_domain + "/api/get/payu_hash",
        data : {email:$scope.currentUser.user.email,amount:$scope.final_order_price,product_info:$scope.current_plan[0].p_name,firstname:$scope.currentUser.user.username,udf1:$scope.address,udf2:$scope.qty,udf3:$scope.delivery,duration:$scope.duration,addons:$scope.addons,meal_type:$scope.meal_type},
        headers: {'Authorization': "Token "+session}
      }).then(function(response){
        console.log(response.data);
        $scope.hash_data = response.data;
        console.log("ainwayi");
        console.log("hhg");
        setTimeout(function(){document.getElementById("payuform").submit();},2000);
      },function(){
        console.log("error in getting hash");
      });
    }
    else {
      $scope.loggedIn=0;
    }
  }

  $scope.place_order = function(){
    if($scope.meal_type.length==0)
    {
      alert("Please select Veg or Non-Veg meal type!");
      return;
    }
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
    if($scope.addon_lunch_chapati!=0 || $scope.addon_lunch_curry!=0 || $scope.addon_lunch_rice!=0 || $scope.addon_dinner_chapati!=0 || $scope.addon_dinner_curry!=0 || $scope.addon_dinner_rice!=0)
    {
      console.log("addon changed");
      $scope.addons = {"lunch":{"chapati":$scope.addon_lunch_chapati,"curry":$scope.addon_lunch_curry,"rice":$scope.addon_lunch_rice},"dinner":{"chapati":$scope.addon_dinner_chapati,"curry":$scope.addon_dinner_curry,"rice":$scope.addon_dinner_rice}}
      sum = $scope.addon_lunch_chapati + $scope.addon_lunch_curry + $scope.addon_lunch_rice + $scope.addon_dinner_chapati + $scope.addon_dinner_curry + $scope.addon_dinner_rice;
      $scope.final_order_price = $scope.final_order_price + (sum*29);
    }
    if($scope.currentUser.sign_by_referral)
    {
      $scope.discount = (0.3*$scope.final_order_price).toFixed(0);
      if($scope.discount>100)
      {
        $scope.discount=100;
      }
      $scope.final_order_price = $scope.final_order_price-$scope.discount;
    }
  }

  $scope.get_my_orders= function(){
    var session = getCookie('s_id');
    $http({
      method:"GET",
      url : $scope.api_domain + "/api/get/orders/",
      headers: {'Authorization': "Token "+session}
    }).then(function(response){
      $scope.my_orders=response.data;
      console.log($scope.my_orders)
    },function(){
      console.log("didn't get orders");
    });
  }
  $scope.cancel_for_tomo = function(o_id){
    var session = getCookie('s_id');
    $http({
      method:"GET",
      url : $scope.api_domain + "/api/get/order/cancel_for_tomo/"+o_id+"/",
      headers: {'Authorization': "Token "+session}
    }).then(function(response){
      $scope.get_my_orders();
    },function(){
      console.log("didn't cancel");
    });
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
  $scope.getmenu = function(){
    $http({
      method:"GET",
      url : $scope.api_domain + "/api/get/menu",
    }).then(function(response){
      console.log(response.data);
      $scope.menu=response.data;
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
    $('.loader-container').show();
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
    $('.loader-container').hide();
  };


  $scope.signup = function(){
    $scope.signupError="";
    $scope.signupLoading=1;
    $('.loader-container').show();
    $http({
      method:"POST",
      url : $scope.api_domain + "/api/signup/",
      data:{"email":$scope.email,"username":$scope.username,"password":$scope.password,"phone":$scope.phone,"referral_code_signup":$scope.referral}
    }).then(function(response){
      $scope.username=response.data.user.username;
      $scope.login();
      $scope.activeModal="";
    },function(response){
      $scope.signupError = response.data.error;
    });
    $scope.signupLoading=0;
    $('.loader-container').hide();
  }
  $scope.scroll_to = function(section){
      $('html, body').animate({
          scrollTop: $("#"+section).offset().top-100
      }, 800);

  }
  $scope.select_plan=function(id){
    $scope.plan_modal=1;
    $scope.show_addon=0;
    $scope.meal_type='';
    $scope.addon_lunch_curry = 0;
    $scope.addon_lunch_chapati = 0;
    $scope.addon_lunch_rice = 0;
    $scope.addon_dinner_curry = 0;
    $scope.addon_dinner_chapati = 0;
    $scope.addon_dinner_rice = 0;
      $scope.current_plan = $scope.allPlans.filter(function( obj ) {
        return obj.id == id;
      });
      console.log($scope.current_plan);
      $scope.set_delivery_status();
  }

  $scope.map = { center: { latitude: 12.9020326, longitude: 77.5202511 }, zoom: 19 };
  $scope.marker = {
    id: 0,
    coords: {
      latitude: 12.9020326,
      longitude: 77.5202511
    },
    events: {
      dragend: function (marker, eventName, args) {
        $log.log('marker dragend');
        var lat = marker.getPosition().lat();
        var lon = marker.getPosition().lng();
        $log.log(lat);
        $log.log(lon);
        $scope.marker1.options = {
          labelContent: "lat: " + $scope.marker1.coords.latitude + ' ' + 'lon: ' + $scope.marker1.coords.longitude,
          labelAnchor: "100 0",
          labelClass: "marker-labels"
        };
      }
    }
  }

});
