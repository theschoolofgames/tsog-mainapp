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
		this._listeningKeys.push("_created");

		this._init();
		this._listen(path);
	},

	fixCocosBugs: function() {
		// stupid bug where member variable is shared between object instances
		this._hasOnes = {};
		this._hasManys = {};
		this._defaultValues = [];
		this._listeningKeys = [];

		this._defaultValues["_created"] = true;
		this._listeningKeys.push("_created");
	},

	getId: function() {
		return this._id;
	},

	setDefaultValues: function(defaults) {
		cc.assert(!this._listened, "setDefaultValues() can only be called before _listen()");

		this._defaultValues = defaults;

		this._defaultValues["_created"] = true;
	},

	// TODO implement eagerLoad
	hasOne: function(key, modelClass, eagerLoad) {
		cc.assert(!this._listened, "hasOne() can only be called before _listen()");

		this._hasOnes[key] = { klass: modelClass, eagerLoad: eagerLoad == true };
	},

	// TODO implement eagerLoad
	hasMany: function(key, modelClass, eagerLoad) {
		cc.assert(!this._listened, "hasMany() can only be called before _listen()");

		this._hasManys[key] = { klass: modelClass, eagerLoad: eagerLoad == true };
	},

	_init: function() {
		var data = {};
        for (var i = 0; i < this._listeningKeys.length; i++) {
        	var key = this._listeningKeys[i];

    		if (this._defaultValues[key]) {
    			data[key] = this._defaultValues[key];
    		}

			// create field
	    	// "childrenIds" => "_childrenIds"
	    	this["_" + key] = data[key];
	    	this._defineGetterSetter(key);
        }
	},

	_defineGetterSetter: function(key) {
		var self = this;

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
	},

	_listen: function(path, cb) {
		let self = this;

		FirebaseManager.getInstance().fetchData(path, function(documentKey, data, isNull, fullPath) {
			debugLog(self._className + "._listen fetchData " + fullPath + ": " + JSON.stringify(data) + ", isNull: " + isNull);

			if (!isNull) {
				var dirtyKeyValues = {};

		        for (var i = 0; i < self._listeningKeys.length; i++) {
		        	var key = self._listeningKeys[i];

		        	// if (!data[key]) {
		        	// 	if (self._defaultValues[key]) {
		        	// 		dirtyKeyValues[key] = self._defaultValues[key];
		        	// 		data[key] = dirtyKeyValues[key];
		        	// 	}
		        	// }
		        	
			        self["_" + key] = data[key];
		        }


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

	_onFetchDependenciesCompleted: function() {
		this._fetchDependencyCallback && this._fetchDependencyCallback();
	},

	_setupDependency: function(key, klass, eagerLoad, isHasOne) {
		debugLog("  - " + this._className + "._setupDependency: " + key + ", eagerLoad: " + eagerLoad + ", type: " + (isHasOne ? "hasOne" : "hasMany"));
		var self = this;

		var idKey = key + "Id";
		if (!isHasOne) {
			idKey = idKey + "s";
			this["_" + key] = [];
		}

		// getter function
    	// "levelProgress" => "getLevelProgress()"
    	debugLog("    -> create function " + "get" + key.charAt(0).toUpperCase() + key.slice(1));
    	this["get" + key.charAt(0).toUpperCase() + key.slice(1)] = function() {
    		return self["_" + key];
    	}

    	// setter function
    	// "levelProgress" => "setLevelProgress()"
    	debugLog("    -> create function " + "set" + key.charAt(0).toUpperCase() + key.slice(1));
    	this["set" + key.charAt(0).toUpperCase() + key.slice(1)] = function(value) {
    		self["_" + key] = value;
    	}

		if (this["_" + idKey]) {
			var dependentIds = this["_" + idKey];
			if (isHasOne) {
				dependentIds = [dependentIds];
			}
			// debugLog("idKey: " + "_" + idKey + ", dependentIds: " + JSON.stringify(dependentIds));

			for(var i = 0; i < dependentIds.length; i++) {
				var id = dependentIds[i];

				this._increaseFetchDependencyCount();
				var obj = new klass(id, function(found) {
					self._decreaseFetchDependencyCount();
				});

				if (isHasOne) {
					this["_" + key] = obj;
				} else {
					this["_" + key].push(obj);
					// debugLog("    - push into " + "_" + key + ": " + JSON.stringify(obj));
				}
			}
		}
	},

	fetchDependencies: function(cb) {
		var self = this;

		debugLog(this._className + ".fetchDependencies:");

		this._fetchDependencyCallback = cb;

		this._fetchDependencyCount = 0;
		this._increaseFetchDependencyCount();

		for(var key in this._hasOnes) {
			this._setupDependency(key, this._hasOnes[key].klass, this._hasOnes[key].eagerLoad, true);
		}
		for(var key in this._hasManys) {
			this._setupDependency(key, this._hasManys[key].klass, this._hasManys[key].eagerLoad, false);
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
			this._onFetchDependenciesCompleted();
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