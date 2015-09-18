'use strict';

$(function(){
  var req_milestones   = 'https://api.github.com/repos/rust-lang/rust/milestones?state=all';
  requestJSON(req_milestones, function(json) {
    var milestones = json;
    var milestone_buttons = '';

    if(milestones.length === 0) {
      milestone_buttons = milestone_buttons + '<h3>No Milestones Found.</h3>';
    } else {
      $.each(milestones, function(index) {
        milestone_buttons = milestone_buttons + '<button class=" btn milestone" id="' + milestones[index].number + '" >' + milestones[index].title + '</button>';
      })
    }

    $('#milestones').html(milestone_buttons);

    $('.milestone').on('click', function(e){
      $('#ghapidata').html('<div id="loader"><img src="http://i.imgur.com/UqLN6nl.gif" alt="loading..."></div>');
    
      var milestone = this.id;
      var req_issues = "https://api.github.com/repos/rust-lang/rust/issues?state=all&milestone=" + milestone;
      requestJSON(req_issues, function(json) {
        var issues = json;
        var outhtml = '';
        var issues_baseurl = 'http://www.github.com/rust-lang/rust/issues/';        

        if(issues.length === 0) { 
          outhtml = '<h2>No issues!</h2>'; 
        } else {
          outhtml = outhtml + '<h2>Issues:</h2> <section> <ul>';
          $.each(issues, function(index) {
            outhtml = outhtml + '<li><a href="' + issues_baseurl + issues[index].number + '"  target="_blank">'+issues[index].title + '</a></li>';
          });
          outhtml = outhtml + '</section> </ul>'; 
        }
        
        $('#ghapidata').html(outhtml);
      });
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
