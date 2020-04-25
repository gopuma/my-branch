

module.exports.getPDF = function ($http, $window) {
  $http.get('/public/angular-app/myapt/example.pdf', {responseType: 'arraybuffer'})
       .success(function (data) {
           var file = new Blob([data], {type: 'application/pdf'});
           var fileURL = URL.createObjectURL(file);
           $window.open(fileURL);
    });
};
