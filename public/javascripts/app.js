'use strict';

var app = angular.module('app', [
		'ngRoute',
		'ngCookies',
		'ngResource',
		'ui.calendar',
		'ngMaterial',
		'mdDatetime'
	]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when("/", {
			templateUrl: "partials/index.html"
		}).
		when("/rooms", {
			templateUrl: "partials/rooms.html",
			controller: "RoomsCtrl"
		}).
		when("/rooms/:roomId", {
			templateUrl: "partials/rooms-view.html",
			controller: "RoomCtrl"
		}).
		otherwise({
			redirectTo: '/'
		});
	}]);

app.run(function($rootScope, $location) {
	$rootScope.$location = $location;
})

app.config(function($mdThemingProvider) {
	$mdThemingProvider.theme("success-toast");
	$mdThemingProvider.theme("error-toast");
});

app.controller('RoomsCtrl', function($scope, $rootScope, $http, $mdToast) {
	$scope.equipements = [];
	$scope.capacities = [];

    $scope.reset = function() {
    	$rootScope.searchActive = false;
    	$rootScope.startDate = new Date();
    	$rootScope.start = new Date();
    	$rootScope.end = new Date();

    	$scope.startDate = new Date();
    	$scope.start = new Date();
    	$scope.end = new Date();

		$scope.loading = true;

    	$http({
		  method: 'GET',
		  url: '/rooms'
		}).then(function successCallback(response) {
		    $scope.rooms = response.data;
		    $scope.equipements = [];
	    	$scope.capacities = [];

		    $scope.rooms.forEach(function(room) {
		    	var finded = false;

	    		$scope.capacities.forEach(function(capacity) {
	    			if (capacity.value === room.capacity) {
	    				finded = true;
	    			}
	    		});

	    		if (finded === false) {
	    			$scope.capacities.push({
		    			'value': room.capacity,
		    			'selected': false
		    		})
	    		}

		    	room.equipements.forEach(function(equipement) {
		    		var finded = false;

		    		$scope.equipements.forEach(function(searchEquipement) {
		    			if (searchEquipement.name === equipement.name) {
		    				finded = true;
		    			}
		    		})

		    		if (finded === false) {
		    			$scope.equipements.push({
			    			'name': equipement.name,
			    			'selected': false
			    		})
		    		}
		    	});
		    });

		    $scope.loading = false;
		}, function errorCallback(response) {
		    console.log(response);
		    $scope.loading = false;
		});
    }

	$scope.searchForRooms = function() {
		if (!$scope.start || !$scope.end) {
			return
		}

		$scope.loading = true;

		var start = new Date($scope.startDate);
		start.setHours($scope.start.getHours());
		start.setMinutes($scope.start.getMinutes());
		start.setSeconds(0);
		
		var end = new Date($scope.startDate);
		end.setHours($scope.end.getHours());
		end.setMinutes($scope.end.getMinutes());
		end.setSeconds(0);

		$http({
		  method: 'POST',
		  url: '/rooms/search',
		  data: {
		  	start: start,
		  	end: end
		  }
		}).then(function successCallback(response) {
			if (response.data.err) {
				var toast = $mdToast.simple()
			      .textContent(response.data.err)
			      .action('Close')
			      .highlightAction(true)
			      .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
			      .position('bottom right');

			    $mdToast.show(toast);

			    $scope.loading = false;
			} else {
				$scope.rooms = response.data;
				$scope.equipements = [];
	    		$scope.capacities = [];

	    		$rootScope.searchActive = true;
	    		$rootScope.startDate = $scope.startDate;
			    $rootScope.start = $scope.start;
			    $rootScope.end = $scope.end;

			    $scope.rooms.forEach(function(room) {
			    	var finded = false;

		    		$scope.capacities.forEach(function(capacity) {
		    			if (capacity.value === room.capacity) {
		    				finded = true;
		    			}
		    		})

		    		if (finded === false) {
		    			$scope.capacities.push({
			    			'value': room.capacity,
			    			'selected': false
			    		})
		    		}

			    	room.equipements.forEach(function(equipement) {
			    		var finded = false;

			    		$scope.equipements.forEach(function(searchEquipement) {
			    			if (searchEquipement.name === equipement.name) {
			    				finded = true;
			    			}
			    		})

			    		if (finded === false) {
			    			$scope.equipements.push({
				    			'name': equipement.name,
				    			'selected': false
				    		})
			    		}
			    	})
			    });

			    $scope.loading = false;
			}
		}, function errorCallback(response) {
		    console.log(response);
		    $scope.loading = false;
		});
	}

	if ($rootScope.startDate && $rootScope.startDate !== null) {
    	$scope.startDate = $rootScope.startDate;
    	$scope.start = $rootScope.start;
    	$scope.end = $rootScope.end;
    } else {
    	$scope.startDate = new Date();
    	$scope.start = new Date();
    	$scope.end = new Date();
    }

    if ($rootScope.searchActive) {
    	$scope.searchForRooms();
    } else {
    	$scope.reset();
    }

	$scope.handleChange = function(which) {
        $scope.start = new Date($scope.start)
        $scope.end = new Date($scope.end)
    };

	$scope.toggleFilter = function(filter) {
		filter.selected = !filter.selected;
		$scope.performSearch();
	}

	$scope.performSearch = function(room) {
		var isEquipementOk = true;

		if (room && $scope.equipements && $scope.equipements.length) {
			$scope.equipements.forEach(function(equipement) {
				if (equipement.selected === true) {
					var finded = false;

					room.equipements.forEach(function(searchingEquipement) {
						if (searchingEquipement.name === equipement.name) {
							finded = true;
						}
					})

					if (finded === false) {
						isEquipementOk = false;
					}
				}
			});
		}

		var isCapacitiesOk = true;

		if (room && $scope.capacities && $scope.capacities.length) {
			var finded = false;
			var selected = false;

			$scope.capacities.forEach(function(capacity) {
				if (capacity.selected === true) {
					selected = true;
					if (room.capacity === capacity.value) {
						finded = true;
					}
				}
			});

			if (selected === true && finded === false) {
				isCapacitiesOk = false;
			}
		}

		return isEquipementOk && isCapacitiesOk;
	};
});

app.controller('RoomCtrl', function($scope, $rootScope, $routeParams, $http, $mdToast) {
	var roomId = $routeParams.roomId;

	$scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        timezone: 'local',
        header:{
          left: 'month agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        }
      }
    };

    $scope.eventSources = [];

    if ($scope.startDate && $scope.startDate !== null) {
    	$scope.startDate = $rootScope.startDate;
    	$scope.start = $rootScope.start;
    	$scope.end = $rootScope.end;
    } else {
    	$scope.startDate = new Date();
    	$scope.start = new Date();
    	$scope.end = new Date();
    }

	$http({
	  method: 'GET',
	  url: '/rooms/' + roomId
	}).then(function successCallback(response) {
	    $scope.room = response.data;
	    
	    $http({
		  method: 'GET',
		  url: '/reservations/' + roomId
		}).then(function successCallback(response) {
		    $scope.room.reservations = response.data;
		    $scope.eventSources.push(response.data)
		}, function errorCallback(response) {
		    console.log(response);
		});
	}, function errorCallback(response) {
	    console.log(response);
	});

	$scope.sendReservation = function() {
		if (!$scope.start || !$scope.end) {
			return
		}

		$scope.start = new Date($scope.start);
        $scope.end = new Date($scope.end);

		var start = new Date($scope.startDate);
		start.setHours($scope.start.getHours());
		start.setMinutes($scope.start.getMinutes());
		start.setSeconds(0);
		
		var end = new Date($scope.startDate);
		end.setHours($scope.end.getHours());
		end.setMinutes($scope.end.getMinutes());
		end.setSeconds(0);

		$http({
		  method: 'POST',
		  url: '/reservations/',
		  data: {
		  	roomId: roomId,
		  	start: start,
		  	end: end
		  }
		}).then(function successCallback(response) {
	    	if (response.data.err) {
	    		var toast = $mdToast.simple()
			      .textContent(response.data.err)
			      .action('Close')
			      .highlightAction(true)
			      .position('bottom right')
			      .theme("error-toast");

			    $mdToast.show(toast).then();
	    	} else {
	    		$scope.start = new Date();
				$scope.end = new Date();

				$rootScope.searchActive = false;
				$rootScope.startDate = new Date();
				$rootScope.start = new Date();
				$rootScope.end = new Date();

				if ($scope.eventSources[0].length === 0) {
					$scope.eventSources[0] = [response.data.reservation]
				} else {
					$scope.eventSources[0].push(response.data.reservation)
				}

				var toast = $mdToast.simple()
			      .textContent('Room successfully booked.')
			      .action('Close')
			      .highlightAction(true)
			      .position('bottom right')
			      .theme("success-toast");

			    $mdToast.show(toast);
	    	}
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	$scope.handleChange = function(which) {
        $scope.start = new Date($scope.start)
        $scope.end = new Date($scope.end)
    };
});