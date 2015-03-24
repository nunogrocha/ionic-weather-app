/*********************************************************************************************
*
*
* Home Controller
*
*
*********************************************************************************************/

var homeController = angular.module('homeController', []);

homeController.controller('homeControllerWrapper', ['$scope','$rootScope','$q','$cordovaGeolocation','$http','weatherService','settingsService',
    function($scope,$rootScope,$q,$cordovaGeolocation,$http,weatherService,settingsService) {

	$scope.page = {day: 'Today', time:'Today', name: 'Home', title:'Home', lat: 0, long: 0, temp: [], forecast:[], timeforecast:[]};
    $scope.slideIndex = 1;
    run();


	$scope.update = function(){
        run();
	}

    function run(){

        var promiseCoordinates = getCoordinates();

        promiseCoordinates.then(function(coordinates) {

            $scope.page.lat = coordinates.lat;
            $scope.page.long = coordinates.long;
            var promiseWeather = getWeather();

            promiseWeather.then(function(weather) {
                $scope.page.name = weather.name;
                $scope.page.temp = {temp: weather.main.temp, cod: weather.weather[0].icon, sky: weather.weather[0].main, description: weather.weather[0].description, temp_min: weather.main.temp_min, temp_max: weather.main.temp_max};
                var promiseWeatherForecast = getWeatherForecast();

                promiseWeatherForecast.then(function(weatherForecast) {
                    var forecastCount=0;
                    var timeForecastCount=0;
                    for (var i = 0; i < weatherForecast.list.length; i++) {
                        if (new Date(weatherForecast.list[i].dt*1000).getHours() == 15 && new Date(weatherForecast.list[i].dt*1000).getDate() != new Date().getDate()) {
                            $scope.page.forecast[forecastCount] = { datetime : weatherForecast.list[i].dt, cod: weatherForecast.list[i].weather[0].icon, temp: weatherForecast.list[i].main.temp, sky: weatherForecast.list[i].weather[0].main, description: weatherForecast.list[i].weather[0].description, temp_min: weatherForecast.list[i].main.temp_min, temp_max:weatherForecast.list[i].main.temp_max };
                            forecastCount++;
                        }
                        if (forecastCount==3) {
                            break;
                        }
                    }

                    for (var i = 0; i < weatherForecast.list.length; i++) {
                        $scope.page.timeforecast[timeForecastCount] = { datetime : weatherForecast.list[i].dt, cod: weatherForecast.list[i].weather[0].icon, temp: weatherForecast.list[i].main.temp, sky: weatherForecast.list[i].weather[0].main, description: weatherForecast.list[i].weather[0].description, temp_min: weatherForecast.list[i].main.temp_min, temp_max:weatherForecast.list[i].main.temp_max };
                        timeForecastCount++;

                        if (timeForecastCount==5) {
                            break;
                        }
                    }

                    var date = new Date();

                    $scope.page.day = getDayString(date);
                    $scope.page.time = getTimeString(date);

                    console.log($scope.page);

                    buildDOM();
                    document.getElementById('loader').style.display = 'none';
                });

            });
        }, function(reason) {
            run();
        });

    }

    function buildDOM(){
        //Clear Nodes
        angular.element( document.querySelector( '#header' ) ).empty();
        angular.element( document.querySelector( '#weather' ) ).empty();
        angular.element( document.querySelector( '#forecast' ) ).empty();
        angular.element( document.querySelector( '#time' ) ).empty();

        //Slider Home
        var header = angular.element( document.querySelector( '#header' ) );
        header.append('<p>'+$scope.page.name+'</p><p>'+$scope.page.day+', '+$scope.page.time+'</p>');

        var weather = angular.element( document.querySelector( '#weather' ) );
        weather.append('<p class="weather '+settingsService.getSettings().units+'">'+Math.round($scope.page.temp.temp)+'</p><img class="weather-image" src="/img/'+$scope.page.temp.cod+'.png" />');
        //weather.append('<p class="weather">'+Math.round($scope.page.temp.temp)+'</p><img class="weather-image" src="/img/01n.png" />');
        //weather.append('<p class="weather metric">-18</p><img class="weather-image" src="/img/13n.png" />');

        var forecast = angular.element( document.querySelector( '#forecast' ) );
        for (var i = 0; i < $scope.page.forecast.length; i++) {
            var date = new Date(parseInt($scope.page.forecast[i].datetime)*1000);
            forecast.append('<p class="forecast">'+getDayString(date)+' <span class="weather-icon">'+getIcon($scope.page.forecast[i].cod).cod+'</span> '+Math.round($scope.page.forecast[i].temp_min)+'º / '+Math.round($scope.page.forecast[i].temp_max)+'º</p>');
        }

        //Slider Time
        $scope.weatherStyle = {'background' : 'linear-gradient('+getIcon($scope.page.temp.cod).color+', #181818)'};

        var forecast = angular.element( document.querySelector( '#time' ) );
        for (var i = 0; i < $scope.page.timeforecast.length; i++) {
            var date = new Date(parseInt($scope.page.timeforecast[i].datetime)*1000);
            var timeTable='';
            timeTable+='<div class="vertical-dash">&nbsp;</div>';
            timeTable+='<div class="row"><div class="col col-20 col-offset-10">';
            timeTable+='<p class="hour">'+getTimeString(date)+'</p>';
            timeTable+='<p class="day">'+getDayString(date)+'</p>';
            timeTable+='</div><div class="col col-20">';
            timeTable+='<p class="icon">'+getIcon($scope.page.timeforecast[i].cod).cod+'</p>';
            timeTable+='</div><div class="col col-50">';
            timeTable+='<p class="title">'+$scope.page.timeforecast[i].sky+'</p>';
            timeTable+='<p class="temp">'+Math.round($scope.page.timeforecast[i].temp)+'º</p>';
            timeTable+='<p class="desc">'+$scope.page.timeforecast[i].description+'</p>';

            if (i == $scope.page.timeforecast.length-1) {
                timeTable+='<div class="filler"></div>';
            }

            timeTable+='</div></div>';

            forecast.append(timeTable);
        }
        var dash ='<div class="vertical-dash">&nbsp;</div>';
        forecast.append(dash);

        //Settings
        var settings = angular.element( document.querySelector( '#settings' ) );
        settings.append('');
    }

    $scope.changeUnits = function(units){
        settingsService.setUnits(units);
        $scope.update();
    }

    function getIcon(cod){
        var output = {cod : '', color: ''};
        switch (cod) {
            case '01d':
                output.cod = 'A';
                output.color = '#64404a';
                return(output);
                break;
            case '02d':
                output.cod = 'C';
                output.color = '#422e34';
                return(output);
                break;
            case '03d':
                output.cod = 'O';
                output.color = '#464646';
                return(output);
                break;
            case '04d':
                output.cod = 'P';
                output.color = '#464646';
                return(output);
                break;
            case '09d':
                output.cod = 'R';
                output.color = '#2c4246';
                return(output);
                break;
            case '10d':
                output.cod = 'S';
                output.color = '#422e34';
                return(output);
                break;
            case '11d':
                output.cod = 'U';
                output.color = '#090909';
                return(output);
                break;
            case '13d':
                output.cod = 'W';
                output.color = '#2a2a2a';
                return(output);
                break;
            case '50d':
                output.cod = 'N';
                output.color = '#2a2a2a';
                return(output);
                break;
            case '01n':
                output.cod = 'I';
                output.color = '#332347';
                return(output);
                break;
            case '02n':
                output.cod = 'J';
                output.color = '#2f233d';
                return(output);
                break;
            case '03n':
                output.cod = 'O';
                output.color = '#464646';
                return(output);
                break;
            case '04n':
                output.cod = 'P';
                output.color = '#464646';
                return(output);
                break;
            case '09n':
                output.cod = 'R';
                output.color = '#2c4246';
                return(output);
                break;
            case '10n':
                output.cod = 'K';
                output.color = '#2f233d';
                return(output);
                break;
            case '11n':
                output.cod = 'U';
                output.color = '#090909';
                return(output);
                break;
            case '13n':
                output.cod = 'W';
                output.color = '#2a2a2a';
                return(output);
                break;
            case '50n':
                output.cod = 'N';
                output.color = '#2a2a2a';
                return(output);
                break;
            default:
                output.cod = '';
                output.color = '';
                return(output);
                break;
        }
    }

    function getTimeString(date){
        return ("0" + date.getHours()).slice(-2)+':'+("0" + date.getMinutes()).slice(-2);
    }

    function getDayString(datemili){
        var date = datemili.getDay();
        switch (date) {
            case 0:
                return('SUN');
                break;
            case 1:
                return('MON');
                break;
            case 2:
                return('TUE');
                break;
            case 3:
                return('WED');
                break;
            case 4:
                return('THU');
                break;
            case 5:
                return('FRI');
                break;
            case 6:
                return('SAT');
                break;
            default:
                return('');
                break;
        }
    }

    function getWeatherForecast(){
        return $q(function(resolve,reject){
            setTimeout(function(){
                $http.get('http://api.openweathermap.org/data/2.5/forecast?lat='+$scope.page.lat+'&lon='+$scope.page.long+'&APPID=8db70fe1e75c0332d8bf87c9adcf0820&units='+settingsService.getSettings().units)
                .success(function (response) {
                    resolve(response);
                }).error(function(response){
                    alert("# Error getting actual weather");
                });
            }, 100);
        });
    }

    function getWeather(){
        return $q(function(resolve,reject){
            setTimeout(function(){
                $http.get('http://api.openweathermap.org/data/2.5/weather?lat='+$scope.page.lat+'&lon='+$scope.page.long+'&APPID=8db70fe1e75c0332d8bf87c9adcf0820&units='+settingsService.getSettings().units)
                .success(function (response) {
                    resolve(response);
                }).error(function(response){
                    alert("# Error getting actual weather");
                });
            }, 100);
        });
    }

    function getCoordinates(){
        return $q(function(resolve,reject){
            setTimeout(function(){
                var coordinates = {lat:0,long:0};
                var posOptions = {timeout: 10000, enableHighAccuracy: false};
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (position) {
                        coordinates.lat  = position.coords.latitude;
                        coordinates.long = position.coords.longitude;
                        resolve(coordinates);
                    }, function(err) {
                        console.log("# Error getting coordinates");
                });
            }, 100);
        });
    }

}]);
