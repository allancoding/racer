Class(function ConfigModel(_data) {
    var _this = this;
    var _tip;
    
    //*** Constructor
    (function() {
        setCountry();
    })();
    
    function setCountry() {
        var code = window.__COUNTRY_CODE || 'US';
        for (var i = 0; i < _data.music_countries.length; i++) {
            if (code.strpos(_data.music_countries[i]) || _data.music_countries[i].strpos(code)) {
                Config.DOWNLOAD_TRACK = true;
            }
        }
    }

    //*** Public Methods
    this.swearFilter = function(name) {
        name = name.toUpperCase();
        for (var i = _data.banned_words.length-1; i > -1; i--) {
            if (name == _data.banned_words[i]) return true;
        }
        return false;
    }
    
    this.getProTip = function() {
    }
});