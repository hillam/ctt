var sites = {};

setInterval(query_tabs, 1000);

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
