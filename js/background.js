var sites = {};

setInterval(query_tabs, 1000);

function query_tabs(){
	chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
		if(tabs[0]){
			var url = purl(tabs[0].url);
			var host = url.attr('host');
			var protocol = url.attr('protocol');

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
