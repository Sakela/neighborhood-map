// Create instances for map,infowindow objects and list of locations, and markers
var map, infowindow;
var list = [];
var markers = [];

// Model Class to hold the properties for each list item
var ListItem = function(placeData) {
    this.name = ko.observable(placeData.name);
    this.id = ko.observable(placeData.place_id);
    this.location = ko.observable();
    this.vicinity = ko.observable(placeData.vicinity);
    this.rating = ko.observable(placeData.rating);
    // this.photos = ko.observable(placeData.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200}));

    this.phoneNumber = ko.observable(placeData.international_phone_number);
    this.images = ko.observableArray(placeData.photos);
}

// ViewModel that holds KO functions
function MapViewModel() { 
    
    

    var self = this;

    self.placeList = ko.observableArray([]);
    self.currentPlace = ko.observable();
    self.isVisible = ko.observable(false);

    //Handles chosen list item and saves into ViewModel obesrvable property
    self.setCurrentPlace = function(place) {
        self.currentPlace(place);
    }

    //Google Places request to get more detailed info for locations and create Model and Markers
    self.getDetails = function(id, currentPlace) {
        service.getDetails({
            placeId: id
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                
                //Push locations from the list into Model and call function to create Markers
                self.placeList.push(new ListItem(place));
                createMarker(place);
                
            } else {
                alert("error loading" + place + ".");
            }            
        });
    }

    self.bindPlaceMarker = function(currentPlace) {


        // self.getDetails(currentPlace.id(), currentPlace);
        self.setCurrentPlace(currentPlace);
        self.isVisible(true);
        console.log(self.currentPlace());

        markers.forEach(function(marker) {

            if (currentPlace.id() === marker.id) {
                // console.log(marker.id);
                setInfoContent(marker, infowindow);
                infowindow.open(map, marker);
                marker.setAnimation(google.maps.Animation.DROP);            
                
                
                // console.log(currentPlace);
            }
        });

        if (self.isVisible() === true) {
            $('.detailed-info').toggleClass('clicked');
        } 
        
        // console.log(place.photos());
    }

    self.toggleVisibility = function() {
        self.isVisible(false);
        $('.detailed-info').toggleClass('clicked');
    }


    // Create info window for future markers
    infowindow = new google.maps.InfoWindow();

    // Create Place service for hotels within radius
    var service = new google.maps.places.PlacesService(map);

    service.nearbySearch({
        location: {
            lat: 39.4730591,
            lng: -0.3689012
        },
        radius: 1000,
        type: ['lodging']
    }, callback);

    

    

    // Callback function that iterates through Places response, 
    // pushes each data into Model, and creates Markers on the map
    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var result = results[i];

                // Function looked up from Hackernoon article by Lena Faure.
                // Using setTimeout and closure because limit of 10 queries /second for getDetails */
                (function (j) {
                    var request = {
                        placeId: results[i]['place_id']
                    };

                    service = new google.maps.places.PlacesService(map);
                    setTimeout(function() {
                        service.getDetails(request, callback);
                    }, j*300);


                })(i);

                function callback(place,status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // currentPlace.phoneNumber(place.international_phone_number);
                        // place.photos.forEach(function(image){
                        //     currentPlace.images().push(image.getUrl({'maxWidth': 200, 'maxHeight': 200}));
                        //     console.log(image);
                        // })

                        self.placeList.push(new ListItem(place));
                        createMarker(place);
                        
                    } else {
                        alert("error loading" + place + ".");
                    }           
                }

                // service.getDetails({
                //     placeId: result.place_id
                // }, function(place, status) {
                //     if (status === google.maps.places.PlacesServiceStatus.OK) {
                //         // currentPlace.phoneNumber(place.international_phone_number);
                //         // place.photos.forEach(function(image){
                //         //     currentPlace.images().push(image.getUrl({'maxWidth': 200, 'maxHeight': 200}));
                //         //     console.log(image);
                //         // })

                //         self.placeList.push(new ListItem(place));
                //         createMarker(place);
                        
                //     } else {
                //         alert("error loading" + place + ".");
                //     }            
                // });
                // console.log(result);                
                // self.placeList.push(new ListItem(result));
                // createMarker(result);
                // list.push(results[i]);

                // self.getDetails(result.place_id, result);
            }
            
        }

        // list.forEach(function(listItem) {
        //     console.log()
        //     self.getDetails(listItem.place_id, listItem);
        // });

        // self.setCurrentPlace(self.placeList()[5]);        
        // console.log(service.nearbySearch.radius);
    };

    // Create Marker object and set properties
    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            // map: map,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            id: place.place_id,
            name: place.name,
            vicinity: place.vicinity,
            img : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})
        });

        // Open info window by clicking the Marker
        google.maps.event.addListener(marker, 'click', function() {

            // infowindow.setContent(place.name);
            setInfoContent(marker, infowindow);
            infowindow.open(map, this);
        });

        markers.push(marker);

        // marker.setMap(null);

    }

    function setInfoContent(marker, infowindow) {
        // infowindow.marker = marker;
        infowindow.setContent('<div><h3>' + marker.name + '</h3><p>' + marker.vicinity + '</p></div>');
    }

    function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }

    // This function will loop through the listings and hide them all.
    function hideListings() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    // function makeMarkerIcon(markerColor) {
    //   var markerImage = new google.maps.MarkerImage(
    //     'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    //     '|40|_|%E2%80%A2',
    //     new google.maps.Size(21, 34),
    //     new google.maps.Point(0, 0),
    //     new google.maps.Point(10, 34),
    //     new google.maps.Size(21,34));
    //   return markerImage;
    // }

    

    // function animateMarker(place) {
    // 	self.placeList().forEach(function(place) {
    // 		console.log("OOps");
    // 	})
    // }

    // var listItem = document.getElementById('list-item');
    // listItem.addEventListener('click', animateMarker());

    // console.log(markers);
    // $(window).load(function() {
    // 	initMap();
    // });

    document.getElementById('show-listings').addEventListener('click', showListings);
    document.getElementById('hide-listings').addEventListener('click', hideListings);
}


/*Function to load the map and markers*/
function initMap() {

    // Save center data into variable and create new map object
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 39.4730591,
            lng: -0.3689012
        },
        zoom: 13
    });

    ko.applyBindings(new MapViewModel());
}