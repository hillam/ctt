var sites = {};
var sites_total = {};

setInterval(query_tabs, 1000);
setInterval(push_sites, 60000);
setInterval(pull_sites, 60000);

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
				update_popup(host, protocol);
			}
		}
	});
}

function increment(host){
	if(!sites[host])
		sites[host] = 0;
	sites[host]++;
}

/*------------------------------------------------------------------------------
	Send message to popup.js signaling to update display.
------------------------------------------------------------------------------*/
function update_popup(host, protocol){
	chrome.runtime.sendMessage(
		{
			method: "update",
			host: host,
			protocol: protocol,
			time: sites[host]
		},
		function(response){
			//console.log(response);
		}
	);
}

/*------------------------------------------------------------------------------
	SERVER URI
------------------------------------------------------------------------------*/
var domain = "http://localhost:3000/";

/*------------------------------------------------------------------------------
	Push current tracking data to the server.
------------------------------------------------------------------------------*/
function push_sites(){
	var request = $.post(domain + 'sites', {sites: sites});

	request.done(function(){
		for(host in sites){
			sites.host = 0;
		}
	});
}

/*------------------------------------------------------------------------------
	Pull current tracking data from the server.
------------------------------------------------------------------------------*/
function pull_sites(){
	var request = $.get(domain + 'sites');

	request.done(function(data){
		sites_total = data;
	});
}
