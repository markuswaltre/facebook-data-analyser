/*
* Markus Waltre
* github.com/markuswaltre
* =======================
* Reads a single file exclusively application/zip
* unpacks it with help from js-unzip.js written by augustl on github
* the reader/unpacker uses deflate, and atm messes up characters
*
* own code (scrambled with) internet stuff
* feel free to do whatever you want with it
*/

$(document).ready(function() {
      function readSingleFile(evt) {
        //Retrieve the first (and only!) File from the FileList object
        var f = evt.target.files[0]; 

        if (f) {
          var r = new FileReader();
          r.onload = function(e) { 
            var contents = e.target.result;
            console.log( "Got the file. " 
                  + "name: " + f.name + " "
                  + "type: " + f.type + " "
                  + "size: " + f.size + " bytes"
            );
            unzipFile(contents);  
          }
          r.readAsBinaryString(f);
        } else { 
          console.log("Failed to load file");
        }
      };

      // add event listener
      document.getElementById('fileinput').addEventListener('change', readSingleFile, false);

      function unzipFile(url) {
        var myZip = url;
        var unzipper = new JSUnzip(myZip);
        if(unzipper.isZipFile()) {
          unzipper.readEntries();    // Creates "entries"

          var i=0, entry;
          // runs through entry names once
          // to find settings and determine language
          console.time("settings");
          while(entry = unzipper.entries[i]) {
            if(checkSettings(entry)) break;
            i++;
          }
          console.timeEnd("settings"); // atm 11.773ms so def. worth it

          i=0;
          console.time("entries");
          while(entry = unzipper.entries[i]) {
            console.log(entry.fileName);
            // images&videos are here since they
            // need to be processed over all files
            if(isPhoto(entry)) photo_count++;
            else if(isVideo(entry)) video_count++; 
            else processEntry(entry);
            i++;
          }
          console.timeEnd("entries");

          // since algorithm makes fake increase
          photo_count = correctPhotoCount(video_count, photo_count);
          // here all entries are processed and can be presented
          console.time("printer");
          printAll();
          console.timeEnd("printer");

          console.log("Program done");
        }

        else {
          console.log("Couldn't read the Zip-file.");
        }
      };

      // uncompress file with inflate
      function uncompressDeflateFile(file) {
        return JSInflate.inflate(file);
      };

      // check and read settings
      function checkSettings(entry) {
        if(entry.fileName === "html/settings.htm") {
          if(entry.compressionMethod === 8) {
            var uncompressed = uncompressDeflateFile(entry.data);
            readSettings(uncompressed);
            return true;
          }
        }
        return false;
      };

      // view what kind of entry and 
      // "work upon it" - beyonce
      function processEntry(entry) {
        if(entry.compressionMethod === 8) {
          var uncompressed = uncompressDeflateFile(entry.data);
        }

        else if(entry.compressionMethod === 0) {
          var uncompressed = entry.data;
        }

        else {
          console.log("can't uncompress the file. not using deflate");
          return;
        }

        /*
        var filename = entry.fileName;
        // comment out some for speed 
        if(filename === "html/messages.htm") readMessages(uncompressed); 
        if(filename === "html/friends.htm") readFriends(uncompressed); 
        if(filename === "html/events.htm") readEvents(uncompressed);
        if(filename === "html/ads.htm") readAds(uncompressed); 
        if(filename === "html/security.htm") readSecurity(uncompressed); 
        if(filename === "index.htm") readIndex(uncompressed); 
        if(filename === "html/wall.htm") readWall(uncompressed); */
      };
});