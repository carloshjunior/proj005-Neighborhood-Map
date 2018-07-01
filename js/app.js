var flickr_key = '9b55be068bfbda700f1805e2c7ee01b0';
var flickr_secret = 'fc1c33e3e00ba84e'

var center = {lat: -39.5000, lng: 175.5000};
var map;
var marker;
var markers = [];
var infowindow;

var locations = [
  {
    title : 'Tongariro National Park',
    location: {lat: -39.2727, lng: 175.5802}
    //https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/
  },
  {
    title : 'Lake Tutira',
    location: {lat: -39.2235, lng: 176.8935}
    //https://www.doc.govt.nz/parks-and-recreation/places-to-go/hawkes-bay/places/tutira-area/
  },
  {
    title : 'Whanganui National Park',
    location: {lat: -39.2723, lng: 174.9193}
    //https://www.doc.govt.nz/parks-and-recreation/places-to-go/manawatu-whanganui/places/whanganui-national-park/
  },
  {
    title : 'Egmont National Park',
    location: {lat: -39.2997, lng: 174.0663}
    //https://www.doc.govt.nz/parks-and-recreation/places-to-go/taranaki/places/egmont-national-park/
  },
  {
    title : 'Waitomo',
    location: {lat: -38.4636, lng: 175.0233}
    //https://www.doc.govt.nz/parks-and-recreation/places-to-go/waikato/places/waitomo-area/
  },
  {
    title : 'Lake Taupo',
    location: {lat: -38.7916 , lng: 175.9150}
    //https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/taupo-area/
  },
  {
    title : 'Lake Tikitapu',
    location: {lat: -38.2000, lng: 176.3333}
    //https://www.doc.govt.nz/parks-and-recreation/places-to-go/bay-of-plenty/places/lake-tikitapu-scenic-reserve/
  },
  {
    title : 'Taputeranga Marine Reserve',
    location: {lat: -41.3463, lng: 174.7896}
  }
]


// Initialize Map
function initMap() {
  // create a map object and get map from DOM for display
  map = new google.maps.Map(document.getElementById("map"), {
      center: center,
      zoom: 7
  });
  createMarkersForPlaces();
}

// Create Markers for all Places
function createMarkersForPlaces(){
  var infoWindow = new google.maps.InfoWindow();
  for (i = 0; i < locations.length; i++) {
    (function() {
      var title = locations[i].title;
      var location = locations[i].location;

      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP
      });

      markers.push(marker);
      ViewModel.places()[i].marker = marker;
      marker.addListener('click', function() {
        populateInfoWindow(this, infoWindow);
      });
    })(i);
  }
}

// Create InfoWindow for each marker
function populateInfoWindow(marker, infoWindow) {
  if (infoWindow.marker != marker) {
    infoWindow.marker = marker;
    getFlickRPhoto(marker, infoWindow);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 2000);
    infoWindow.open(map, marker);
    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });
  }
}


// get FlickR Photo
function getFlickRPhoto(marker, infoWindow){
  var flickrURL = "https://api.flickr.com/services/rest/";
  flickrURL += '?' + $.param({
    'method' : 'flickr.photos.search',
    'api_key' : flickr_key,
    'text' : marker.title,
    'tags' : 'landscape',
    'privacy_filter' : '1',
    'content_type' : '1',
    'per_page' : '1',
    'page' : '1',
    'format' : 'json',
    'nojsoncallback' : '1'
  });

  $.ajax({
    url: flickrURL,
    method: 'GET',
  }).done(function(result) {
    photos = result.photos.photo
    for (var i=0; i< photos.length; i++){
      var imageUrl = 'https://farm' + photos[i].farm + '.staticflickr.com/' +
                  photos[i].server + '/' + photos[i].id + '_' +
                  photos[i].secret + '.jpg';
      infoWindow.setContent('<div class="title">' + marker.title +
        '</div><img class="flickrImg" src=\"' + imageUrl + '\">');
    };
  });
}

// Model Place
var Place = function(data){
  var self = this;
  this.title = data.title;
  this.location = data.location;
  this.show = ko.observable(true);
}

// View Model
var ViewModel = function(){
  var self = this;

  // Observables
  this.places = ko.observableArray();
  this.filteredText = ko.observable('');

  // Create Places by default locations
  for (i = 0; i < locations.length; i++) {
    self.places.push(new Place(locations[i]));
  }

  // Search filter
  this.search = ko.computed(function() {
      // LowerCase text to Search
      var filter = self.filteredText().toLowerCase();
      // Look all places
      for (i = 0; i < self.places().length; i++) {
          // Compare place Title with input text search
          if (self.places()[i].title.toLowerCase().indexOf(filter) > -1) {
              // Show place
              self.places()[i].show(true);
              if (self.places()[i].marker) {
                  self.places()[i].marker.setVisible(true);
              }
          } else {
              // Hide place
              self.places()[i].show(false);
              if (self.places()[i].marker) {
                  self.places()[i].marker.setVisible(false);
              }
          }
      }
  });

  // Show Place
  this.showPlace = function(locations) {
      google.maps.event.trigger(locations.marker, 'click');
  };

}

ViewModel = new ViewModel();

ko.applyBindings(ViewModel);
