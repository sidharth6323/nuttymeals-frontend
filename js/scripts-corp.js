var app = angular.module("nuttymeals",['ngAnimate','ngSanitize','uiGmapgoogle-maps']);

app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://test.payu.in/_payment',
    'https://secure.payu.in/_payment',
    "https://nuttymeals.pythonanywhere.com/api/place_order_cod",
    "http://nuttymeals.nhh6b7byn2.us-west-2.elasticbeanstalk.com/",
    "http://localhost:8000/api/place_order_cod"
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

  $scope.loginLoading = 0;

  //$scope.api_domain = "http://nuttymeals.nhh6b7byn2.us-west-2.elasticbeanstalk.com";
  $scope.api_domain = "http://localhost:8000"

  $scope.activeTestimony=1;
  $scope.initApp = function(){


  }
  window.onscroll = function() {myFunction()};
  function myFunction() {
    var navbar = document.getElementById("navbar");
    var sticky = navbar.offsetTop;
    console.log("called sticky")
    if (window.pageYOffset >= sticky) {
      navbar.classList.add("sticky")
    } else {
      navbar.classList.remove("sticky");
    }
  }

  setInterval(function(){
    if($scope.activeTestimony<3)
    {
      $scope.activeTestimony += 1;
    }
    else {
      $scope.activeTestimony=1;
    }
    $scope.$apply();
  },5000);

  $scope.scroll_to = function(section){
      $('html, body').animate({
          scrollTop: $("#"+section).offset().top-100
      }, 800);

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
