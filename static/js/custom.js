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

			var colors = [
				[31, 119, 180], 
				[174, 199, 232], 
				[255, 127, 14], 
				[255, 187, 120],  
             	[44, 160, 44], 
             	[152, 223, 138], 
             	[214, 39, 40], 
             	[255, 152, 150],  
             	[148, 103, 189], 
             	[197, 176, 213], 
             	[140, 86, 75], 
             	[196, 156, 148],  
             	[227, 119, 194], 
             	[247, 182, 210], 
             	[127, 127, 127],
              	[199, 199, 199],  
             	[188, 189, 34], 
             	[219, 219, 141],
              	[23, 190, 207], 
             	[158, 218, 229]
             ];

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

					svg.selectAll('*')
					   .remove();

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

					var legend = svg.append('g')
								    .attr('class', 'legend');
								    //.attr('height', 400)
								    //.attr('width', 400)
								    //.attr('x', 400)
								    //.attr('y', 400);

					legend.selectAll('circle')
						  .data(colors)
						  .enter()
						  .append('circle')
						  .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')')
						  //.attr('x', 600)
						  //.attr('y', function(d, i) { return i*20; })
						  .attr('width', 10)
						  .attr('height', 10)
						  .style('fill', function(d) {
						      return d3.rgb(d[0], d[1], d[2]);
						  });

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
					   .style('fill', function(d) { 
					   		return d3.color(d3.rgb(colors[d.color][0], colors[d.color][1], colors[d.color][2])); 
					   	})
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

		var sample_set_map = {
			'All Epi25': 'all_epi',
			'All Epi25 + 1KG': 'all_epi_1kg'
		}
		
		$scope.sample_set = {
			selected: 'All Epi25',
			options: [
				'All Epi25',
				'All Epi25 + 1KG'
			]
		};

		var color_map = {
			'Capture Set': 'capture_set',
			'Case/control': 'case_control',
			'Cohort': 'cohort',
			'Epilepsy Subtype': 'epilepsy_subtype',
			'Fingerprint Gender': 'fingerprint_gender',
			'Primary Disease': 'primary_disease',
			'Batch': 'project',
			'Project Name': 'project_name',
			'Reported Gender': 'reported_gender'
		};

		$scope.colors = {
			selected: 'Case/control',
			options: [
				'Capture Set',
				'Case/control',
				'Epilepsy Subtype',
				'Fingerprint Gender',
				'Reported Gender',
				'Primary Disease',
				'Batch',
				'Project Name'
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

		$scope.display_1kg = {
			selected: '"1KG"',
			options: [
				'1KG',
				'pop',
				'super_pop'
			]
		};

		//$scope.rawData = [];
		//$scope.colorLevels = [];

		/*function reset_data() {
			$scope.pcaData = $scope.rawData.filter(function(row) {
				return (row.sample_set === sample_set_map[$scope.sample_set.selected]);
			}).map(function(row) {
				var c = $scope.colorLevels[color_map[$scope.colors.selected]].indexOf(row[color_map[$scope.colors.selected]]);
				if (c == -1) {
					console.log(row);
					var c = 19;
				}
				return {
					'sample': row.sample,
					'x': row[$scope.x_pcs.selected],
					'y': row[$scope.y_pcs.selected],
					'color': $scope.colorLevels[color_map[$scope.colors.selected]].indexOf(row[color_map[$scope.colors.selected]])
				};
			});
		}*/

		function reset_data() {
			$http({
				method: 'GET',
				url: '/data/pca',
				params: {
					'sample_set': sample_set_map[$scope.sample_set.selected],
					'color': color_map[$scope.colors.selected],
					'x': $scope.x_pcs.selected,
					'y': $scope.y_pcs.selected,
					'display_1kg': $scope.display_1kg.selected
				}
			}).then(function(response) {
				$scope.pcaData = response.data.results.map(function(row) {
					return {
						'sample': row['sample'],
						'x': row['x'],
						'y': row['y'],
						'color': response.data.levels.indexOf(row.color)
					};
				});
			})
		}

		/*$http({
			method: 'GET',
			url: '/data/sample_factor_levels'
		}).then(function(response) {
			$scope.colorLevels = response.data;
		}).then(function() {
			reset_data();
		});*/

		/*$http({
			method: 'GET',
			url: '/data/pca',
		}).then(function(response) {
			$scope.rawData = response.data;
			console.log($scope.rawData);
			reset_data();
		});*/

		$scope.$watchGroup(['sample_set.selected', 'colors.selected', 'x_pcs.selected', 'y_pcs.selected', 'display_1kg'], function() {
			reset_data();
		})

	}
]);
