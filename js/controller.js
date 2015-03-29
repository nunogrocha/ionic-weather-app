/*********************************************************************************************
*
*      Home Controller
*      Wrapper controller for home.html
*
*********************************************************************************************/

var homeController = angular.module('homeController', []);

homeController.controller('homeControllerWrapper', ['$scope','$rootScope','$q','$cordovaGeolocation','$http','weatherService','settingsService',
    function($scope,$rootScope,$q,$cordovaGeolocation,$http,weatherService,settingsService) {

    //$scope.page stores all the data from the controller
    //Starts off with empty/dummy data that gets inserted/changed with service data on run()
    $scope.page = {day: 'Today', time:'Today', name: 'Home', title:'Home', lat: 0, long: 0, temp: [], forecast:[], timeforecast:[]};

    //$scope.slideIndex choses the starting slide
    $scope.slideIndex = 1;

    //run the boot function
    run();

    //$scope.update runs when an ng-change occurs
    $scope.update = function(){
        run();
    }

    //boot function that runs all the services to fill $scope.page
    function run(){

        //gets the coordinates
        var promiseCoordinates = weatherService.getCoordinates();
        promiseCoordinates.then(function(coordinates) {

            $scope.page.lat = coordinates.lat;
            $scope.page.long = coordinates.long;

            //gets the actual weather
            var promiseWeather = weatherService.getWeather($scope.page.lat,$scope.page.long,settingsService.getSettings().units);
            promiseWeather.then(function(weather) {
                $scope.page.name = weather.name;
                $scope.page.temp = {temp: weather.main.temp, cod: weather.weather[0].icon, sky: weather.weather[0].main, description: weather.weather[0].description, temp_min: weather.main.temp_min, temp_max: weather.main.temp_max};

                //gets the weather forecast
                var promiseWeatherForecast = weatherService.getWeatherForecast($scope.page.lat,$scope.page.long,settingsService.getSettings().units);
                promiseWeatherForecast.then(function(weatherForecast) {
                    var forecastCount=0;
                    var timeForecastCount=0;

                    //check the forecast to store the 'next 3 days forecast' on the default slide
                    //only stores the forecast when the date is different from today and the time is between 12h and 18h
                    //this interval is only an example, as OWM returns forecasts in 3h intervals
                    for (var i = 0; i < weatherForecast.list.length; i++) {
                        if (new Date(weatherForecast.list[i].dt*1000).getHours() > 13 && new Date(weatherForecast.list[i].dt*1000).getHours() < 17 && new Date(weatherForecast.list[i].dt*1000).getDate() != new Date().getDate()) {
                            $scope.page.forecast[forecastCount] = { datetime : weatherForecast.list[i].dt, cod: weatherForecast.list[i].weather[0].icon, temp: weatherForecast.list[i].main.temp, sky: weatherForecast.list[i].weather[0].main, description: weatherForecast.list[i].weather[0].description, temp_min: weatherForecast.list[i].main.temp_min, temp_max:weatherForecast.list[i].main.temp_max };
                            forecastCount++;
                        }
                        if (forecastCount==3) {
                            break;
                        }
                    }

                    //check the forecast to store the 'next 5 3h intervals' on the right side slide wich has more detailed info
                    for (var i = 0; i < weatherForecast.list.length; i++) {
                        $scope.page.timeforecast[timeForecastCount] = { datetime : weatherForecast.list[i].dt, cod: weatherForecast.list[i].weather[0].icon, temp: weatherForecast.list[i].main.temp, sky: weatherForecast.list[i].weather[0].main, description: weatherForecast.list[i].weather[0].description, temp_min: weatherForecast.list[i].main.temp_min, temp_max:weatherForecast.list[i].main.temp_max };
                        timeForecastCount++;
                        if (timeForecastCount==5) {
                            break;
                        }
                    }

                    //gets the actual date and sends it to functions that return the right format to write on the DOM
                    var date = new Date();
                    $scope.page.day = getDayString(date);
                    $scope.page.time = getTimeString(date);

                    //shows all the controller data on the console
                    console.log($scope.page);

                    //build the DOM with the data from $scope.page
                    buildDOM();

                    //hide the loading animation
                    document.getElementById('loader').style.display = 'none';
                });

            });
        }, function(reason) {
            //if an error occurs, try again
            run();
        });

    }

    //builds the DOM with data from $scope.page
    function buildDOM(){
        //Clear Nodes
        angular.element( document.querySelector( '#header' ) ).empty();
        angular.element( document.querySelector( '#weather' ) ).empty();
        angular.element( document.querySelector( '#forecast' ) ).empty();
        angular.element( document.querySelector( '#time' ) ).empty();

        //Slider Home
        buildHomeDOM();

        //Slider Forecast
        buildForecastDOM();
    }

    //build the home slide
    //separated in 3 containers in the order they show up vertically
    function buildHomeDOM(){
      //inserts the actual place, day and time
      var header = angular.element( document.querySelector( '#header' ) );
      header.append('<p>'+$scope.page.name+'</p><p>'+$scope.page.day+', '+$scope.page.time+'</p>');

      //inserts the actual weather and the background image
      var weather = angular.element( document.querySelector( '#weather' ) );
      weather.append('<p class="weather '+settingsService.getSettings().units+'">'+Math.round($scope.page.temp.temp)+'</p><img class="weather-image" src="/img/'+$scope.page.temp.cod+'.png" />');

      //inserts the 3 day forecast
      var forecast = angular.element( document.querySelector( '#forecast' ) );
      console.log($scope.page.forecast.length);
      for (var i = 0; i < $scope.page.forecast.length; i++) {
          var date = new Date(parseInt($scope.page.forecast[i].datetime)*1000);
          forecast.append('<p class="forecast">'+getDayString(date)+' <span class="weather-icon">'+getIcon($scope.page.forecast[i].cod).cod+'</span> '+Math.round($scope.page.forecast[i].temp_min)+'º / '+Math.round($scope.page.forecast[i].temp_max)+'º</p>');
      }
    }

    //build the forecast slide
    //has 1 container
    function buildForecastDOM(){
      //background gradient changes color depending on the actual weather
      $scope.weatherStyle = {'background' : 'linear-gradient('+getIcon($scope.page.temp.cod).color+', #181818)'};

      //creates the 5 forecast entries
      //at the top of each forecast there is a vertical dash
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

      //creates the vertical dash on the bottom of the last forecast
      var dash ='<div class="vertical-dash">&nbsp;</div>';
      forecast.append(dash);
    }

    //function that runs when a click occurs on the settings page changing the units
    //updates the data after setting the units
    $scope.changeUnits = function(units){
        settingsService.setUnits(units);
        $scope.update();
    }

}]);

/*********************************************************************************************
*
*      Global Functions
*
*********************************************************************************************/

//function that returns a color and a letter to use with the weather icon font
//the cod is sent by openweathermap and gets converted to Weather&Time.tff matching icon
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

//function that recives a date and returnes a formated date in the format HH:MM
function getTimeString(date){
    return ("0" + date.getHours()).slice(-2)+':'+("0" + date.getMinutes()).slice(-2);
}

//function that recives a date and returnes a corresponding week day MON, TUE, WED, etc.
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
