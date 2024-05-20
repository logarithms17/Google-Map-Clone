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
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
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

}

