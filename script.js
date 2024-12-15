let map;
let startMarker, endMarker;


window.onload = () => {
    // Initialize the map
    map = L.map('map').setView([51.505, -0.09], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Set Locations Button Event Listener
    document.getElementById('set-locations').addEventListener('click', async () => {
        const startLocation = document.getElementById('start').value;
        const endLocation = document.getElementById('end').value;

        if (startLocation && endLocation) {
            // Geocode start location
            const startCoords = await geocodeLocation(startLocation);
            if (startCoords) {
                if (startMarker) map.removeLayer(startMarker); // Remove existing marker
                startMarker = L.marker(startCoords, { draggable: true }).addTo(map);
                startMarker.bindPopup('Start Location').openPopup();
                map.setView(startCoords, 13); // Center map on start location
            } else {
                alert('Invalid start location.');
            }

            // Geocode end location
            const endCoords = await geocodeLocation(endLocation);
            if (endCoords) {
                if (endMarker) map.removeLayer(endMarker); // Remove existing marker
                endMarker = L.marker(endCoords, { draggable: true }).addTo(map);
                endMarker.bindPopup('End Location').openPopup();
            } else {
                alert('Invalid end location.');
            }
        } else {
            alert('Please enter both start and end locations.');
        }
    });

    // Calculate Route Button Event Listener
    document.getElementById('calculate').addEventListener('click', async () => {
        if (startMarker && endMarker) {
            const startCoords = startMarker.getLatLng();
            const endCoords = endMarker.getLatLng();

            // Call the routing API
            const route = await calculateRoute(startCoords, endCoords);
            if (route) {
                console.log('Route:', route);
                drawRoute(route.geometry.coordinates); // Draw the route on the map
                displayResults(route.properties.summary); // Display distance and duration
            } else {
                alert('Could not calculate the route. Please try again.');
            }
        } else {
            alert('Please set both start and end locations.');
        }
    });
};

// Function to geocode a location using OpenStreetMap Nominatim API
async function geocodeLocation(location) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];
            return [parseFloat(lat), parseFloat(lon)];
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }
    return null;
}

// Function to calculate the route using OpenRouteService
async function calculateRoute(start, end) {
    const apiKey = 'placeholder'; // replace w your own API key
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        return data.features[0]; // Return the first route
    } catch (error) {
        console.error('Error fetching route:', error);
        return null;
    }
}

// Function to draw the route on the map
function drawRoute(coordinates) {
    const latLngs = coordinates.map(([lng, lat]) => [lat, lng]);
    L.polyline(latLngs, { color: 'blue', weight: 5 }).addTo(map);
}

// Function to display results
function displayResults(summary) {
    console.log('Summary object:', summary); // Debugging log
    const results = document.getElementById('results');
    results.innerHTML = `
        <p><strong>Distance:</strong> ${(summary.distance / 1000).toFixed(2)} km</p>
        <p><strong>Duration:</strong> ${(summary.duration / 60).toFixed(1)} minutes</p>
    `;
}

