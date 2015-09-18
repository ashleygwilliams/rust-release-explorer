'use strict';

$(function(){
  $('#ghsubmitbtn').on('click', function(e){
    e.preventDefault();
    $('#ghapidata').html('<div id="loader"><img src="http://i.imgur.com/UqLN6nl.gif" alt="loading..."></div>');
    
    var release_tag = $('#release').val();
    var requri   = 'https://api.github.com/repos/rust-lang/rust/issues?tag=' + release_tag;
    
    requestJSON(requri, function(json) {
      if(json.message == "Not Found") {
        $('#ghapidata').html("<h2>There was a problem connecting to Github. Please try again.</h2>");
      }
      
      else {
        var issues = json;
        var outhtml = '';
        var issues_baseurl = "http://www.github.com/rust-lang/rust/issues/";        

        if(issues.length === 0) { 
          outhtml = '<h2>No issues!</h2>'; 
        } else {
          outhtml = outhtml + '<h2>Issues:</h2> <ul>';
          $.each(issues, function(index) {
            outhtml = outhtml + '<li><a href="' + issues_baseurl + issues[index].number + '"  target="_blank">'+issues[index].title + '</a></li>';
          });
          outhtml = outhtml + '</ul></div>'; 
        }
        
        $('#ghapidata').html(outhtml);
      }
    });
  });
  
  function requestJSON(url, callback) {
    $.ajax({
      url: url,
      complete: function(xhr) {
        callback.call(null, xhr.responseJSON);
      }
    });
  }
});
