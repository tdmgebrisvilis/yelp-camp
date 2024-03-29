// This script is for the map in the "show" page

// from mapbox docs, for displaying the map mapToken from show.ejs
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID (used in show.ejs)
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

// Add controlls to the map (zoom in/out etc.)
map.addControl(new mapboxgl.NavigationControl());

// Create a new marker.
new mapboxgl.Marker()
// coordinates of the marker
.setLngLat(campground.geometry.coordinates)
// when the user clicks on the marker
.setPopup(
    new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
)
.addTo(map);
