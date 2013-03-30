window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
		appId      : '489296474470878', // App ID from the App Dashboard
		channelUrl : '//www.muratayusuke.com/facebook_search/channel.php', // Channel File for x-domain communication
		status     : true, // check the login status upon init?
		cookie     : true, // set sessions cookies to allow your server to access the session?
		xfbml      : true  // parse XFBML tags on this page?
    });

    // Additional initialization code such as adding Event Listeners goes here
	FB.login(function(response) {
		console.log(response);
	}, {scope: 'read_friendlists'});

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
