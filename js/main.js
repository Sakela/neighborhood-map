// Create instances for map,infowindow objects and list of locations, and markers
var map;

// Model Class to hold the properties for each list item
var ListItem = function(data) {
    "use strict";

    // this.name = ko.observable(data.name);
    // this.id = ko.observable(data.place_id);
    // this.vicinity = ko.observable(data.vicinity);
    // this.rating = ko.observable(data.rating);
    // this.phoneNumber = ko.observable(data.international_phone_number);
    // this.images = ko.observableArray(data.photos);
    // this.website = ko.observable(data.website);
    // this.reviews = ko.observableArray(data.reviews);

    this.id = ko.observable(data.venue.id);
    this.name = ko.observable(data.venue.name);
    this.lat = ko.observable(data.venue.location.lat);
    this.lon = ko.observable(data.venue.location.lng);
    this.formattedAddress = ko.observable(data.venue.location.formattedAddress);
    this.categories = ko.observable(data.venue.categories[0].name);
    // this.foursquareUrl = "https://foursquare.com/v/" + this.id;
    // this.photoAlbumn = [];
    // this.marker = {};
    // this.photoPrefix = 'https://irs0.4sqi.net/img/general/';
    // this.photoPlaceHolder = 'http://placehold.it/100x100';
    // this.photoSuffix;
    // this.basePhotoAlbumnURL = 'https://api.foursquare.com/v2/venues/';

    // // data that may be undefined or need formatting
    // this.photoAlbumnURL = this.getPhotoAlbumnURL(data, foursquareID);

    // this.formattedPhone = this.getFormattedPhone(data);

    // this.tips = this.getTips(data);

    // this.url = this.getUrl(data);

    // this.rating = this.getRating(data);

    // this.featuredPhoto = this.getFeaturedPhoto(data);

    this.showReviews = ko.observable(false);

    this.toggleReviews = function() {
        this.showReviews(true);
    }

    this.isVisibleDetails = ko.observable(false);

    this.toggleVisibility = function() {
        var detailsInfoWindow = $('.details-info');

        if (this.isVisibleDetails() !== true) {
            detailsInfoWindow.toggleClass('clicked');
            this.isVisibleDetails(true);            
        } else {
            detailsInfoWindow.toggleClass('clicked');
            this.isVisibleDetails(false);
            $("#map").css({"height": "85%"});
            $(".footer").css({"height" : "8%"});
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
        parks = [],
        markers = [],
        showListingsBtn = document.getElementById('show-listings'),
        hideListingsBtn = document.getElementById('hide-listings');

    self.placeList = ko.observableArray([]);
    self.currentPlace = ko.observable();
    self.enableButton = ko.observable(true);
    self.searchText = ko.observable('');
    self.currentWeather = ko.observable();
    
    // self.isVisibleDetails = ko.observable(false);

    // if(self.searchText().length > 0) {
    //     console.log(self.searchText());
    // }

    // Show/hide the list of locations
    self.toggleList = function() {
        $('.list').toggle(100);
    }

    //Handles chosen list item and saves into ViewModel obesrvable property
    self.setCurrentPlace = function(place) {
        self.currentPlace(place);
    }

    // Filter search for locations in the list
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

        var venues = [];

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore?ll=39.4730591,-0.3689012&query=park&client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20170919',
            success: function(data) {
                // console.log(data);
                venues = data.response.groups[0].items;
                console.log(venues);

                venues.forEach(function(venue) {
                    self.placeList.push(new ListItem(venue));
                    createMarker(venue);
                });

                // console.log(self.placeList());
            }
        });

        // venueId.forEach(function(uniqueId) {
        //     $.ajax({
        //         url: 'https://api.foursquare.com/v2/venues/uniqueId&client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20170919',
        //         success: function(data) {
        //             console.log(data);
        //         }
        //     });
        // });

    }();

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
        $("#map").css({"height": "50%"});
        $(".footer").css({"height" : "43%"});

        this.toggleVisibility();
    }   

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

    // Create Marker object and set properties
    function createMarker(venue) {
        // var placeLoc = place.geometry.location;
        var venuePosition = new google.maps.LatLng(venue.location.lat(), venue.location.lon());

        console.log(venuePosition);

        // var marker = new google.maps.Marker({
        //     map: null,
        //     position: venuePosition,
        //     animation: google.maps.Animation.DROP,
        //     // id: place.place_id,
        //     name: venue.name,
        //     // vicinity: place.vicinity,
        //     // img : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})
        // });

        // // Open info window by clicking the Marker
        // google.maps.event.addListener(marker, 'click', function() {
        //     setInfoContent(marker, infowindow);
        //     infowindow.open(map, this);
        // });

        // markers.push(marker);

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

    self.getWeather = function() {
        $.ajax({
            url: 'http://api.openweathermap.org/data/2.5/weather?lat=39.4730591&lon=-0.3689012&units=metric&APPID=ab60d817c88e85c1566b14067d523a73',
            success: function(data) {
                // console.log(data.main.temp);
                self.currentWeather(data.main.temp);
            }
        })
    }();

    // var venuesArray = [];
    // var firstVenue;

    // $.ajax({
    //         url: 'https://api.foursquare.com/v2/venues/search?ll=39.4730591,-0.3689012&query=park&client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20170919',
    //         success: function(data) {
    //             // console.log(data);
    //             var venues = data.response.venues;
    //             console.log(venues);

    //             venues.forEach(function(venue) {
    //                 firstVenue = venues[0];
    //                 venuesArray.push(venues);
    //                 // self.placeList.push(new ListItem(venue));
    //                 // createMarker(venue);
    //             });
    //         }
    //     });

    // // var baseImgURL = 'https://irs3.4sqi.net/img/general/'; // base url to retrieve venue photos

    //     $.ajax({
    //         url: 'https://api.foursquare.com/v2/venues/4b770f6ef964a52024792ee3/photos?client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20130815',
    //         dataType: 'jsonp',
    //         success: function(data) {
    //             // console.log(data);

    //             var imgItems = data.response.photos.items;
    //             console.log(imgItems);

    //             // set venu photo data in venue photo albumn
    //             // for (var i in imgItems) {
    //             //     var venueImgURL = baseImgURL + 'width800' + imgItems[i].suffix;
    //             //     var venueImgObj = {
    //             //         href: venueImgURL,
    //             //         title: venueItem.name
    //             //     };
    //             //     // push venue photo data object to venue photo albumn
    //             //     venueItem.photoAlbumn.push(venueImgObj);
    //             // }
    //         }
    //     });
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