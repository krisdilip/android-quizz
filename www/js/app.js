// Ionic Quizz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// the 2nd parameter is an array of 'requires'
var app = angular.module('quiz', ['ionic'])

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    } 
  });
})

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/0/0');

    $stateProvider		
        .state('/', {
            url: '/',
            templateUrl: 'partials/quiz.html',
			controller: 'QuizCtrl'
        })
		.state('/:topicIndex/:Id', {
            url:'/:topicIndex/:Id',
            templateUrl: 'partials/quiz.html',
            controller: 'QuizCtrl'
        });
}]);

app.controller('QuizCtrl', function($scope, $stateParams, $rootScope){

	$scope.data = {};

	var randomArray = [];
	
	//Create array of 100 numbers
	createArray = function(i){
		var array =[];
		for(var k=0; k<i; k++){
			array.push(k);
		};
		return array;
	};
	
	//"Fisher–Yates shuffle" - Randomise array of 100 numbers
	shuffleArray = function (array){
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	};
	
	//Populate a random array of 100 numbers. This will be used to shuffle the quiz questions 
	if($rootScope.randomArray === undefined){
		$rootScope.randomArray = shuffleArray(createArray(100));
	};
	
	// Array to store the questions based on the topics selected
	var l_question=[];
	
	// Load the questions based on the index passed
	if($stateParams.topicIndex){
		l_question = $scope.topicList[$stateParams.topicIndex].questions;
	};
	
	if($stateParams.Id){
		$scope.data.quiz = l_question[$rootScope.randomArray[parseInt($stateParams.Id)]];
		$scope.data.CurrentIndex = parseInt($stateParams.Id);
	}else{
		$scope.data.quiz = l_question[$rootScope.randomArray[0]];
		$scope.data.CurrentIndex = 0;
	};

	// Copy the question array index to scope.data
	$scope.data.topicIndex = $stateParams.topicIndex;
	
	// Copy the scope.data to rootscope so that its available in other controllers
	$rootScope.data = $scope.data;
	
	// This is for displaying current question index in header
	$rootScope.CurrQuestion = $scope.data.CurrentIndex+1;
	$rootScope.QuizQuestions = l_question.length;
	
});

app.controller('IndexCtrl', ['$q', '$scope', '$state', '$rootScope', '$http','$ionicPopup', '$ionicSideMenuDelegate', 
	function($q, $scope, $state, $rootScope, $http, $ionicPopup, $ionicSideMenuDelegate){
		
		// List of topics
		// Index page will loop on this index to populate the SideMenu
		
		$scope.topicList = quizData;
		
		var showConfirm = function(msg) {
			return $ionicPopup.confirm({
				title: 'Quiz',
				template: msg
			});
		};

		var showAlert = function(msg) {
			var alertPopup = $ionicPopup.alert({
				title: 'Quiz',
				template: msg
			});
		};
		
		var fnNavigate = function(nIndex) {
			if(($scope.data.CurrentIndex + nIndex) < 0){
				null;
			} else if(($scope.data.CurrentIndex + nIndex) < $rootScope.QuizQuestions){
				$state.go("/:topicIndex/:Id", {topicIndex:$rootScope.data.topicIndex, Id:($scope.data.CurrentIndex + nIndex)});    
			}else{
				showAlert('You have completed the quiz ...!');
			};
		};
		
		// validate function will return a promise with success or err 
		var fnValidate = function() {
			var q = $q.defer();
			
			if($rootScope.data.choice === undefined){
				q.reject("Skip this question ?");
			}else if ($rootScope.data.choice != $rootScope.data.quiz.answer){
				q.reject("Wrong Answer. Skip this question ?");
			}else{
				q.resolve();
			};
			
			return q.promise;
		};

		var fnProcess = function(nIndex, bConfirmValidation){
			//Validate user action
			// Action 1 = User selected an answer
			// Action 2 = User selected to move forward or backward
			
			var valPromise = fnValidate().then(
				//validation is success then move forward
				function(res){
					fnNavigate(nIndex);
				},
				//validation failed
				//Check the bConfirmValidation variable and show confirm dialogue
				//bConfirmValidation = false when user is selecting answer/
				//bConfirmValidation = true when user is touching Next and Previous
				function(err){
					if(bConfirmValidation){
						showConfirm(err).then(function(res){
							if (res) {
								fnNavigate(nIndex);
							};
						});
					};
				}
			);
		};
		
		$scope.fnNext = function(nIndex, bConfirm){
			fnProcess(1, true);
		};
				
		$scope.fnPrevious = function(){
			fnProcess(-1, true);
		};
		
		$scope.fnFirst = function() {
			// Set the correct answer and go first
			fnNavigate(-$scope.data.CurrentIndex, true);     
		};
		
		$scope.fnNextQuestion = function(){
			fnProcess(1, false);
		};
		
		$scope.toggleLeft = function(){
			$ionicSideMenuDelegate.toggleLeft();
		};
		
	}
]);
