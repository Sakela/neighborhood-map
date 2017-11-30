// Create global instance for map object
var map;

// Model Class to hold the properties for each venue
var Venue = function(data) {
    "use strict";

    this.id = data.venue.id;
    this.name = data.venue.name.toUpperCase();
    this.phoneNumber = data.venue.contact.phone;
    this.address = data.venue.location.address;
    this.formattedAddress = data.venue.location.formattedAddress;
    this.categories = data.venue.categories[0].name;
    this.rating = data.venue.rating;
    this.url = data.venue.url;
    this.image = data.venue.photos;
};

// ViewModel that holds KO observable and methods
var ViewModel = function() {
    "use strict";

    var self = this,
        infowindow = new google.maps.InfoWindow({
            maxWidth: 350
        }),
        service = new google.maps.places.PlacesService(map),
        list = [],
        parks = [],
        markers = [],
        showListingsBtn = document.getElementById('show-listings'),
        hideListingsBtn = document.getElementById('hide-listings'),
        defaultCity = 'Atlanta',
        defaultIcon = makeMarkerIcon('8E4E81'),
        highlightedIcon = makeMarkerIcon('fc00b5');

    self.placeList = ko.observableArray([]);
    self.currentPlace = ko.observable();
    self.enableButton = ko.observable(true);
    self.searchText = ko.observable('');
    self.cityInput = ko.observable(defaultCity);

    // Show/hide the list of venues for mobile screens
    self.toggleList = function() {
        var list = $(".list");
        list.toggleClass('hidden');
    }

    // Clears input in the Filter of venues
    self.clearFilter = function() {
        self.searchText('');
    }

    //Handles chosen list item and saves into ViewModel current venue obesrvable
    self.setCurrentPlace = function(place) {
        self.currentPlace(place);
    }

    // Filter search method for venues in the list
    self.searchResults = ko.computed(function() {
        var matches = [];
        // Regex search for current value of the Filter
        var re = new RegExp(self.searchText(), 'i');
        // Iterate over observable array of venues
        self.placeList().forEach(function(place) {
            // Save matching venue to the array
            if (place.name.search(re) !== -1) {
                matches.push(place);
            }
        });

        return matches;
    });

    //Foursquare request for venues within lat longs of the current city passed (This method called in 'searchCity' function)
    self.getDetails = function(cityObj) {
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore?ll=' + cityObj.lat + ',' + cityObj.lng + '&client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20170919&venuePhotos=1',
            success: function(data) {
                var array = [];
                array = data.response.groups[0].items;
                // Iterate over array of pulled venues and create Markers, then fire off request for venues photos
                array.forEach(function(item) {
                    createMarker(item);
                    getPhotos(item);
                    // self.placeList.push(new Venue(item));
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('.error').css("display", "block");
            }
        });
    };

    // Google Places request for passed current city name
    function searchCity(city) {
        var request = {
            query: city
        };
        // Text search method that returns lat long of the chosen city
        service.textSearch(request, function(data, status) {
            // Show error block if no success
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                $('.error-search').css("display", "block");
                return;
            }
            // Pass lat long to city object if success
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                $('.error-search').css("display", "none");
                var cityObj = {};

                cityObj.lat = data[0].geometry.location.lat();
                cityObj.lng = data[0].geometry.location.lng();

                var newCity = new google.maps.LatLng(data[0].geometry.location.lat(), data[0].geometry.location.lng());
                // Center Map for current city and fire off request for venues for this city
                map.setCenter(newCity);
                self.getDetails(cityObj);
            }
        });
    }

    // Call city search with current input in City Search field
    searchCity(self.cityInput());
    //On change listener for City Search input, and fire off 'searchCity' function if has new input 
    $('#menu-city-search').change(function() {
        self.hideListings();
        markers.length = 0;
        self.placeList().length = 0;

        var inputValue = $('#menu-city-search').val();
        self.cityInput(inputValue);
        searchCity(self.cityInput());
    });

    //Binds display of the location from the list and the marker on the map
    self.bindPlaceMarker = function(currentPlace) {
        // self.getDetails(currentPlace.id(), currentPlace);
        self.setCurrentPlace(currentPlace);
        if (window.innerWidth < 400) {
            self.toggleList();
        }

        self.searchText(currentPlace.name);

        //Matches clicked location's ID with the ID of one of the markers and opens info for correct marker
        markers.forEach(function(marker) {
            if (currentPlace.id === marker.id) {
                if (marker.map !== null) {
                    setInfoContent(marker, infowindow);
                    infowindow.open(map, marker);
                    setHighlightedMarkerIcon(marker);
                    map.panTo(marker.position);
                }
            }
        });
    }

    // Create Marker object and set properties
    function createMarker(item) {
        var venuePosition = new google.maps.LatLng(item.venue.location.lat, item.venue.location.lng);

        var marker = new google.maps.Marker({
            map: null,
            position: venuePosition,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            name: item.venue.name,
            id: item.venue.id,
            vicinity: item.venue.location.address
        });

        // Open info window by clicking the Marker
        google.maps.event.addListener(marker, 'click', function() {
            setHighlightedMarkerIcon(this);
            setInfoContent(marker, infowindow);
            infowindow.open(map, this);
            self.searchText(this.name);
        });

        markers.push(marker);
        self.showListings();
    }

    function setHighlightedMarkerIcon(clickedMarker) {
        markers.forEach(function(marker) {
            marker.setIcon(defaultIcon);
        });

        clickedMarker.setIcon(highlightedIcon);
    }

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    function setInfoContent(marker, infowindow) {
        infowindow.setContent('<div class="info-window"><h3>' + marker.name + '</h3><p>' + marker.vicinity + '</p><a class="info-window-url" href="https://foursquare.com/" target="_blank">Powered By Foursquare <i class="fa fa-foursquare fa-lg" aria-hidden="true"></i></a></div>');
    }

    self.showListings = function() {
        // Extend the boundaries of the map for each marker and display the marker
        var bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            infowindow.close(map, this);
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

    $(window).resize(function() {
        setTimeout(function() {
            self.showListings();
        }, 1);
    });

    function getPhotos(item) {
        var baseImgURL = 'https://irs3.4sqi.net/img/general/'; // base url to retrieve venue photos

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + item.venue.id + '/photos?limit=1&client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20130815',
            dataType: 'jsonp',
            success: function(data) {
                var imgItems = data.response.photos.items[0].suffix;
                var venueImgURL = 'https://irs3.4sqi.net/img/general/width100' + imgItems;
                item.venue.photos = venueImgURL;
                self.placeList.push(new Venue(item));
            }
        });
    }
}

//Function called from script tag to load the map
function initMap() {
    "use strict";
    // Save center data into variable and create new map object
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.7489954,
            lng: -84.3879824
        },
        zoom: 13
    });

    //Run Knockout and create ViewModel
    ko.applyBindings(new ViewModel());
}