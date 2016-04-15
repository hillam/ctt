/*
* sites: 	gets populated by the server upon pull_sites
* timers:	temporary site timers. maps hostnames to times
*/
var sites = [];
var timers = {};

// simply determines whether to track and whether to ask the user to sign in
var user = {
	'login': false
}

// Holds the URL for the current tab.
// Used to initialize the popup without having to do an extra tab query.
var current_tab = null;

setInterval(query_tabs, 1000);
setInterval(check_login, 1000);

// delay to make sure jquery is loaded before attempting
setTimeout(pull_sites, 1000);
setInterval(update_sites, 60000);

/*------------------------------------------------------------------------------
	Respond to the popup with site data when it is opened.
------------------------------------------------------------------------------*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.method == "get_current_tab"){
		// the site in `sites` with hostname matching the current tab
		var search = $.grep(sites, function(e){ return e.hostname == current_tab; });
		var site = search.length > 0 ? search[0] : {time: 0};

		if(site.hasOwnProperty('id') || user.login == false){
			// site does not exist on the server yet, so update sites
			send_response();
		}
		else{
			//otherwise, send response
			update_sites(send_response);
		}

		function send_response(){
			sendResponse({
				id: site.id,
				host: current_tab,
				time: site.time + (timers[current_tab] || 0),
				user: user
			});
		};
	}
	return true;
});

/*------------------------------------------------------------------------------
	Get the current active tab, parse out the associated host, and increment
	the time for that host.
------------------------------------------------------------------------------*/
function query_tabs(){
	if(!user.login){
		return;
	}
	// QUERY ACTIVE TAB ON IN-FOCUS WINDOW
	chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
		if(tabs[0]){
			// Parse site hostname from url using URI.js
			var url = new URI(tabs[0].url);
			var host = url.hostname();
			var protocol = url.protocol();

			// IF HTTP OR HTTPS,
			if(protocol == 'http' || protocol == 'https'){
				increment(host);
			}
			current_tab = host;
		}
	});
}

function increment(host){
	if(!timers[host])
		timers[host] = 0;
	timers[host]++;
}

/*------------------------------------------------------------------------------
	SERVER URI
------------------------------------------------------------------------------*/
var domain = "http://ctt-ahill.rhcloud.com/";

/*------------------------------------------------------------------------------
	Push sites BEFORE pulling sites. Setting intervals for each does not
	guarantee that they maintain this order.
	* callback - an optional action to be performed after the asynchronous events
------------------------------------------------------------------------------*/
function update_sites(callback){
	push_sites(function(){
		pull_sites(callback);
	});
}

/*------------------------------------------------------------------------------
	Push current tracking data to the server.
	- 	this should not be called on it's own.. use update_sites so that you get
		a fresh copy of sites_total from the server after pushing up temp sites
		values
	-	callback - an optional action to be performed after the asynchronous events
------------------------------------------------------------------------------*/
function push_sites(callback){
	var request = $.post(domain + 'sites', {sites: timers});

	request.done(function(){
		// reset times for all sites back to 0
		timers = {};
		if(callback){
			callback();
		}
	});
}

/*------------------------------------------------------------------------------
	Pull current tracking data from the server.
	-	callback - an optional action to be performed after the asynchronous events
------------------------------------------------------------------------------*/
function pull_sites(callback){
	var request = $.get(domain + 'sites.json');

	request.done(function(data){
		sites = data;
		if(callback){
			callback();
		}
	});
}

/*------------------------------------------------------------------------------
	Get user info.
------------------------------------------------------------------------------*/
function check_login(){
	var request = $.get(domain + 'checklogin');

	request.done(function(data){
		if(!user.login){
			timers = {};
			sites = [];
		}
		user = data;
	});
}
