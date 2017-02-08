var BaseFirebaseModel = cc.Class.extend({
	_className: "BaseFirebaseModel",
	_defaultValues: [],
	_listeningKeys: [],
	_initCallback: null,
	_path: null,

	ctor: function(path, keys, initCallback) {
		this._initCallback = initCallback;
		this._path = path;
		this._listen(path, keys);
	},

	setDefaultValues: function(defaults) {
		this._defaultValues = defaults;
	},

	_listen: function(path, keys, cb) {
		let self = this;

		this._listeningKeys = keys;

		FirebaseManager.getInstance().fetchData(path, function(documentKey, data, isNull, fullPath) {
			debugLog(self._className + "._listen fetchData " + fullPath + ": " + JSON.stringify(data) + ", isNull: " + isNull);

			if (!isNull) {
				var dirtyKeyValues = {};

	            for (var i = 0; i < self._listeningKeys.length; i++) {
	            	var key = self._listeningKeys[i];

	            	if (!data[key]) {
	            		if (self._defaultValues[key]) {
	            			dirtyKeyValues[key] = self._defaultValues[key];
	            			data[key] = dirtyKeyValues[key];
	            		}
	            	}

	            	self[key] = data[key];
	            }

	            if (Object.keys(dirtyKeyValues).length > 0) {
	            	self._update(dirtyKeyValues);
	            }

	            debugLog("  -> result: " + JSON.stringify(self));

	            self._initCallback && self._initCallback(true);
	            self._initCallback = null;
	        } else {
	        	self._initCallback && self._initCallback(false);
	        	self._initCallback = null;
	        }
        });
	},

	_update: function(keyvalues) {
		debugLog(this._className + "._update: " + JSON.stringify(keyvalues));
		FirebaseManager.getInstance().updateChildValues(this._path, keyvalues);
	}
});

var User = BaseFirebaseModel.extend({
	_className: "User",
	ctor: function(id, initCallback) {
		this.setDefaultValues({
			"name": "tester",
			"diamond": 2
		});

		this._super("/children/" + id, ["coin", "diamond", "name"], initCallback);
	}
})

TestModel.find = function(id, cb) {
	var obj = new TestModel(id, cb);
}