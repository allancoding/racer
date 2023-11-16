Class(function TrackInitializingView() {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper;
    var _animation;
    
    //*** Constructor
    (function() {
        initHTML();
        initAnimation();
        addListeners();
        resizeHandler();
        animateIn();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').setZ(1000).bg(Config.BG).css({ top: 0, left: 0 });
        $this.invisible();
        
        $wrapper = $('.wrapper');
        $wrapper.size('100%');
        $this.addChild($wrapper);
    }
    
    function initAnimation() {
        _animation = _this.initClass(TrackInitializingViewAnimation);
        $wrapper.addChild(_animation);
    }
    
    function animateIn() {
        //RacerUtil.checkDelay();
        $this.visible();
        $this.css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', $this.clearAlpha);
        $wrapper.css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 300, $wrapper.clearAlpha);
        if (_animation) _this.delayedCall(_animation.animateIn, 300);
        _this.delayedCall(function(){
            _this.events.fire(HydraEvents.COMPLETE);
        }, 1000);
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
    }
    
    function resizeHandler() {
        if (RacerDevice.width < 800) $wrapper.transform({ scale: RacerDevice.width/800 });
    }

    //*** Public Methods
    this.animateOut = function() {
        $wrapper.tween({ opacity: 0 }, 200, 'easeOutSine', function(){
            $wrapper.hide();
        });
    }
});
