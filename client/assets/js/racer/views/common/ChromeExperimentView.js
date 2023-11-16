Class(function ChromeExperimentView(_config) {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _phone = RacerDevice.width < 500;
    var _width = _phone ? 85 : 117;
    var _height = _phone ? 44 : 62;
    var _left = _phone ? 12 : 20;
    var _bottom = _phone ? 10 : 15;
    if (RacerDevice.chrome_iphone && window.innerHeight < 545) _bottom += 45;

    _config = _config || {};
    
    //*** Constructor
    (function() {
        initHTML();
        if (!Global.GAME_PLAYING || _config.noClick) addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(_width,_height).css({ pointerEvents: 'auto', left: _left, bottom: _bottom, opacity: 0.7 }).setZ(1);
        $this.bg(Config.PATH+'assets/images/common/logos/chrome-experiment.png');
        if (!_config.show) $this.invisible();
        if (_config.noClick) $this.mouseEnabled(false);
        
        if (Global.PRESENTATION) $this.hide();
    }

    //*** Event handlers
    function addListeners() {
        $this.interact(hover, click);
    }
    
    function hover(e) {
        switch (e.action) {
            case 'over':
                $this.tween({ opacity: 1 }, 150, 'easeOutSine');
            break;
            case 'out':
                $this.tween({ opacity: 0.8 }, 250, 'easeOutSine');
            break;
        }
    }
    
    function click(e) {
        if (RacerDevice.mobile) GATracker.trackEvent("clickable_link", "landing", "Chrome Experiment");
        else GATracker.trackEvent("clickable_link", "desktop_footer", "Chrome Experiment");
        getURL('http://www.chromeexperiments.com/', '_blank');
        _this.delayedCall(function(){
            e.action = 'out';
            hover(e);
        }, 100);
    }

    //*** Public Methods
    
    this.animateIn = function() {
        $this.visible();
        $this.css({ opacity: 0 }).transform({ y: RacerDevice.mobile ? 8 : -10 }).tween({ opacity: 0.8, y: 0 }, 400, 'easeOutCubic', function(){
            $this.clearTransform();
        });
    }
    
    this.animateOut = function() {
        $this.tween({ opacity: 0, y: RacerDevice.mobile ? 8 : -10 }, 400, 'easeInCubic', $this.invisible);
    }
});
