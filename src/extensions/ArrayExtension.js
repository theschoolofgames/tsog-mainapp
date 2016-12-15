Array.prototype.indexOfObj = function(member) {
    for (var i = 0; i < this.length; i++) {
        if (JSON.stringify(this[i]) == JSON.stringify(member))
            return i;
    }
    return -1;
}
