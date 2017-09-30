
$.ajax({
	url: 'https://api.foursquare.com/v2/venues/40a55d80f964a52020f31ee3?client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20170919',
	success: function(data) {
		console.log(data);
	}
});