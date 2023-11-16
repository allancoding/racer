Class(function TrackTitleView(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $bg, $text;
    var _size = window.innerHeight/9;
    var _time = 400;
    var _delay = 200;
    var _scaleIn = _config.bg ? 0.3 : 0.5;
    var _scaleOut = 1.2;
    var _fallback = _config.fallback || !RacerDevice.animate;
    
    //*** Constructor
    (function() {
        initHTML();
        addListeners();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').setZ(1000).mouseEnabled(false);
        if (!_config.visible) $this.invisible();
        if (_config.z) $this.setZ(_config.z);
        
        if (_config.bg) {
            $bg = $('.bg');
            $bg.size('100%').bg(_config.bg);
            $this.addChild($bg);
        }
        
        $text = $('.text');
        $text.fontStyle('AvantGarde-BoldObl', 20, '#fff');
        $text.css({ width: '100%', textAlign: 'center', top: '50%', whiteSpace: 'nowrap' });
        $text.text(_config.text);
        $text.rotation = _config.bg ? -10 : 0;
        $text.skewY = _config.bg ? -5 : 0;
        $text.transform({ rotation: $text.rotation, skewY: $text.skewY });
        
        $this.addChild($text);
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
    }
    
    function resizeHandler() {
        _size = window.innerWidth*(_config.bg ? 0.2 : 0.15)+2;
        var margin = (RacerDevice.chrome_iphone && Global.TABLE) ? -_size : -_size*0.5;
        $text.css({ fontSize: _size, marginTop: margin, left: -_size*0.1 });
    }

    //*** Public Methods   
    this.animateIn = function(callback) {
        if (!$this || !$text) return false;
        if (!_fallback) {
            $this.visible();
            if ($bg) $this.css({ opacity: 0 }).tween({ opacity: 1 }, _time/2, 'easeOutSine');
            if ($text.rotation) $text.transform({ scale: _scaleIn, rotation: $text.rotation, skewY: $text.skewY });
            else $text.transform({ scale: _scaleIn });
            $text.css({ opacity: _config.bg ? 1 : 0 }).tween({ scale: 1, opacity: 1 }, _time, 'easeOutCubic');
        } else {
            $this.visible();
            $text.css({ opacity: 0 }).tween({ opacity: 1 }, _time*0.6, 'easeOutSine', _time*0.1);
        }
        
        if (callback) _this.delayedCall(callback, _delay+_time);
    }
    
    this.animateOut = function(callback) {
        if (!$this || !$text) return false;
        if (!_fallback) {
            $text.tween({ scale: _scaleOut, opacity: 0 }, _time, 'easeInCubic');    
        } else {
            $text.tween({ opacity: 0 }, _time*0.6, 'easeInSine', _time*0.3);
        }
        
        if (callback) _this.delayedCall(callback, _delay+_time);
    }
});
