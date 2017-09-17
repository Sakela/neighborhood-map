// Create instances for map,infowindow objects and list of locations, and markers
var map;

// Model Class to hold the properties for each list item
var ListItem = function(placeData) {
    "use strict";

    this.name = ko.observable(placeData.name);
    this.id = ko.observable(placeData.place_id);
    this.location = ko.observable();
    this.vicinity = ko.observable(placeData.vicinity);
    this.rating = ko.observable(placeData.rating);
    this.phoneNumber = ko.observable(placeData.international_phone_number);
    this.images = ko.observableArray(placeData.photos);
    this.website = ko.observable(placeData.website);
    this.reviews = ko.observableArray(placeData.reviews);

    this.showReviews = ko.observable(false);

    this.toggleReviews = function() {
        this.showReviews(true);
    }

    this.isVisibleDetails = ko.observable(false);

    this.toggleVisibility = function() {
        var detailsInfoWindow = $('.detailed-info');

        if (this.isVisibleDetails() !== true) {
            detailsInfoWindow.toggleClass('clicked');
            this.isVisibleDetails(true);            
        } else {
            detailsInfoWindow.toggleClass('clicked');
            this.isVisibleDetails(false);
        }
    }
}

// ViewModel that holds KO functions
var MapViewModel = function() {
    "use strict"; 
    
    var self = this,
        infowindow = new google.maps.InfoWindow(),
        service = new google.maps.places.PlacesService(map),
        list = [],
        markers = [],
        showListingsBtn = document.getElementById('show-listings'),
        hideListingsBtn = document.getElementById('hide-listings');

    self.placeList = ko.observableArray([]);
    self.currentPlace = ko.observable();
    self.enableButton = ko.observable(true);
    self.searchText = ko.observable('');
    
    // self.isVisibleDetails = ko.observable(false);

    // if(self.searchText().length > 0) {
    //     console.log(self.searchText());
    // }

    self.toggleList = function() {
        $('.list').toggle(100);
    }

    //Handles chosen list item and saves into ViewModel obesrvable property
    self.setCurrentPlace = function(place) {
        self.currentPlace(place);
    }

    self.searchResults = ko.computed(function() {
        var matches = [];
        // Create a regular expression for performing a case-insensitive
        // search using the current value of the filter observable
        var re = new RegExp(self.searchText(), 'i');

        // Iterate over all stations objects, searching for a matching name
        self.placeList().forEach(function(place) {
            // If it's a match, save it to the list of matches and show its
            // corresponding map marker
            if (place.name().search(re) !== -1) {
                matches.push(place);
                // place.mapMarker.setVisible(true);
            // Otherwise, ensure the corresponding map marker is hidden
            } else {
                // Hide marker
                // place.mapMarker.setVisible(false);

                // If this station is active (info window is open), then
                // deactivate it
                // if (SubwayStation.prototype.active === station) {
                //     station.deactivate();
                // }
            }
        });

        return matches;
    });

    //Google Places request to get more detailed info for locations and create Model and Markers
    self.getDetails = function(id, currentPlace) {
        service.getDetails({
            placeId: id
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                
                //Push locations from the list into Model and call function to create Markers
                self.placeList.push(new ListItem(place));
                createMarker(place);
                // console.log(place);
            }         
        });
    }

    self.bindPlaceMarker = function(currentPlace) {
        // self.getDetails(currentPlace.id(), currentPlace);
        self.setCurrentPlace(currentPlace);
        self.toggleList();

        markers.forEach(function(marker) {

            if (currentPlace.id() === marker.id) {
                
                if(marker.map !== null) {

                    setInfoContent(marker, infowindow);
                    infowindow.open(map, marker);
                    marker.setAnimation(google.maps.Animation.DROP);
                    map.panTo(marker.position);  
                }                             
                // console.log(currentPlace);
            }
        });

        this.toggleVisibility();
    }   

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

            var resultsLength = results.length;

            for (var i = 0; i < resultsLength; i++) {
                var result = results[i];

                self.getDetails(result.place_id, result);
            }
            
        }
    };

    // Create Marker object and set properties
    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: null,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            id: place.place_id,
            name: place.name,
            vicinity: place.vicinity,
            img : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})
        });

        // Open info window by clicking the Marker
        google.maps.event.addListener(marker, 'click', function() {
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

    self.showListings = function() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
        
        self.enableButton(false);
    }

    // This function will loop through the listings and hide them all.
    self.hideListings = function() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        self.enableButton(true);
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

    // showListingsBtn.addEventListener('click', showListings);
    // hideListingsBtn.addEventListener('click', hideListings);
    $('#details').bind('touchstart', function() {
        $('.slide-out').toggle();
    })
}


/*Function to load the map and markers*/
function initMap() {
    "use strict";

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