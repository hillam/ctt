$(document).ready(function(){
	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});

	chrome.runtime.sendMessage({method: "get_current_tab"}, function(response){
		render_popup(response);
	});
});

function render_popup(data){
	if(data.user.login){
		$('#logged_out').hide();
		$('#site').text(data.host);
		$('#time').text(format_time(data.time));

		var links = [
			{
				id: 'manage_notis',
				url: 'https://ctt-ahill.rhcloud.com/users/' + data.user.id // + site_id
			},
			{
				id: 'profile',
				url: 'https://ctt-ahill.rhcloud.com/users/' + data.user.id
			}
		];
		for(link of links){
			$('#' + link.id).attr('href', link.url);
		}
	}
	else{
		$('#logged_in').hide();
	}
	wire_links(data);
}

// input: 	time in seconds
// output:	"3.4 minutes", "3 weeks", "1 day", for example
function format_time(time){
	var units = [
		{
			name:		"year",
			seconds: 	31536000
		},
		{
			name:		"month",
			seconds: 	2592000
		},
		{
			name:		"week",
			seconds: 	604800
		},
		{
			name:		"day",
			seconds: 	86400
		},
		{
			name:		"hour",
			seconds: 	3600
		},
		{
			name:		"minute",
			seconds: 	60
		},
		{
			name:		"second",
			seconds: 	1
		}
	];

	for(var unit of units){
		if(time >= unit.seconds){
			return (time / unit.seconds).toFixed(is_divisible(time, unit.seconds)) + " " + unit.name +
					Array(1 + is_equal(time, unit.seconds)).join('s'); // plural or not
		}
	}

	// returns 0 if the numbers are equal, 1 otherwise
	function is_equal(num1, num2){
		return Math.abs(Math.sign((num1/num2).toFixed(1) - 1));
	}

	// returns 0 if the first number is divisible by the second, 1 otherwise
	function is_divisible(num1, num2){
		return Math.abs(Math.sign((num1/num2).toFixed(1) % 1));
	}
}
