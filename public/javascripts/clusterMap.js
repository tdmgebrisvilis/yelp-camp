// mapbox token
mapboxgl.accessToken = mapToken;
// create the map
const map = new mapboxgl.Map({
container: 'cluster-map', // container ID (used in index.ejs)
// Use regular map projection type instead of the default globe projection.
projection: 'naturalEarth',
// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
style: 'mapbox://styles/mapbox/light-v11',
center: [-103.5917, 40.6699],
zoom: 3
});

// Add controlls to the map (zoom in/out etc.)
map.addControl(new mapboxgl.NavigationControl());
 
map.on('load', () => {
// Add a new source from our GeoJSON data and
// set the 'cluster' option to true. GL-JS will
// add the point_count property to your source data.
map.addSource('campgrounds', { // campgrounds is now registered as a source of data for a map
type: 'geojson',
// Point to GeoJSON data of the campgrounds.
data: campgrounds,
cluster: true,
clusterMaxZoom: 14, // Max zoom to cluster points on
clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
});
 
map.addLayer({
id: 'clusters',
type: 'circle',
source: 'campgrounds', // campgrounds is now being refered back to as we are adding this and other layers 
filter: ['has', 'point_count'],
paint: {
// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
// with three steps to implement three types of circles:
//   * Blue, 20px circles when point count is less than 100
//   * Yellow, 30px circles when point count is between 100 and 750
//   * Pink, 40px circles when point count is greater than or equal to 750
'circle-color': [
'step',
['get', 'point_count'],
'#90e0ef', // color
20, // point count
'#00b4d8',
50,
'#0096c7'
],
'circle-radius': [
'step',
['get', 'point_count'],
20, // circle radius
10, // point count
30, // circle radius
30, // point count
40 // circle radius with point count > than 750
]
}
});
 
map.addLayer({
id: 'cluster-count',
type: 'symbol',
source: 'campgrounds',
filter: ['has', 'point_count'],
layout: {
'text-field': ['get', 'point_count_abbreviated'],
'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
'text-size': 12
}
});
 
map.addLayer({
id: 'unclustered-point',
type: 'circle',
source: 'campgrounds',
filter: ['!', ['has', 'point_count']],
paint: {
'circle-color': '#f79d65',
'circle-radius': 10,
'circle-stroke-width': 1,
'circle-stroke-color': '#fff'
}
});
 
// inspect a cluster on click
map.on('click', 'clusters', (e) => {
const features = map.queryRenderedFeatures(e.point, {
layers: ['clusters']
});
const clusterId = features[0].properties.cluster_id;
map.getSource('campgrounds').getClusterExpansionZoom(
clusterId,
(err, zoom) => {
if (err) return;
 
map.easeTo({
center: features[0].geometry.coordinates,
zoom: zoom
});
}
);
});
 
// When a click event occurs on a feature in
// the unclustered-point layer, open a popup at
// the location of the feature, with
// description HTML from its properties.
map.on('click', 'unclustered-point', (e) => {
    // in this case the "e" (event) is "campground". "properties.popUpMarkup" is available because I've set it up in the campgrounds model.
    const { popUpMarkup } = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();
 
// Ensure that if the map is zoomed out such that
// multiple copies of the feature are visible, the
// popup appears over the copy being pointed to.
while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
}
 
new mapboxgl.Popup()
    .setLngLat(coordinates)
    // show the "popUpMarkup" when an unclustered point is clicked on.
    .setHTML(popUpMarkup)
    .addTo(map);
});
 
map.on('mouseenter', 'clusters', () => {
map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'clusters', () => {
map.getCanvas().style.cursor = '';
});
});