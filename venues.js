
$.ajax({
	url: 'https://api.foursquare.com/v2/venues/40a55d80f964a52020f31ee3?client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20170919',
	success: function(data) {
		console.log(data);
	}
});


// service.getDetails({
        //     placeId: id
        // }, function(place, status) {
        //     if (status === google.maps.places.PlacesServiceStatus.OK) {
                
        //         //Push locations from the list into Model and call function to create Markers
        //         self.placeList.push(new ListItem(place));
        //         createMarker(place);
        //         // console.log(place);
        //     }         
        // });


        // service.nearbySearch({
    //     location: {
    //         lat: 39.4730591,
    //         lng: -0.3689012
    //     },
    //     radius: 1000,
    //     type: ['lodging']
    // }, callback);


     // Callback function that iterates through Places response, 
    // pushes each data into Model, and creates Markers on the map
    // function callback(results, status) {
    //     if (status === google.maps.places.PlacesServiceStatus.OK) {

    //         var resultsLength = results.length;

    //         for (var i = 0; i < resultsLength; i++) {
    //             var result = results[i];

    //             self.getDetails(result.place_id, result);
    //         }
            
    //     }
    // };