chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.method == "update"){
		if(request.protocol == 'http' || request.protocol == 'https'){
			$('#site').text(request.host);
			$('#time').text(request.time);
		}
		sendResponse('Popup has been updated.');
	};
});
