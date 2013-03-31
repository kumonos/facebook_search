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
			$("#friends").text("友達リストの読み込みに失敗しました。ページをリロードして下さい。");
		}
    }, {scope:'friends_work_history,friends_relationships,friends_birthday,friends_education_history,friends_hometown,friends_location,friends_photos'});
};


var FBSearch = {
	friends: [],
	filter: {},
	init: function(){
		$("#friends").text("読み込み中...");
		var fql = 'SELECT uid, name, pic_square, profile_url, sex, education, work, birthday_date, relationship_status FROM user';
		fql += ' WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';
		FB.api('/fql', {q:fql}, function(response) {
			$("#friends").text("");
			console.log(response);
			FBSearch.friends = response.data;
			var ul = $("#friends");
			for(var i = 0; i < FBSearch.friends.length; i ++){
				var friend = FBSearch.friends[i];
				var html = "<li id='friend" + i + "' class='clearfix friends_li'>";
				html += "<div class='friend_img'><img src=" + friend.pic_square + " /></div>";
				html += "<div class='friend_info'>";
				html += "<a href='" + friend.profile_url + "' target='_blank'>" + friend.name + "</a>";
				html += " work at " + FBSearch.getLatestEmployer(i) + "<br />";
				html += "education: " + FBSearch.getLatestEducation(i) + "<br />";
				html += friend.sex + ", " + friend.relationship_status + "<br />";
				html += "age: " + FBSearch.getAge(i);
				html += "</div>";
				html += "</li>";
				ul.append(html);
			}
		});
	},
	getLatestEmployer: function(friendIndex){
		var employer = "";
		var friend = this.friends[friendIndex];
		if(friend.work.length > 0){
			employer = friend.work[0].employer.name;
		}
		return employer;
	},
	getLatestEducation: function(friendIndex){
		var school = "";
		var friend = this.friends[friendIndex];
		if(friend.education.length > 0){
			school = friend.education[friend.education.length - 1].school.name;
		}
		return school;
	},
	getAge: function(friendIndex){
		var age = "";
		var friend = this.friends[friendIndex];
		var birthday_date = friend.birthday_date;
		if(!birthday_date){
			return age;
		}
		var birthdayYear = birthday_date.substr(6, 4);
		var birthdayMonth = birthday_date.substr(0, 2);
		var birthdayDay = birthday_date.substr(3, 2);
		if(!birthdayYear || !birthdayMonth || !birthdayDay){
			return age;
		}
		
		var birthday = String(birthdayYear) + String(birthdayMonth)+ String(birthdayDay);
		var today = new Date();
		today = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
		age = Math.floor((today - birthday) / 10000);
		return age;
	},
	filterResults: function(param){
		if(param.query.length == 0){
			delete this.filter[param.target];
		}
		else{
			this.filter[param.target] = param.query;
		}
		for(var i = 0; i < this.friends.length; i ++){
			var friend = this.friends[i];
			var show = true;
			for(var key in this.filter){
				var query = this.filter[key];
				if(query.length > 0){
					targetData = this.getTargetData(key, i);
					if(!targetData){
						show = false;
					}
					else{
						if(key == "employer" || key == "education"){
							// 部分一致
							if(targetData.indexOf(query) == -1){
								show = false;
							}
						}
						else if(key == "age_min"){
							// 最小値
							if(targetData < query){
								show = false;
							}
						}
						else if(key == "age_max"){
							// 最大値
							if(targetData > query){
								show = false;
							}
						}
						else{
							// 完全一致
							if(targetData != query){
								show = false;
							}
						}
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
			return this.getLatestEmployer(friendIndex);
		}
		else if(target == "education"){
			return this.getLatestEducation(friendIndex);
		}
		else if(target == "age_min" || target == "age_max"){
			return this.getAge(friendIndex);
		}
		else{
			data = this.friends[friendIndex][target];
			if(data == null || data == undefined){
				data = "";
			}
			return data;
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


// events
$(function(){
	$("#employer").keyup(function(e){
		var query = $(this).val();
		FBSearch.filterResults({target: "employer", query: query});
	});

	$("#education").keyup(function(e){
		var query = $(this).val();
		FBSearch.filterResults({target: "education", query: query});
	});
	
	$("#age_min").keyup(function(){
		var query = $(this).val();
		FBSearch.filterResults({target: "age_min", query: query});
	});
	
	$("#age_max").keyup(function(){
		var query = $(this).val();
		FBSearch.filterResults({target: "age_max", query: query});
	});

	$("#gender").click(function(){
		var query = $(this).val();
		if(query == "male" || query == "female"){
			FBSearch.filterResults({target: "sex", query: query});
		}
		else{
			FBSearch.filterResults({target: "sex", query: ""});
		}
	});
	
	$(".relationship_status").click(function(){
		var query = $(this).val();
		FBSearch.filterResults({target: "relationship_status", query: query});
	});
});

