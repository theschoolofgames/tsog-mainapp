var KVDatabase = cc.Class.extend({
	_impl: null,
	_cache: {},

	ctor: function(implementation) {
		this._impl = implementation;
	},

	getString: function(key, defaultValue) {
		var defaultValue = defaultValue != undefined ? defaultValue : "";
		if(this._cache.hasOwnProperty(key))
			return this._cache[key];

		var value = this._impl.getItem(key);
		if (value) this._cache[key] = value;
		return value ? value : defaultValue;
	},

	getInt: function(key, defaultValue) {
		var defaultValue = defaultValue != undefined ? defaultValue : 0;
		if(this._cache.hasOwnProperty(key))
			return this._cache[key];

		var value = this._impl.getItem(key);
		// cc.log("KVDatabase.getInt(%s, %d): %s", key, defaultValue, value);
		if (value == null || value == "")
			return defaultValue;
		else {
			value = parseInt(value);
			this._cache[key] = value;
			return value;
		}
	},

	set: function(key, value) {
		// cc.log("KVDatabase.set: %s, %s", key, value);
		this._cache[key] = value;
		return this._impl.setItem(key, value);
	},

	remove: function(key) {
		delete this._cache[key];
		this._impl.removeItem(key);
	}
});

KVDatabase._instance = null;

KVDatabase.getInstance = function() {
	cc.assert(KVDatabase._instance, "you must call setupInstance() first!");
	return KVDatabase._instance;
};

KVDatabase.setupInstance = function(impl) {
	KVDatabase._instance = new KVDatabase(impl);
};