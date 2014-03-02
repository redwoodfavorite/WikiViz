angular.module('VisApp')
  .controller('MainCtrl', ['DatabaseService','ColorService', 'd3Service', '$scope', '$location',
    function(DatabaseService, ColorService, d3Service, $scope, $location){
      $scope.showForm = true;
      $scope.showVis = false;
      $scope.showWait = false;
      $scope.url = 'http://en.wikipedia.org/wiki/math';

      $scope.reset = function(){
        $scope.showForm = true;
        $scope.showVis = false;
        $scope.url = 'http://en.wikipedia.org/wiki/math';
        $scope.sourcedata = null;
  
        //this doesn't have then, why does below?
        $scope.sourcedata = DatabaseService.reset();  
       
        // DatabaseService.reset().then(function(data){
        //   $scope.sourcedata = data;
        //   console.log('in controller should have reset');
        // });
        console.log('RESET called $scope.sourcedata', $scope.sourcedata);
      };

      $scope.getInput = function(){
        $scope.showForm = false;
        $scope.showVis = true;
        $scope.showWait = true;
        DatabaseService.request($scope.url).then(function(data) {
          $scope.sourcedata = data;
          console.log('datareturned $scope.sourcedata', $scope.sourcedata)
          $scope.showWait = false;
        });
      };

  }]);
