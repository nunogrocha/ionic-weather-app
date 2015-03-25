weatherapp.service('settingsService',['$localStorage', function($localStorage) {

    return {
        //get available units from localstorage variable
        getUnits : function(){
            return $localStorage.units;
        },
        //get all the settings from localstorage variable
        getSettings : function() {
            return $localStorage.settings;
        },
        //set units in the settings localstorage variable
        setUnits : function(units){
            $localStorage.settings.units = units;
        }
    }

}]);

weatherapp.service('weatherService',['$localStorage','$http','$q','$cordovaGeolocation', function($localStorage,$http,$q,$cordovaGeolocation) {

    return {
            //get weather 5 day/3 hour forecast from openweatherapi with 100ms timeout
            //resolves to a $q promise
            getWeatherForecast : function(lat,long,units){
                return $q(function(resolve,reject){
                    setTimeout(function(){
                        $http.get('http://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+long+'&APPID=8db70fe1e75c0332d8bf87c9adcf0820&units='+units)
                        .success(function (response) {
                            resolve(response);
                        }).error(function(response){
                            alert("# Error get weather forecast");
                        });
                    }, 100);
                });
            },
            //get actual coordinates from ngCordova's $cordovaGeolocation with 100ms timeout
            //resolves to a $q promise
            getCoordinates : function(){
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
                                console.log("# Error get coordinates");
                        });
                    }, 100);
                });
            },
            //get actual weather from openweatherapi with 100ms timeout
            //resolves to a $q promise
            getWeather : function(lat,long,units){
                return $q(function(resolve,reject){
                    setTimeout(function(){
                        $http.get('http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+long+'&APPID=8db70fe1e75c0332d8bf87c9adcf0820&units='+units)
                        .success(function (response) {
                            resolve(response);
                        }).error(function(response){
                            console.log("# Error get weather");
                        });
                    }, 100);
                });
            }
        }

}]);
