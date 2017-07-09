myApp.directive('pcaPlot', function($parse) {
	return {
		restrict: 'EA',
		replace: false,
		scope: {pdf: '='},
		link: function(scope, element, attrs) {
			scope.$watch('pdf', function(new_pdf, old_pdf) {

				if (!window.requestAnimationFrame) {
				    window.requestAnimationFrame = (function() {
					    return window.webkitRequestAnimationFrame ||
					        window.mozRequestAnimationFrame ||
					        window.oRequestAnimationFrame ||
					        window.msRequestAnimationFrame ||
					        function(callback, element) {
					            window.setTimeout(callback, 1000 / 60);
					        };
				    })();
				}

				if (scope.pdf) {

					PDFJS.disableStream = true;

					PDFJS.getDocument(new_pdf).then(function(pdf) {

						var pageNumber = 1;

						pdf.getPage(pageNumber).then(function(page) {

							var scale = 1;
							var viewport = page.getViewport(scale);

							var context = element[0].getContext('2d');

							context.canvas.width = 700;
							context.canvas.height = 700;

							var renderContext = {
								canvasContext: context,
								viewport: viewport
							};

							page.render(renderContext);

						});

					});
				}

			});
		}
	}
	

});

myApp.controller('PCAController', ['$scope', '$http', 
	
	function($scope, $http) {

		$scope.plots = '../plots/';
		$scope.pdf = $scope.plots + 'all_epi_PC1_PC2.pdf';

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

		var factor_map = {
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

		$scope.factors = {
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

		var display_1kg_map = {
			'"1KG"': '"1KG"',
			'Population': 'pop',
			'Super-population': 'super_pop'
		};

		$scope.display_1kg = {
			selected: '"1KG"',
			options: [
				'"1KG"',
				'Population',
				'Super-population'
			]
		};

		$scope.colors = {
			used: [],
			available: [
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
            ]
		};

	}
]);
