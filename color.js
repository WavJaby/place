function Color(hex) {
    this.r = (hex >>> 16) & 0xFF;
    this.g = (hex >>> 8) & 0xFF;
    this.b = hex & 0xFF;
}
Color.prototype.toString = function() {
    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
}