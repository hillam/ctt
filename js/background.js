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

		// TODO: don't ever sendResponse until site exists in the database
		// (update_sites first)

		sendResponse({
			id: site.id,
			host: current_tab,
			time: site.time + (timers[current_tab] || 0),
			user: user
		});
	}
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
			// PARSE SITE HOSTNAME FROM URL
			var url = purl(tabs[0].url);
			var host = url.attr('host');
			var protocol = url.attr('protocol');

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
------------------------------------------------------------------------------*/
function update_sites(){
	push_sites(pull_sites);
}

/*------------------------------------------------------------------------------
	Push current tracking data to the server.
	- 	this should not be called on it's own.. use update_sites so that you get
		a fresh copy of sites_total from the server after pushing up temp sites
		values
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
------------------------------------------------------------------------------*/
function pull_sites(){
	var request = $.get(domain + 'sites.json');

	request.done(function(data){
		sites = data;
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
