'use strict';

var md = new Remarkable();

$(function(){

  var req_milestones   = 'https://api.github.com/repos/rust-lang/rust/milestones?state=all';
  requestJSON(req_milestones, function(json) {
    var milestones = json.slice(13);
    var milestone_buttons = '';

    if(milestones.length === 0) {
      milestone_buttons = milestone_buttons + '<h3>No Milestones Found.</h3>';
    } else {
      $.each(milestones, function(index) {
        milestone_buttons = milestone_buttons + 
          '<button class=" btn milestone" id="' + 
          milestones[index].number + 
          '" name="'+ 
          milestones[index].title  + '"  >' + 
          milestones[index].title +
          '</button>';
      })
    }

    $('#milestones').html(milestone_buttons);

    $.ajax({
      url: "https://raw.githubusercontent.com/rust-lang/rust/master/RELEASES.md"
    })
    .done(function(data){
      var notes = data.split('Version ');
      var notes_object = {};

      for(var i=0; i < notes.length; i ++) {
        var release_name = notes[i].slice(0, 3);

        notes_object[release_name] = notes[i];
      }

      $('.milestone').on('click', function(e){
        $('#ghapidata').html('<div id="loader"><img src="images/loading.gif" class="loading" alt="loading..."></div>');
    
        var milestone = this.id;

        $('#releasedata').html(
          "<h2>Notes</h2><div id='notes' class='collapsed'><pre>" +
          md.render(notes_object[this.name]) +
          "</pre></div><button class='btn' id='expand'>Read More</button>"
        );

        $('#expand').on('click', function(e) {
          $('#notes').toggleClass('collapsed');
          var button = $('#expand');
          if (button.text() === 'Read More') {
            button.text('Collapse');
          } else {
            button.text('Read More');
          }
        });

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
          }
        
          $('#ghapidata').html(outhtml);
        });
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
