Array.prototype.indexOfPoint = function(member) {
    for (var i = 0; i < this.length; i++) {
        if (cc.pSameAs(this[i], member))
            return i;
    }
    return -1;
}
