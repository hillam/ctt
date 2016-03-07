/*
* sites: 		holds times (in sesconds) and get's dumped to the server and reset
* 				to 0 every minute
* sites_total: 	gets populated by the server upon pull_sites
*/
var sites = {};
var sites_total = {};

// Holds the URL for the current tab.
// Used to initialize the popup without having to do an extra tab query.
var current_tab = null;

setInterval(query_tabs, 1000);

// delay to make sure jquery is loaded before attempting
setTimeout(pull_sites, 1000);
setInterval(update_sites, 60000);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.method == "get_current_tab"){
		sendResponse({
			host: current_tab,
			time: (sites[current_tab] || 0) + (sites_total[current_tab] || 0)
		});
	}
});

/*------------------------------------------------------------------------------
	Get the current active tab, parse out the associated host, and increment
	the time for that host.
------------------------------------------------------------------------------*/
function query_tabs(){
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
	if(!sites[host])
		sites[host] = 0;
	sites[host]++;
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
	var request = $.post(domain + 'sites', {sites: sites});

	request.done(function(){
		// reset times for all sites back to 0
		for(var host in sites){
			sites[host] = 0;
		}
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
		sites_total = data;
	});
}

/*------------------------------------------------------------------------------
	Get user info.
------------------------------------------------------------------------------*/
function get_user(){
	// TODO make route
	var request = $.get(domain + 'user.json');

	request.done(function(data){
		// TODO do something
	});
}
