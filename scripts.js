document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('outer-reload').addEventListener('mouseover', function () {
        var image = document.getElementById('reload');
        image.src = '/content/refresh-010626.png';
    });
    document.getElementById('outer-reload').addEventListener('mouseout', function () {
        var image = document.getElementById('reload');
        image.src = '/content/refresh-white.png';
    });

    var height = document.documentElement.clientHeight * 0.7;
    var width = document.documentElement.clientWidth * 0.9;
    const world = Globe({ animateIn: false, waitForGlobeReady: true })
        (document.getElementById('globeViz'))
        .width(width)
        .height(height)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .pointOfView({ lat: 51, lng: 9, altitude: 1.6 }) // aim at Germany
        .polygonAltitude(0.05)
        .polygonCapColor(() => '#056CF2')
        .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
        .polygonCapCurvatureResolution(5)
        .labelsData([
            {
                lat: 51.5,
                lng: 10,
                text: 'Germany',
                altitude: 0.099,
                dotradius: 1.2,
                size: 1.7,
                color: '#0000001' // Set the color to black (#000000) for the first label
            },
            { //Background
                lat: 51.7,
                lng: 10,
                text: 'Germany',
                altitude: 0.1,
                dotradius: 1.2,
                size: 1.75,
                color: '#000000'
            }
        ]).labelLat(d => d.lat)
        .labelLng(d => d.lng)
        .labelText(d => d.text)
        .labelSize(d => d.size) // Adjust label size as needed
        .labelDotRadius(d => d.dotradius)
        .labelAltitude(d => d.altitude) // Set label altitude from the data
        .labelColor(d => d.color)
        .polygonStrokeColor(() => '#FFF')
        .backgroundColor('#010626');

    fetch('./content/font.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            labelfont = data;
        })
        .catch(error => {
            console.error('Error fetching labelfont:', error);
        });
        
        world.labelTypeFace(labelfont)

    fetch('./content/simplifiedmap.geojson').then(res => res.json()).then(countries => {
        world.polygonsData(countries.features);
    });

    function resizeGlobe() {
        var height = document.documentElement.clientHeight * 0.7;
        var width = document.documentElement.clientWidth * 0.9;
        if (height > 500) {
            world.height(height);
        }
        if (height < 500) {
        }
    }

    handleRefreshClick();

    // Call the resizeGlobe function on page load and window resize
    window.addEventListener('resize', resizeGlobe);
    document.addEventListener('DOMContentLoaded', resizeGlobe);
    window.addEventListener('load', resizeGlobe); // Additional load event to ensure all resources are loaded

    function makeSyncingRequest() {
        const rpcEndpoint = 'https://idenanode.com';
        const payload = {
            method: 'bcn_syncing',
            params: [],
            id: 1,
            key: '22ref1stat122',
        };

        return axios.post(rpcEndpoint, payload)
            .then(response => response.data)
            .catch(error => {
                console.error('Error:', error);
                throw error;
            });
    }

    function handleRefreshClick() {

        //world.labelColor(() => 'rgba(0, 0, 0, 1)');

        world.labelColor(d => {
            if (d.text === 'Germany' && d.color !== '#000000') {
                return 'rgba(0, 0, 0, 0.6)'; // Keep the shadow 0.6 opacity on refresh
            }
        });

        makeSyncingRequest()
            .then(data => {
                console.log(data);
                // Determine color based on 'syncing' field
                const labelColor = data.result.syncing ? '#FF681E' : '00FF00';

                // Update label colors
                world.labelColor(d => {
                    if (d.text === 'Germany' && d.color !== '#000000') {
                        return 'rgba(0, 0, 0, 0.6)'; // Keep the 'Germany' label black
                    } else if (d.text === 'Germany') {
                        return labelColor; // Change color for the 'Another Label'
                    } else {
                        return d.color; // Keep other labels' color as is
                    }
                });
            })
            .catch(error => {
                console.error('Error:', error);
                // Offline color
                const offlineColor = '#FF000D';

                // Update label colors
                world.labelColor(d => {
                    if (d.text === 'Germany' && d.color !== '#000000') {
                        return 'rgba(0, 0, 0, 0.6)'; // Keep the 'Germany' label black
                    } else if (d.text === 'Germany') {
                        return offlineColor; // Change color for the 'Another Label'
                    } else {
                        return d.color; // Keep other labels' color as is
                    }
                });
            });
    }

    const refreshInput = document.getElementById('reload');
    const reloadDiv = document.getElementById('outer-reload');

    reloadDiv.addEventListener('click', function () {
        refreshInput.classList.add('rotate-animation');
        setTimeout(function () {
            refreshInput.classList.remove('rotate-animation');
        }, 500);
        handleRefreshClick();
    });

});
