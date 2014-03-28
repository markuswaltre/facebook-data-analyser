/*
* Markus Waltre
* github.com/markuswaltre
* =======================
* create database 
*/ 

/*
* 	Databases
*/
var db_message_sent = TAFFY();
var db_message_rec = TAFFY();
var db_activity = TAFFY();

var db_wall_friend = TAFFY();
var db_wall_like = TAFFY();
var db_wall_comment = TAFFY();

/*
*	Global variables
*/

// for messages
var messages_sent, 
	messages_received,
	message_sent_old,
	message_sent_new,
	message_rec_old,
	message_rec_new,
	message_period,
	message_frequency_sent,
	message_frequency_received,
	message_frequency_total,
	words_written = 0,
	words_received = 0,
    chars_written = 0,
    chars_received = 0;

// for friends
var count_friends,
	sent_friend_req,
	received_friend_req,
	removed_friends,
	subscribers;

// for settings
var count_hidden,
	language,
    accepted_lang;

// for ads
var ad_tags,
	ad_clicked;

// for events
var count_events,
	attending = 0,
    declined = 0,
    no_reply = 0;

// for security
var activity_new,
	activity_old,
	activity_period,
	activity_frequenzy,
	activity_count;

// for photo&video
var photo_count = 0,
    video_count = 0;

// for index
var registration_date;

// for wall
var wall_count = 0;

var months = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
}

/*
*	Databasefunction
*/

function insertMessage(timestamp, sender) {
	var date_stamp = databaseDate(timestamp);
	if(sender) {
		var db_pos = db_message_sent({date:date_stamp}).first();
        if(db_pos.date != undefined) {
          db_pos.count++;
        } else {
          db_message_sent.insert({date:date_stamp, count: 1});
        }
	} else {
		var db_pos = db_message_rec({date:date_stamp}).first();
        if(db_pos.date != undefined) {
          db_pos.count++;
        } else {
          db_message_rec.insert({date:date_stamp, count: 1});
        }
	}
};

function insertActivity(timestamp) {
	var date_stamp = databaseDate(timestamp);
	var time_stamp = databaseTime(timestamp);
	var db_pos = db_activity({date:date_stamp, time:time_stamp}).first();
    if(db_pos.date != undefined) {
      db_pos.count++;
    } else {
      db_activity.insert({date:date_stamp, time:time_stamp, count: 1});
    }
};

function insertFriend(timestamp) {
    // insert
};

function insertLike(timestamp) {
    // insert
};

function insertComment(timestamp) {
    // insert
};

/*
*	Statisticsfunctions
*/

function messageStats() {
	messages_sent = db_message_sent().sum("count"),
    messages_received = db_message_rec().sum("count"),
    message_sent_old = db_message_sent().first().date,
    message_sent_new = db_message_sent().last().date,
    message_rec_old = db_message_rec().first().date,
    message_rec_new = db_message_rec().last().date; 
    /* Because period is here based on new All and old All, 
    and I got new specific variables for that
    message_period = message_newest.diff(message_oldest, 'days'),
    message_frequency_sent = messages_sent/message_period,
    message_frequency_received = messages_received/message_period,
    message_frequency_total = (messages_received+messages_sent)/message_period; */
};

function eventStats(status) {
    var en_US = ["Attending", "Declined", "No reply"];
    var sv_SE = ["Kommer", "Avböjt", "Inget svar"];
    var working;
    if(language === "en_US") working = en_US;
    else if(language === "sv_SE") working = sv_SE;
    else return;

	if(status === working[0]) {
		attending++;
	} else if(status === working[1]) {
		declined++;
	} else if(status === working[2]) {
		no_reply++;
	}
};

function securityStats() {
	activity_old = db_activity().order("date", "time").first();
	activity_new = db_activity().order("date", "time").last();

	/* Need tu view how I will handle moment.. is Time really working????
	might need to convert to 24h
	activity_period = activity_newest.diff(activity_oldest, "days");
    activity_count = account_activity.length;
    // should format frequenzy more accurately
    // what if lower than 1?
    // round of, ceil, floor??
    activity_frequenzy = activity_count/activity_period; */
};

/*
*	Helpfunctions
*/

function checkAcceptedLanguage(language) {
    if(language === "sv_SE" || language === "en_US") {
        accepted_lang = true;
    } else {
        accepted_lang = false;
    }
};

function databaseDate(timestamp) {
	var parts = timestamp.split(/[\s,]+/);
	var month = months[parts[1]]; //not number, but text
	var year = parts[3];
	var day = parts[2];

	return year + "-" + month + "-" + day;
};

function databaseTime(timestamp) {
	var parts = timestamp.split(/[\s,]+/);
	var time  = parts[5].substr(0,parts[5].length-2),
        ampm = parts[5].substr(parts[5].length-2,2);

    return time + " " + ampm;
};

/*
*	printfunctions. will probably be deleted later
*/

function printAll() {
    // forgive the ugly return
    // just to match the speed up uncomment section
    // in home.html
    printMessageStats();
    printFriends();
    printSettings();
    printAds();
    printEvents();
    printSecurity();
    printPhotoVideo();
    printIndex();
};

function printMessageStats() {
    if(messages_sent == undefined) return;
    document.write("message_sent: " + messages_sent + "<br>");
    document.write("words_written: " + words_written + "<br>");
    document.write("messages_received: " + messages_received + "<br>");
    document.write("words_received: " + words_received + "<br>");
    document.write("chars_written: " + chars_written + "<br>");
    document.write("chars_received: " + chars_received + "<br>");
     /*
    document.write("message_newest: " + message_newest.format() + "<br>");
    document.write("message_oldest: " + message_oldest.format() + "<br>");
    document.write("message period: " + message_period + "<br>");
    document.write("message_frequency_sent: " + message_frequency_sent + "<br>");
    document.write("message_frequency_received: " + message_frequency_received + "<br>");
    document.write("message_frequency_total: " + message_frequency_total + "<br>"); */
};

function printFriends() {
    if(count_friends == undefined) return;
    document.write("count_friends: " + count_friends + "<br>");
    document.write("sent_friend_req: " + sent_friend_req + "<br>");
    document.write("received_friend_req: " + received_friend_req + "<br>");
    document.write("removed_friends: " + removed_friends + "<br>");
    document.write("subscribers: " + subscribers + "<br>");
};

function printSettings() {
    if(language == undefined) return;
    document.write("language: " + language + "<br>");
    document.write("count_hidden: " + count_hidden + "<br>");
};

function printAds() {
    if(ad_tags == undefined) return;
    document.write("ad_tags: " + ad_tags + "<br>");
    document.write("ad_clicked: " + ad_clicked + "<br>");
};

function printEvents() {
    if(count_events == undefined) return;
    document.write("count_events: " + count_events + "<br>");
    // test to se it handling languages
    if(accepted_lang) {
        document.write("attending: " + attending + "<br>");
        document.write("declined: " + declined + "<br>");
        document.write("no_reply: " + no_reply + "<br>");
    }
};

function printSecurity() {
    if(activity_new == undefined) return;
    document.write("activity_newest: " + activity_new.date + " " +  activity_new.time + "<br>");
    document.write("activity_oldest: " + activity_old.date + " " +  activity_old.time + "<br>"); /*
    document.write("activity_period: " + activity_period + "<br>");
    document.write("activity_count: " + activity_count + "<br>");
    document.write("activity_frequenzy: " + activity_frequenzy + "<br>"); */
};

function printPhotoVideo() {
    if(photo_count == undefined) return;
    document.write("photo_count: " + photo_count + "<br>");
    document.write("video_count: " + video_count + "<br>");
};

function printIndex() {
    if(registration_date == undefined) return;
    document.write("registration_date: " + registration_date + "<br>");
};