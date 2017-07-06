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

myApp.directive('pcaPlot', function($parse) {
	return {
		restrict: 'E',
		replace: false,
		scope: {data: '=', xlabel: '=', ylabel: '='},
		link: function(scope, element, attrs) {

			var width = 800,
				height = 800,
				padding = 40;

			var margins = {
				top: 20,
				bottom: 20,
				left: 20,
				right: 20
			};

			//d3.select(element[0])
			 // .append('div')
			  //.classed('svg-container', true);

			var svg = d3.select(element[0])
						.append('div')
						.classed('svg-container', true)
						.append('svg')
						.attr('preserveAspectRatio', 'xMidYMid meet')
						.attr('viewBox', '0 0 ' + width.toString() + ' ' + height.toString())
						.classed('svg-content', true);

			var tooltip = d3.select(element[0])
							.select('.svg-container')
						    .append('div')
							.attr('class', 'tooltip')
							.style('opacity', 0);

			var scaled_width = $('pca-plot>.svg-container>svg').width();
			var scaled_height = $('pca-plot>.svg-container>svg').height();


			scope.$watch('data', function(new_data, old_data) {

				if (new_data) {

					svg.selectAll('*').remove();

					var xextent = d3.extent(new_data, function(d) { return d.x; });
					var yextent = d3.extent(new_data, function(d) { return d.y; });

					var xscale = d3.scaleLinear()
					               .domain([xextent[0]*1.1, xextent[1]*1.1])
					               .range([padding, width - padding]);

					var yscale = d3.scaleLinear()
							  	   .domain([yextent[0]*1.1, yextent[1]*1.1])
								   .range([height - padding, padding]);

					var xaxis = d3.axisBottom(xscale)
								  .tickSizeOuter(0)
					              .ticks(5)
					              .tickFormat(d3.format('.2f'));

					var yaxis = d3.axisLeft(yscale)
								  .tickSizeOuter(0)
								  .ticks(5)
								  .tickFormat(d3.format('.2f'));

					svg.append('text')
					   .attr('class', 'axis-label')
					   .attr('text-anchor', 'right')
					   .attr('x', width - padding * 0.5)
					   .attr('y', height - padding * 0.9)
					   .text(scope.xlabel);

					svg.append('text')
					   .attr('class', 'axis-label')
					   .attr('text-anchor', 'left')
					   .attr('x', padding * 0.5)
					   .attr('y', padding * 0.5)
					   .text(scope.ylabel);
					   
					svg.append('g')
					   .attr('class', 'axis')
					   .attr('transform', 'translate(0,' + (height - padding) + ')')
					   .call(xaxis);

					svg.append('g')
					   .attr('class', 'axis')
					   .attr('transform', 'translate(' + padding + ',0)')
					   .call(yaxis);


					svg.selectAll('circle')
					   .data(new_data)
					   .enter()
					   .append('circle')
					   .attr('r', 2.5)
					   .attr('cx', function(d) { return xscale(d.x); })
					   .attr('cy', function(d) { return yscale(d.y); })
					   .on('mouseover', function(d) {

					   		var text = [
					   			'Sample: ' + d.sample,
					   			'Cohort: ',
					   			'Phenotype: ',
					   			scope.xlabel + ': ' + d3.format('.3f')(d.x),
					   			scope.ylabel + ': ' + d3.format('.3f')(d.y)
					   		].join('<br>');

					   		tooltip.transition()
					   			   .duration(100)
					   			   .style('opacity', 1.0);

					   		tooltip.html(text)
					   			   .style('left', d3.mouse(this)[0]*scaled_width/width + 'px')
					   			   .style('top', ((d3.mouse(this)[1]*scaled_height/height) - 75) + 'px');

					   })
					   .on('mouseout', function(d) {

					   		tooltip.transition()
					   			   .duration(100)
					   			   .style('opacity', 0.0);

					   });
				}
			});
		}
	};
});

myApp.controller('PCAController', ['$scope', '$http', 
	
	function($scope, $http) {
		
		$scope.sample_set = {
			selected: 'all_epi',
			options: [
				'all_epi',
				'all_epi_1kg'
			]
		};

		$scope.colors = {
			selected: 'Case/control',
			options: [
				'Case/control',
				'Batch'
			]
		};

		$scope.x_pcs = {
			selected: 'PC1',
			options: [
				'PC1',
				'PC2',
				'PC3',
				'PC4',
				'PC5',
				'PC6',
				'PC7',
				'PC8',
				'PC9',
				'PC10'
			]
		};

		$scope.y_pcs = {
			selected: 'PC2',
			options: [
				'PC1',
				'PC2',
				'PC3',
				'PC4',
				'PC5',
				'PC6',
				'PC7',
				'PC8',
				'PC9',
				'PC10'
			]
		};

		$scope.response = [];

		function reset_data($scope) {
			return $scope.response.filter(function(row) {
				return (row.sample_set === $scope.sample_set.selected);
			}).map(function(row) {
				return {
					'sample': row.sample,
					'x': row[$scope.x_pcs.selected],
					'y': row[$scope.y_pcs.selected]
				};
			});
		}

		$http({
			method: 'GET',
			url: '/data/pca'
		}).then(function(response) {
			$scope.response = response.data;
			$scope.pcaData = reset_data($scope);
		});

		$scope.$watch('sample_set.selected', function() {
			$scope.pcaData = reset_data($scope);
		});

		$scope.$watch('colors.selected', function() {
			$scope.pcaData = reset_data($scope);
		});

		$scope.$watch('x_pcs.selected', function() {
			$scope.pcaData = reset_data($scope);
		});

		$scope.$watch('y_pcs.selected', function() {
			$scope.pcaData = reset_data($scope);
		});

	}
]);
