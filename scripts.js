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
        .labelsData([{ lat: 51.5, lng: 10, text: 'Germany', altitude: 0.1, dotradius: 1.2 }]) // Sample label data for Germany
        .labelLat(d => d.lat)
        .labelLng(d => d.lng)
        .labelText(d => d.text)
        .labelSize(1.7) // Adjust label size as needed
        .labelDotRadius(d => d.dotradius)
        .labelAltitude(d => d.altitude) // Set label altitude from the data
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
            // Do something with labelfont here after it has been fetched and processed
        })
        .catch(error => {
            console.error('Error fetching labelfont:', error);
        });

    fetch('./content/simplifiedmap.geojson').then(res => res.json()).then(countries => {
        world.polygonsData(countries.features);
        world.labelTypeFace(labelfont)
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
        
        world.labelColor(() => 'rgba(0, 0, 0, 1)');

        makeSyncingRequest()
            .then(data => {
                console.log(data);
                // Check if 'syncing' field is true
                if (data.result.syncing) {
                    // Syncing
                    world.labelColor(() => '#FF681E');
                } else {
                    // Online
                    world.labelColor(() => '00FF00');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Offline
                world.labelColor(() => '#FF000D');
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
