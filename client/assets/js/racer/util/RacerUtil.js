Class(function RacerUtil() {
    Inherit(this, Events);
    var _this = this;
    var _time;
    var _debug = {};
    var _pushConsole = 0;
    
    //*** Constructor
    (function() {
        Global.ANIMATION_DELAY = 0;
        Global.GRADIENT = 'none';
        errorAlert();
        if (Global.TABLE && RacerDevice.mobile) __window.bind('touchstart', killTouch);
        if (Config.DEVELOPMENT) Hydra.ready(debugListeners);
    })();
    
    function errorAlert() {
        if (window.location.hash.strpos('enzyme')) {
            window.onerror = function(message, file, line) {
                if (!file) return false;
                file = file.split('assets/js/')[1];
                alert(message+' ::: '+file+' : '+line);
            };
        }
    }
    
    function debugListeners() {
        if (Config.DEVELOPMENT) {
            __window.keypress(function(e) {
               if (e.keyCode == 96) _this.events.fire(RacerEvents.DEBUG_DUMP);
               if (Global.TABLE_DEBUG) Data.SOCKET.forceRestart();
            });
            
            __window.bind('touchstart', function(e) {
                if (e.touches.length == 3) _this.events.fire(RacerEvents.DEBUG_DUMP);
            });
        }
    }
    
    function killTouch(e) {
        if (!_debug.touches) _debug.touches = [];
        _debug.touches.push(e.touches.length);
        
        if (_debug.touches.length > 10) {
            Data.SOCKET.forceRestart();
        }
        
        setTimeout(function() {
            _debug.touches = [];
        }, 500);
    }

    //*** Event handlers

    //*** Public Methods
    this.gradientIndex = function(index, isEnd) {
        index = index || 0;
        isEnd = isEnd || false;
        var gradient1 = (index-1 > -1) ? Config.COLORS[index-1] : null;
        var gradient2 = Config.COLORS[index];
        var gradient3 = (index+1 < Config.COLORS.length && !isEnd) ? Config.COLORS[index+1] : null;
        
        _this.gradient(gradient1, gradient2, gradient3);
    }
    
    this.gradient = function(gradient1, gradient2, gradient3) {
        var string = '-webkit-linear-gradient(left';
        if (gradient1) string += ', '+gradient1+' -40%';
        if (gradient2) string += ', '+gradient2+' 40%';
        if (gradient2) string += ', '+gradient2+' 60%';
        if (gradient3) string += ', '+gradient3+' 140%';
        string += ')';
        return string;
    }
    
    this.formatTime = function(time) {
        var minutes = parseInt( time / 60 ) % 60;
        var seconds = time % 60;
        var text = minutes + ":" + (seconds  < 10 ? "0" + seconds : seconds);
        return text;
    }
    
    this.formatPlace = function(place) {
        var text = '<div class="place-number first">1<sup>ST</sup></div>';
        switch (place) {
            case 1: text = '<div class="place-number">2<sup>ND</sup></div>'; break;
            case 2: text = '<div class="place-number">3<sup>RD</sup></div>'; break;
            case 3: text = '<div class="place-number">4<sup>TH</sup></div>'; break;
            case 4: text = '<div class="place-number">5<sup>TH</sup></div>'; break;
        }
        return text;
    }
    
    this.formatPlaceWord = function(place) {
        var text = 'FIRST';
        switch (place) {
            case 1: text = 'SECOND'; break;
            case 2: text = 'THIRD'; break;
            case 3: text = 'FOURTH'; break;
            case 4: text = 'FIFTH'; break;
        }
        return text;
    }
    
    this.checkDelay = function(offset) {
        if (!offset) {
            _time = Date.now();
        } else {
            var time = Date.now();
            var delay = time-_time-offset;
            Global.ANIMATION_DELAY = Math.round(delay);
            if (Global.ANIMATION_DELAY > 600) Global.ANIMATION_DELAY = 600;
            console.log(Global.DEVICE_NAME+' - DELAY: '+delay+'ms');
        }
    }
    
    this.pushConsole = function(c, t) {
        _pushConsole++;
        if (t) _pushConsole = 5;
        if (_pushConsole == 5) {
            _pushConsole = 0;
            console.log(c);
        }
    }
    
}, 'Static');
