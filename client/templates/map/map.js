Template.map.rendered = function() {
    this.autorun(function() {
        if (!Mapbox.loaded()) {
            window.addEventListener('polymer-ready', function(e) {
                console.log('initializing mapbox');
                Mapbox.load();
            });

        } else {

            L.mapbox.accessToken = 'pk.eyJ1IjoiamhvaGxmZWxkIiwiYSI6IjRVTFJXY0EifQ.K8QEmAJhBKxRt3eJ7fA8eA';
            var map = L.mapbox.map('map', 'jhohlfeld.klaa8f80', {
                zoomControl: false
            });

            var zoom = L.control.zoom({
                position: 'topright'
            });

            map.addControl(zoom);

            $('.ui.dropdown').dropdown();
            $('.ui.accordion').accordion();
        }
    });
};
