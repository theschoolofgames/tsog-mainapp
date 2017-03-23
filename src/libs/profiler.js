var Profiler = {};

var profilerTimestamps = {}

Profiler.startProfiling = function(id) {
	profilerTimestamps[id] = new Date().getTime();
}

Profiler.finishProfiling = function(id) {
	cc.assert(profilerTimestamps[id]);

	var duration = new Date().getTime() - profilerTimestamps[id];

	profilerTimestamps[id] = null;

	cc.log("Profiled %s: %d", id, duration);
}