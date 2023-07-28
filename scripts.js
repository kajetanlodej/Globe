

document.addEventListener("DOMContentLoaded", function () {
    const globeContainer = document.getElementById('globeContainer');
    const world = Globe()
        (document.getElementById('globeViz'))
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .pointOfView({ lat: 51, lng: 9, altitude: 1 }) // aim at Germany
        .polygonCapColor(() => 'rgba(144, 191, 246, 0.7)')
        .polygonSideColor(() => 'rgba(0, 200, 0, 0.1)')
        .labelsData([{ lat: 51, lng: 9, text: 'Germany', altitude: 0.05 }]) // Sample label data for Germany
        .labelLat(d => d.lat)
        .labelLng(d => d.lng)
        .labelText(d => d.text)
        .labelSize(2) // Adjust label size as needed
        .labelResolution(1)
        .labelDotRadius(1)
        .labelAltitude(d => d.altitude) // Set label altitude from the data
        .polygonStrokeColor(() => '#FFF');


        fetch('./simplifiedmap.geojson').then(res => res.json()).then(countries => {
            world.polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'));
        });

    function resizeGlobe() {
        const width = globeContainer.offsetWidth;
        const height = globeContainer.offsetHeight;
        world.width(width);
        world.height(height);
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
                    world.labelColor(() => 'rgba(255, 172, 66, 0.8)');
                } else {
                    // Online
                    world.labelColor(() => 'rgba(112, 238, 70, 0.8)');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Offline
                world.labelColor(() => 'rgba(255, 9, 70, 0.93)');
            });
    }

    const refreshInput = document.getElementById('reload');
    const reloadDiv = document.getElementById('inner-status-icon');

    reloadDiv.addEventListener('click', function () {
        refreshInput.classList.add('rotate-animation');
        setTimeout(function () {
            refreshInput.classList.remove('rotate-animation');
        }, 500);
        handleRefreshClick();
    });




});
