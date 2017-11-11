// Create instances for map,infowindow objects and list of locations, and markers
var map;

// Model Class to hold the properties for each list item
var ListItem = function(data) {
    "use strict";

    this.id = ko.observable(data.venue.id);
    this.name = ko.observable(data.venue.name.toUpperCase());
    this.phoneNumber = ko.observable(data.venue.contact.phone);
    this.address = ko.observable(data.venue.location.address);
    this.formattedAddress = ko.observable(data.venue.location.formattedAddress);
    this.categories = ko.observable(data.venue.categories[0].name);
    this.rating = ko.observable(data.venue.rating);
    this.url = ko.observable(data.venue.url);
    this.image = ko.observable(data.venue.photos);
    this.firstImage = ko.observable();

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
        hideListingsBtn = document.getElementById('hide-listings'),
        defaultCity = 'Atlanta',
        defaultIcon = makeMarkerIcon('8E4E81');

    self.placeList = ko.observableArray([]);
    self.currentPlace = ko.observable();
    self.enableButton = ko.observable(true);
    self.searchText = ko.observable('');
    self.currentWeather = ko.observable();
    self.cityInput = ko.observable(defaultCity);

    // Show/hide the list of locations for mobile screens
    self.toggleList = function() {
        var list = $(".list");

        if (list.css('display') == 'none') {
            $('.list').toggle(100);
            $("#map").css({"height": "40%"});
            $(".footer").css({"display" : "none"});
            $(".list").css({"height" : "53%"});            
        } else {
            if (window.innerWidth < 400) {
                $('.list').toggle(100);
                $("#map").css({"height": "85%"});
                $(".footer").css({"display" : "inline-block"});
            } else {
                $('.list').toggle(100);
                $("#map").css({"height": "76%"});
                $(".footer").css({"display" : "inline-block"});
            };
        }
        
    }

    self.clearFilter = function() {
        self.searchText('');
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
    self.getDetails = function(cityObj) {       

        

        console.log(cityObj.lat)

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore?ll=' + cityObj.lat + ',' + cityObj.lng + '&client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20170919&venuePhotos=1',
            success: function(data) {
                console.log(data);
                var array = [];
                array = data.response.groups[0].items;
                // console.log(items);

                array.forEach(function(item) {
                    // var imgItems = item.venue.photos.groups[0];
                    // console.log(imgItems);
                    // var venueImgURL = 'https://irs3.4sqi.net/img/general/width100' + imgItems;
                    console.log(item);
                    
                    createMarker(item);
                    getPhotos(item);
                    // self.placeList.push(new ListItem(item));
                });

                console.log(self.placeList());
            }
        });
    };



    function searchCity(city) {

        var request = {
            query: city
        };

        console.log(city);

        service.textSearch(request, function(data, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                console.log("ERROR RETRIEVING CITY")
                return;
            }

            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var cityObj = {};
             
                cityObj.lat = data[0].geometry.location.lat();
                cityObj.lng = data[0].geometry.location.lng();

                var newCity = new google.maps.LatLng(data[0].geometry.location.lat(), data[0].geometry.location.lng());
                
                map.setCenter(newCity);
                self.getDetails(cityObj);
            }
        });
    }
    searchCity(self.cityInput());

    $('#menu-city-search').change(function() {
        self.hideListings();
        markers.length = 0;
        self.placeList().length = 0;

        var inputValue = $('#menu-city-search').val();
        self.cityInput(inputValue);
        console.log('change made ' + self.cityInput());
        
        searchCity(self.cityInput());

    });

    //Binds display of the location from the list and the marker on the map
    self.bindPlaceMarker = function(currentPlace) {
        // self.getDetails(currentPlace.id(), currentPlace);
        self.setCurrentPlace(currentPlace);
        if (window.innerWidth < 400) {
            self.toggleList();
        }

        self.searchText(currentPlace.name());        

        console.log(currentPlace);

        //Matches clicked location's ID with the ID of one of the markers and opens info for correct marker
        markers.forEach(function(marker) {
            if (currentPlace.id() === marker.id) {                
                if(marker.map !== null) {
                    setInfoContent(marker, infowindow);
                    infowindow.open(map, marker);
                    marker.setAnimation(google.maps.Animation.DROP);
                    map.panTo(marker.position);  
                }                             
            }
        });

        // $("#map").css({"height": "50%"});
        // $(".footer").css({"height": "43%"});

        // this.toggleVisibility();
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
            setInfoContent(marker, infowindow);
            infowindow.open(map, this);
            self.searchText(this.name);
            // $('#list-filter').val(this.name);
        });

        markers.push(marker);
        self.showListings();
    }

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
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

    function getPhotos(item) {
        var baseImgURL = 'https://irs3.4sqi.net/img/general/'; // base url to retrieve venue photos

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + item.venue.id + '/photos?limit=1&client_id=RG0BDGPCIXRYCKU3MGO2K4NSMZQMEZG3PVX1IEQQ1W5V5OMF&client_secret=1OVPLSTAD3E0PNUHRMZVSFC24NJS0YATRZSTZ0BCWGPU5AKU&v=20130815',
            dataType: 'jsonp',
            success: function(data) {
                // console.log(data);

                var imgItems = data.response.photos.items[0].suffix;
                var venueImgURL = 'https://irs3.4sqi.net/img/general/width100' + imgItems;
                
                item.venue.photos = venueImgURL;

                console.log(item);

                self.placeList.push(new ListItem(item));
            }
        });
    }
        
}


/*Function to load the map and markers*/
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

    ko.applyBindings(new MapViewModel());
}
