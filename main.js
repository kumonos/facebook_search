window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
		appId      : '489296474470878', // App ID from the App Dashboard
		channelUrl : '//www.muratayusuke.com/facebook_search/channel.php', // Channel File for x-domain communication
		status     : true, // check the login status upon init?
		cookie     : true, // set sessions cookies to allow your server to access the session?
		xfbml      : true  // parse XFBML tags on this page?
    });

    FB.login(function(response) {
		if (response.authResponse) {
			FBSearch.init();
		} else {
			alert("cannot login. try to reload");
		}
    }, {scope:'friends_work_history,friends_relationships,friends_birthday,friends_education_history,friends_hometown,friends_location,friends_photos'});
};


var FBSearch = {
	friends: [],
	filter: {},
	init: function(){
		FB.api('/fql', {q:'SELECT uid, name, pic_square, profile_url, work, relationship_status FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())'}, function(response) {
			console.log(response);
			FBSearch.friends = response.data;
			var ul = $("#friends");
			for(var i = 0; i < FBSearch.friends.length; i ++){
				var friend = FBSearch.friends[i];
				var html = "<li id='friend" + i + "'>";
				html += "<img src=" + friend.pic_square + " />";
				html += "<a href='" + friend.profile_url + "' target='_blank'>" + friend.name + "</a>";
				html += " work at " + FBSearch.latestEmployer(i);
				html += "</li>";
				ul.append(html);
			}
		});
	},
	latestEmployer: function(friendIndex){
		var employer = "";
		var friend = this.friends[friendIndex];
		if(friend.work.length > 0){
			employer = friend.work[0].employer.name;
		}
		return employer;
	},
	filterResults: function(param){
		this.filter[param.target] = param.query;
		for(var i = 0; i < this.friends.length; i ++){
			var friend = this.friends[i];
			var show = true;
			for(var key in this.filter){
				var query = this.filter[key];
				if(query.length > 0){
					if(this.getTargetData(key, i).indexOf(query) == -1){
						show = false;
					}
				}
			}
			if(show){
				$("#friend" + i).css("display", "block");
			}
			else{
				$("#friend" + i).css("display", "none");
			}
		}
	},
	getTargetData: function(target, friendIndex){
		if(target == "employer"){
			return this.latestEmployer(friendIndex);
		}
		else{
			return this.friends[friendIndex][target];
		}
	}
};


// Load the SDK's source Asynchronously
// Note that the debug version is being actively developed and might 
// contain some type checks that are overly strict. 
// Please report such bugs using the bugs tool.
(function(d, debug){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
    ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));

$(function(){
	$("#employer").keyup(function(e){
		var query = $(this).val();
		FBSearch.filterResults({target: "employer", query: query});
	});
});

