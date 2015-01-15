Geocoder = function() {
    this.locations = [];
	this.locationsDep = new Deps.Dependency;

};

Geocoder.prototype.setElement = function(element) {
	console.log('geocoder: registering element')
	var self=this;
	var idle = true;
	var sequence = '';
    $(element).on('keyup', function(e) {    	var query = e.target.value;
    	if(query.length < 3 || !idle || sequence === query) {
    		self.setLocations([]);
    		sequence = '';
    		return;
    	}
    	sequence = query;
    	idle = false;
    	Geocoder.geocoder.query(query, function(err, data) {
    		if(err) {
    			throw Meteor.Error('geocoding-error', err);
    		}
    		idle = true;
    		// console.log(data);

    		var locations = _.map(data.results.features, function(f) {
    			return {name: f.place_name}
    		});
		    self.setLocations(locations);
    	});
    });
};

Geocoder.prototype.source = function(query, cb) {
	Geocoder.geocoder.query(query, function(err, data) {
		if(err) {
			throw Meteor.Error('geocoding-error', err);
		}
		var locations = _.map(data.results.features, function(f) {
			return {value: f.place_name}
		});
	    cb(locations);
	});
};

Geocoder.geocoderDep = new Deps.Dependency;

Geocoder.prototype.getLocations = function() {
	this.locationsDep.depend();
    return this.locations;
};

Geocoder.prototype.setLocations = function(locations) {
	this.locations = locations;
	this.locationsDep.changed();
};

Geocoder.prototype.query = function (query) {
	Geocoder.geocoderDep.depend();
	return Geocoder.instance ? Geocoder.instance.getLocations() : [];
};

Geocoder.setGeocoder = function(geocoder) {
	Geocoder.geocoder = geocoder;
	Geocoder.geocoderDep.changed();
};

Geocoder.getGeocoder = function() {
	Geocoder.geocoderDep.depend();
	return Geocoder.geocoder;
};
