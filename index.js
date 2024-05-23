mapboxgl.accessToken = 'pk.eyJ1IjoibG9nYXJpdGhtczE3IiwiYSI6ImNsd2Q0ZHNidDE4MHgycXBxejRycmozN3oifQ.F9ZA7lryHOaXMayqxWqvag';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {enableHighAccuracy: true}) //to track your current location with an option enableHighAccuracy to get accurate location

function successLocation(position) {
    console.log(position)
    setupMap([position.coords.longitude, position.coords.latitude])
}


function errorLocation(position) {
    const message = document.querySelector(".message")
    const map = document.querySelector("#map")
    const errorMessage = `<h1>Location not Found!</h1>`
    
    message.insertAdjacentHTML("beforeEnd", errorMessage)
    map.classList.add("hidden")

}

const setupMap = (center) => {
    const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
    center: center, // starting position [lng, lat]
    zoom: 16, // starting zoom
    });
    map.addControl(new mapboxgl.NavigationControl()); //navigation control

    map.addControl( //direction control
        new MapboxDirections({
            accessToken: mapboxgl.accessToken
        }),
        'top-left'
    );

    map.addControl(new mapboxgl.FullscreenControl({container: document.querySelector('body')})); // adds full screen button


    const distanceContainer = document.getElementById('distance');

    // GeoJSON object to hold our measurement features
    const geojson = {
        'type': 'FeatureCollection',
        'features': []
    };

    // Used to draw a line between points
    const linestring = {
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': []
        }
    };

    map.on('load', () => {
        map.addSource('geojson', {
            'type': 'geojson',
            'data': geojson
        });

        // Add styles to the map
        map.addLayer({
            id: 'measure-points',
            type: 'circle',
            source: 'geojson',
            paint: {
                'circle-radius': 5,
                'circle-color': '#000'
            },
            filter: ['in', '$type', 'Point']
        });
        map.addLayer({
            id: 'measure-lines',
            type: 'line',
            source: 'geojson',
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': '#000',
                'line-width': 2.5
            },
            filter: ['in', '$type', 'LineString']
        });

        map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['measure-points']
            });

            // Remove the linestring from the group
            // so we can redraw it based on the points collection.
            if (geojson.features.length > 1) geojson.features.pop();

            // Clear the distance container to populate it with a new value.
            distanceContainer.innerHTML = '';

            // If a feature was clicked, remove it from the map.
            if (features.length) {
                const id = features[0].properties.id;
                geojson.features = geojson.features.filter(
                    (point) => point.properties.id !== id
                );
            } else {
                const point = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [e.lngLat.lng, e.lngLat.lat]
                    },
                    'properties': {
                        'id': String(new Date().getTime())
                    }
                };

                geojson.features.push(point);
            }

            if (geojson.features.length > 1) {
                linestring.geometry.coordinates = geojson.features.map(
                    (point) => point.geometry.coordinates
                );

                geojson.features.push(linestring);

                // Populate the distanceContainer with total distance
                const value = document.createElement('pre');
                const distance = turf.length(linestring);
                value.textContent = `Total distance: ${distance.toLocaleString()}km`;
                distanceContainer.appendChild(value);
            }

            map.getSource('geojson').setData(geojson);
        });
    });

    map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });
        // Change the cursor to a pointer when hovering over a point on the map.
        // Otherwise cursor is a crosshair.
        map.getCanvas().style.cursor = features.length
            ? 'pointer'
            : 'crosshair';
    });

}

