weatherapp.service('settingsService',['$localStorage', function($localStorage) {

    return {
        getUnits : function(){
            return $localStorage.units;
        },
        getSettings : function() {
            return $localStorage.settings;
        },
        setSettings : function(settings) {
            $localStorage.settings = settings;
        },
        setUnits : function(units){
            $localStorage.settings.units = units;
        }
    }

}]);

weatherapp.service('weatherService',['$localStorage','$http','$q','$cordovaGeolocation', function($localStorage,$http,$q,$cordovaGeolocation) {

    return {

            getSettings : function() {
                return $localStorage.settings;
            },
            setSettings : function(settings) {
                $localStorage.settings = settings;
            }
        }

}]);
