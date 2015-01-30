GeocoderGoogle = {};

var url = 'https://maps.google.com/maps/api/geocode/json',
    params = {
        address: '',
        components: 'route',
        sensor: true
    };

GeocoderGoogle.ttAdapter = function(query, cb) {
    var options = {
        params: _.extend({}, params, {
            address: query
        })
    };
    HTTP.get(url, options, function(error, result) {
        if (error) {
            throw Meteor.Error('geocoding-error', error);
        }
        var results = _.filter(result.data.results, function(value) {
            return _.intersection(value.types, [
                'route',
                'street_address',
                'premise',
                'subpremise',
                'locality'
            ]).length > 0;
        });
        var locations = _.map(results, function(f) {
            return {
                value: f.formatted_address,
                location: {
                    type: 'Point',
                    coordinates: _.values(_.pick(f.geometry.location, 'lat', 'lng'))
                }
            }
        });
        cb(locations);
    });
}
