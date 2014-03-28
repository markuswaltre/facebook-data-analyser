/*
* Markus Waltre
* github.com/markuswaltre
* =======================
* functions to count things from facebookfiles
*/  

      //
      // photo, video functions
      // should probably move out the help functions
      // don't really follow under "parse"
      //

      function isPhoto(entry) {
          if(entry.fileName.indexOf(".jpg") != -1) {
            return true;
          }
          return false;
      };

      function isVideo(entry) {
        if(entry.fileName.indexOf(".mp4") != -1) {
          return true;
        }
        return false;
      };

      function correctPhotoCount(video_count, photo_count) {
        // now why do this?
        // it is because I only view the filename's ending
        // and that gives a false positive increment from the
        // snaps that a uploaded video creates
        return photo_count -= video_count;
      };

      //
      // functions regarding time
      //

      function facebookTimeToMoment(timestamp) {
        /* split is:
         0: weekday, 1: month, 2: day, 3: year, 4: "at"
         5: "2:30am", 6: "UTC+08" */
        //var timestamp_parts = timestamp.split(/[\s,]+/);

        /* string format for moment creation
          MMMM is month in text, A am/pm, Z offset
          DD-MMMM-YYYY hh-mm A Z */
        /*var month = timestamp_parts[1],
            day = timestamp_parts[2],
            year = timestamp_parts[3],
            hhmm = timestamp_parts[5].substr(0,timestamp_parts[5].length-2),
            ampm = timestamp_parts[5].substr(timestamp_parts[5].length-2,2),
            offset = "+" + timestamp_parts[6].substr(timestamp_parts[6].length-2,2) + "00";

        var composed = day + "-" + month + "-" + year + " " + hhmm + " " + ampm + " " + offset;
        return moment(composed, "DD-MMMM-YYYY hh-mm A Z"); */
        // dammit ofcourse there is a smarter way.
        return moment(timestamp, "LLLL");
      };

      //
      // functions reading files
      //

      function readIndex(data) {
        var object = $.parseHTML(data);
        var reg_date = $(object[4]).find('td')[2].innerHTML;

        registration_date = databaseDate(reg_date) + databaseTime(reg_date);
      };

      function readWall(data) {
        var object = $.parseHTML(data);
        var wall = $(object[4]).find('div.meta');
        wall_count = wall.length;

        if(accepted_lang) {
          var friends, likes;
          if(language === "en_US") {
            friends = "friends";
            likes = "likes";
          } else if(language === "sv_SE") {
            friends = "vänner";
            likes = "gillar";
          }
          wall.each(function(n) {
            var timestamp = wall[n].innerHTML;
            var message = wall[n].nextSibling.data;
            if(message.indexOf(friends) != -1) {
              insertFriend(timestamp);
            }
            else if(message.indexOf(likes) != -1) {
              insertLike(timestamp);
            }
            else if(wall[n].nextElementSibling.className == "comment") {
              insertComment(timestamp);
            }
          });
        }
      };

      function readSecurity(data) {
        var object = $.parseHTML(data);
        var security = $(object[4]).find('ul');        
        /*  security is:
            0: is active sessions
            1: is account activity
            2: is recognized machines
            3: is logins and logouts
            4: is login protection data
            5: is IP adresses 
            6: is authentication cookies
            7: is administrative stuff */
        var account_activity = $(security[1]).find('li');

        account_activity.each(function(n) {
          var timestamp = $(account_activity[n]).find('br')[0].previousSibling;
          insertActivity($(timestamp).text());
        });

        securityStats();
      };

      function readAds(data) {
        var object = $.parseHTML(data);
        var ads = $(object[4]).find('ul');
        ad_tags = $(ads[0]).find('li').length;
        ad_clicked = $(ads[1]).find('li').length;
      };

      function readEvents(data) {
        var object = $.parseHTML(data);
        var events = $(object[4]).find('li');
        count_events = events.length;
        events.each(function(n) {
          var status = $(events[n]).find('br')[0].nextSibling.data;
          eventStats(status);
        });
      };

      function readSettings(data) {
        var object = $.parseHTML(data);
        var hidden = $(object[4]).find('ul');
        count_hidden = $(hidden[0]).find('li').length;
        language = $($(object[4]).find('table')[0]).find('td')[0].innerHTML;
        checkAcceptedLanguage(language);
      };

      function readFriends(data) {
        var object = $.parseHTML(data);
        var friends = $(object[4]).find('ul');
        count_friends = $(friends[0]).find('li').length;
        sent_friend_req = $(friends[1]).find('li').length;
        received_friend_req = $(friends[2]).find('li').length;
        removed_friends = $(friends[3]).find('li').length;
        subscribers = $(friends[4]).find('li').length;
      };

      function readMessages(data) {

        var object = $.parseHTML(data);
        var name = $(object[4]).find('h1')[0].innerHTML;
        var messages = $(object[4]).find('div.message');

        console.time("message");
        messages.each(function(n){
          var sender = $(messages[n]).find('span.user')[0].innerHTML;
          var timestamp = $(messages[n]).find('span.meta')[0].innerHTML;
          // !important messages != message
          var message = $(messages[n]).next().html();

          if(name === sender) {
            insertMessage(timestamp, true);
            chars_written += message.length;
            words_written += message.split(' ').length;
          }
          else {
            insertMessage(timestamp, false);
            chars_received += message.length;
            words_received += message.split(' ').length;
          }
        });
        console.timeEnd("message");
        messageStats();
      };