angular.module('smsDashboard', ['ngRoute', 'ngMaterial', 'ngAnimate', 'luegg.directives']);
angular.module('smsDashboard').config(['$routeProvider', '$mdThemingProvider', function($routeProvider, $mdThemingProvider) {
  $routeProvider.when('/', {
    templateUrl: '/templates/inbox.html',
    controller: 'InboxCtrl'
  }).when('/contacts', {
    templateUrl: '/templates/contacts.html',
    controller: 'ContactsCtrl'
  }).when('/contact/:id', {
    templateUrl: '/templates/contact.html',
    controller: 'ContactCtrl'
  }).otherwise({
    redirectTo: '/',
    caseInsensitiveMatch: true
  });

//  $mdThemingProvider.theme('default').primaryPalette('light-blue').accentPalette('yellow').dark();
}]);
angular.module('smsDashboard').controller('InboxCtrl', ['$scope', function ($scope) {

  $scope.messages = $scope.messages || [];

  io.socket.get('/message?sort=createdAt DESC&limit=30', function(resData, jwres) { 
    $scope.messages = resData;
    $scope.$apply();
  })

  if (!io.socket.alreadyListeningToConversations) {
    io.socket.alreadyListeningToConversations = true;
    io.socket.on('message', function onServerSentEvent (msg) {

      // Let's see what the server has to say...
      switch(msg.verb) {

        case 'created':
          $scope.messages.unshift(msg.data); // (add the new order to the DOM)
          $scope.$apply();              // (re-render)
          break;

        default: return; // ignore any unrecognized messages
      }
    });
  }
}]);
angular.module('smsDashboard').controller('ContactsCtrl', ['$scope', '$location', function ($scope, $location) {

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

  $scope.goToContact = function(contactId, $event) {
    $location.path('contact/'+contactId);
  };
}]);
angular.module('smsDashboard').controller('ContactCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {

  function addMessage($scope, message) {
    $scope.contact.messages.push(message);
    $scope.$apply();
  };
  function scrollOnNew(scope, element){
    $scope.$watchCollection('contact.messages', function() {
      scrollDown();
    });
  }
  function scrollDown(){
    var list = angular.element( document.querySelector( '#chat-content' ) );
    var scrollHeight = list.prop('scrollHeight');
    list.scrollTop = scrollHeight;
    //list.animate({scrollTop: scrollHeight}, 500);
  }
  scrollOnNew();
  $scope.contact = $scope.contact || {};

  io.socket.get('/contact/' + $routeParams.id, function(resData, jwres) {
    $scope.contact = resData;
    $scope.$apply();
  })

  io.socket.on('message', function onServerSentEvent (msg) {
    switch(msg.verb) {

      case 'created':
        addMessage($scope, msg.data);
        break;
      case 'addedTo':
        if (msg.attribute == 'messages') {
          io.socket.get('/contact/' + $routeParams.id + '/messages/' + msg.addedId, function(resData, jwres) {
            addMessage($scope, resData[0]);
          });
        }
        break;

      default: return; // ignore any unrecognized messages
    }
  });

  $scope.sendMessage = function() {
    var text = $scope.outgoingMessage;
    io.socket.post('/message', { phoneNumber: $scope.contact.phoneNumber, text: text, contact: $scope.contact.id }, function(resData, jwres) {
      addMessage($scope, resData);
    });
    $scope.outgoingMessage = '';
  };
}]);
angular.module('smsDashboard').controller('NavCtrl', ['$scope', function($scope) {
  $scope.currentNavItem = 'inbox';
}]);
angular.element(document.getElementsByTagName('head')).append(angular.element('<base href="' + window.location.pathname + '" />'));
