$(document).ready(function() {
  $('#form').submit(function() {
    
    var payload = {
      url: $('#url').val()
    };

    $.ajax({
      url: "/urls",
      type: "POST",
      contentType: "application/json",
      processData: false,
      data: JSON.stringify(payload),
      success: function (data) {
        console.log('Posted: ' + data);
      },
      fail: function( jqXHR, textStatus ) {
        console.log("Request failed: " + textStatus);
      }
    });
  });
});