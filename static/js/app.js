'use strict';

var myApp = angular.module('myApp', ['ngRoute', 'ui.bootstrap']);

myApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/', {
				templateUrl: '/static/partials/home.html',
			}).
			when('/pca', {
				templateUrl: '/static/partials/pca.html',
			}).
			otherwise({
				redirectTo: '/'
			});
	}
]);
