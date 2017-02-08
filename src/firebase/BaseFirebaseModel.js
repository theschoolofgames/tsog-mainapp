var BaseFirebaseModel = cc.Class.extend({
	_className: "BaseFirebaseModel",

	_id: null,
	_defaultValues: [],
	_listeningKeys: [],
	_hasOnes: {},
	_hasManys: {},
	_initCallback: null,
	_listened: false,
	_path: null,

	_fetchDependencyCallback: null,
	_fetchDependencyCount: 0,

	ctor: function(path, id, keys, initCallback) {
		this._id = id;
		this._initCallback = initCallback;
		this._path = path;
		this._listeningKeys = keys;

		this._init();
		this._listen(path);
	},

	getId: function() {
		return this._id;
	},

	setDefaultValues: function(defaults) {
		cc.assert(!this._listened, "setDefaultValues() can only be called before _listen()");

		this._defaultValues = defaults;
	},

	hasOne: function(key, modelClass) {
		cc.assert(!this._listened, "hasOne() can only be called before _listen()");

		this._hasOnes[key] = modelClass;
	},

	hasMany: function(key, modelClass) {
		cc.assert(!this._listened, "hasMany() can only be called before _listen()");

		this._hasManys[key] = modelClass;
	},

	_init: function() {
		var self = this;
		var data = {};
        for (var i = 0; i < self._listeningKeys.length; i++) {
        	var key = self._listeningKeys[i];

    		if (self._defaultValues[key]) {
    			data[key] = self._defaultValues[key];
    		}

        	// create field
        	// "childrenIds" => "_childrenIds"
        	self["_" + key] = data[key];

        	// getter function
        	// "childrenIds" => "getChildrenIds"
        	self["get" + key.charAt(0).toUpperCase() + key.slice(1)] = function() {
        		return self["_" + key];
        	}

        	// setter function
        	// "childrenIds" => "setChildrenIds"
        	self["set" + key.charAt(0).toUpperCase() + key.slice(1)] = function(value) {
        		self["_" + key] = value;
        		var kv = {};
        		kv[key] = value;
        		self._updateData(kv);
        	}
        }
	},

	_listen: function(path, cb) {
		let self = this;

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
		        }

		        self["_" + key] = data[key];

	            if (Object.keys(dirtyKeyValues).length > 0) {
	            	self._updateData(dirtyKeyValues);
	            }

	            debugLog("  -> result: " + JSON.stringify(self));

	            self._initCallback && self._initCallback(true);
		        self._initCallback = null;
	        } else {
	        	self._initCallback && self._initCallback(false);
	        	self._initCallback = null;
	        }
        });

        this._listened = true;
	},

	_updateData: function(changedKeyValues) {
		debugLog(this._className + "._updateData: " + JSON.stringify(changedKeyValues));
		FirebaseManager.getInstance().updateChildValues(this._path, changedKeyValues);
	},

	_toPureData: function() {
		var data = {};
		for (var i = 0; i < this._listeningKeys.length; i++) {
        	var key = this._listeningKeys[i];
			data[key] = this["_" + key];
		}
		return data;
	},

	create: function() {
		debugLog(this._className + ".create with path '" + this._path + "' and pure data: " + JSON.stringify(this._toPureData()));
		FirebaseManager.getInstance().setData(this._path, this._toPureData());
	},

	fetchDependencies: function(cb) {
		var self = this;

		debugLog(this._className + ".fetchDependencies:");

		this._fetchDependencyCallback = cb;

		this._fetchDependencyCount = 0;
		this._increaseFetchDependencyCount();

		for(var key in this._hasOnes) {
			debugLog("  - hasOne: " + key);
			var klass = this._hasOnes[key];
			var idKey = key + "Id";
			if (this["_" + idKey]) {

			}
		}

		for(var key in this._hasManys) {
			debugLog("  - hasMany: " + key);
			var klass = this._hasManys[key];
			var idKey = key + "Ids";

			this["_" + key] = [];
			var objArray = this["_" + key];

			// getter function
        	// "children" => "getChildren"
        	this["get" + key.charAt(0).toUpperCase() + key.slice(1)] = function() {
        		return this["_" + key];
        	}

        	debugLog("_" + idKey + ": " + JSON.stringify(this["_" + idKey]));

			if (this["_" + idKey]) {
				var ids = this["_" + idKey];
				for(var i = 0; i < ids.length; i++) {
					var id = ids[i];

					this._increaseFetchDependencyCount();
					var obj = new klass(id, function(found) {
						self._decreaseFetchDependencyCount();
					});
					objArray.push(obj);
				}
			}
		}

		this._decreaseFetchDependencyCount();
	},

	_increaseFetchDependencyCount: function() {
		this._fetchDependencyCount++;
		debugLog(this._className + "._increaseFetchDependencyCount(). It's now: " + this._fetchDependencyCount);
	},

	_decreaseFetchDependencyCount: function() {
		this._fetchDependencyCount--;
		debugLog(this._className + "._decreaseFetchDependencyCount(). It's now: " + this._fetchDependencyCount);
		if (this._fetchDependencyCount == 0) {
			this._fetchDependencyCallback && this._fetchDependencyCallback();
		}
	},
});

// var TestModel = BaseFirebaseModel.extend({
// 	_className: "TestModel",
// 	ctor: function(id, initCallback) {
// 		this.setDefaultValues({
// 			"name": "tester",
// 			"diamond": 2
// 		});

// 		this._super("/children/" + id, ["coin", "diamond", "name"], initCallback);
// 	}
// })

// TestModel.find = function(id, cb) {
// 	var obj = new TestModel(id, cb);
// }