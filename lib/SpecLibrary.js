SpecLibrary = function () {
  this.specNameToSpec = {};
};

SpecLibrary.prototype = {

	constructor: SpecLibrary,

	get: function( specName, callback ) {
    return this.specNameToSpec[ specName ];
  },

  add: function( spec ) {
    this.specNameToSpec[ spec.name ] = spec;
  }

};

module.exports = SpecLibrary;
