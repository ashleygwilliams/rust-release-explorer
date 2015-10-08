'use strict';

var md = new Remarkable();

$(function(){

  var req_milestones   = 'https://api.github.com/repos/rust-lang/rust/milestones?state=all';
  requestJSON(req_milestones, function(json) {
    var milestones = json.slice(13);
    var milestone_buttons = '';

    if(milestones.length === 0) {
      milestone_buttons += '<h3>No Milestones Found.</h3>';
    } else {
      $.each(milestones, function(index) {
        var ms_count = milestones.length;
        var milestone = milestones[index];

        var milestoneClass = function(milestone, ms_count) {
          var classes = "btn milestone";
          if (index === ms_count - 1 ) {
            classes += " nightly current";
          } else if ( index === ms_count - 2) {
            classes += " beta current";
          } else if ( index === ms_count - 3) {
            classes += " stable current";
          }
          return classes;
        }

        var classes = milestoneClass(milestone, ms_count);

        var milestoneHTML = function(milestone, classes) {
          return  '<button class="' + classes + 
                        '" id="' + milestones[index].number + 
                        '" name="'+ milestones[index].title  + 
                  '"  >' + 
                    milestones[index].title +
                  '</button>';
        };

        milestone_buttons += milestoneHTML(milestone, classes);
      })
    }

    $('#milestones').html(milestone_buttons);

    $.ajax({
      url: "https://raw.githubusercontent.com/rust-lang/rust/master/RELEASES.md"
    })
    .done(function(data){
      var buildNotesObj = function(data) {
        var notes = data.split('Version ');
        var notes_object = {};

        for(var i=0; i < notes.length; i ++) {
          var note = notes[i];
        
          if (note.slice(0,6) === '1.0.0-' ) {
            break;
          }

          var release_name = note.slice(0, 3);

          notes_object[release_name] = note;
        }
        return notes_object;
      };

      var notes_object = buildNotesObj(data);

      $('.milestone').on('click', function(e){
        $('#ghapidata').html('<div id="loader"><img src="images/loading.gif" class="loading" alt="loading..."></div>');
    
        var milestone = this;
        var note = notes_object[milestone.name];

        var noteHTML = function(milestone, note) {
          var html = ''
          if(notes_object[milestone.name] !== undefined) {
            html += "<h2>Notes</h2>" +
                    "<div id='notes'>" +
                      "<pre>" + md.render(note) + "</pre>" +
                    "</div>" +
                    "<button class='btn' id='expand'>Read More</button>";
          } else {
            html += "<h2>No Notes Found</h2>";
          }
          return html;
        };

        $('#releasedata').html(noteHTML(milestone, note));

        $('#expand').on('click', function(e) {
          $('#releasedata').toggleClass('collapsed');
          var button = $('#expand');
          if (button.text() === 'Read More') {
            button.text('Collapse');
          } else {
            button.text('Read More');
          }
        });

        var req_issues = "https://api.github.com/repos/rust-lang/rust/issues?state=all&milestone=" + milestone.id;
        requestJSON(req_issues, function(json) {
          var issues = json;
          var html = '';
          var issues_baseurl = 'http://www.github.com/rust-lang/rust/issues/';        

          if(issues.length === 0) { 
            html = '<h2>No issues!</h2>'; 
          } else {
            html += '<h2>Issues:</h2> <section> <ul>';
            $.each(issues, function(index) {
              var issue = issues[index];
              var title = issue.title;
              var url = issues_baseurl + issue.number;
              if(title.slice(0,8) === 'Tracking') {
                title = title.slice(19);
              }
              html += '<li><a href="' + url  + '"  target="_blank">'+ title + '</a></li>';
            });
          }
        
          $('#ghapidata').html(html);
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
