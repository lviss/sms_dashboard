angular.module('smsDashboard', ['ngRoute', 'ngMaterial']);
angular.module('smsDashboard').config(['$routeProvider', '$mdThemingProvider', function($routeProvider, $mdThemingProvider) {
  $routeProvider.when('/', {
    templateUrl: '/templates/inbox.html',
    controller: 'InboxCtrl'
  }).when('/contacts', {
    templateUrl: '/templates/contacts.html',
    controller: 'ContactsCtrl'
  }).when('/conversation/:id', {
    templateUrl: '/templates/conversation.html',
    controller: 'ConversationCtrl'
  }).otherwise({
    redirectTo: '/',
    caseInsensitiveMatch: true
  });

  $mdThemingProvider.theme('default').primaryPalette('light-blue').accentPalette('yellow').dark();
}]);
angular.module('smsDashboard').controller('InboxCtrl', ['$scope', function ($scope) {

  $scope.conversations = $scope.conversations || [];

  io.socket.get('/conversation', function(resData, jwres) { 
    $scope.conversations = resData;
    $scope.$apply();
  })

  if (!io.socket.alreadyListeningToConversations) {
    io.socket.alreadyListeningToConversations = true;
    io.socket.on('conversation', function onServerSentEvent (msg) {

      // Let's see what the server has to say...
      switch(msg.verb) {

        case 'created':
          $scope.conversations.push(msg.data); // (add the new order to the DOM)
          $scope.$apply();              // (re-render)
          break;

        default: return; // ignore any unrecognized messages
      }
    });
  }
}]);
angular.module('smsDashboard').controller('ContactsCtrl', ['$scope', function ($scope) {

  $scope.contacts = $scope.contacts || [];

  io.socket.get('/contact', function(resData, jwres) { 
    $scope.contacts = resData;
    $scope.$apply();
  })

  if (!io.socket.alreadyListeningToContacts) {
    io.socket.alreadyListeningToContacts = true;
    io.socket.on('contact', function onServerSentEvent (msg) {

      // Let's see what the server has to say...
      switch(msg.verb) {

        case 'created':
          $scope.contacts.push(msg.data); // (add the new order to the DOM)
          $scope.$apply();              // (re-render)
          break;

        default: return; // ignore any unrecognized messages
      }
    });
  }
}]);
angular.module('smsDashboard').controller('ConversationCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {

  $scope.conversation = $scope.conversation || {};

  io.socket.get('/conversation/' + $routeParams.id, function(resData, jwres) {
    $scope.conversation = resData;
    $scope.$apply();
  })

  io.socket.on('conversation', function onServerSentEvent (msg) {

    // Let's see what the server has to say...
console.log('conversation:');
console.log(msg);
    switch(msg.verb) {

      case 'addedTo':
        if (msg.attribute == 'messages') {
          io.socket.get('/conversation/' + $routeParams.id + '/messages/' + msg.addedId, function(resData, jwres) {
            $scope.conversation.messages.push(resData[0]);
            $scope.$apply();
          });
        }
        break;

      default: return; // ignore any unrecognized messages
    }
  });
}]);
angular.element(document.getElementsByTagName('head')).append(angular.element('<base href="' + window.location.pathname + '" />'));
