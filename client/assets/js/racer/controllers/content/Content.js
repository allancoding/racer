Class(function Content() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _video, _content;
    
    //*** Constructor
    (function() {
        initContainer();
        if (!Device.fallback_browser) initGradients();
        initViews();
        addListeners();
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%').setZ(1);
        $container.hide();
        __body.addChild($container);
        
        Global.CONTAINER.hide();
    }
    
    function initGradients() {
        var $top = $('.top');
        $top.css({ top: 0, left: -11, width: '100%', height: 100 }).bg(Config.PATH+'assets/images/about/gradient-top.png').setZ(5);
        $top.mouseEnabled(false);
        $container.addChild($top);
        
        var $bottom = $('.top');
        $bottom.css({ bottom: 0, left: -11, width: '100%', height: 100, opacity: 0.8 }).bg(Config.PATH+'assets/images/about/gradient-bottom.png').setZ(5);
        $bottom.mouseEnabled(false);
        $container.addChild($bottom);
    }
    
    function initViews() {
        _content = _this.initClass(ContentView);
    }

    //*** Event handlers
    function addListeners() {
        _content.events.add(RacerEvents.ABOUT_SCROLLED_DOWN, moveVideo);
    }
    
    function moveVideo(e) {
        if (_video) {
            if (e.top) _video.animateOut();
            else _video.animateIn();    
        }
    }

    //*** Public Methods
    this.show = function() {
        $container.visible().show();
        _this.visible = true;
        Global.CONTAINER.transform({ y: -RacerDevice.height });
        $container.css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 1000, function(){
            _this.animating = false;
            $container.clearAlpha();
        });
    }
    
    this.scroll = function(index) {
        _content.scroll(index);
    }
    
    this.animateIn = function(scroll) {
        if (!_this.visible && !RacerDevice.fallback_browser) {
            Global.CONTAINER.css({ pointerEvents: 'none' });
            $container.visible().show();
            if (scroll > -1) _content.forceScroll(scroll);
            _this.animating = true;
            $container.transform({ y: RacerDevice.height }).tween({ y: 0 }, RacerDevice.height/3+300, 'easeInOutCubic', 200, function(){
                if (_video) _video.play();
                _this.animating = false;
                $container.clearAlpha();
                $container.clearTransform();
            });
            Global.CONTAINER.tween({ y: -RacerDevice.height }, RacerDevice.height/3+300, 'easeInOutCubic', 200, function(){
                Global.CONTAINER.hide();
                Global.CONTAINER.clearTransform();
                Global.CONTAINER.clearAlpha();
                Container.instance().refreshDesktop();
            });
        }
        _this.visible = true;
    }
    
    this.animateOut = function() {
        if (_this.visible && !RacerDevice.fallback_browser) {
            if (_video) _video.pause();
            _this.animating = true;
            _this.events.fire(RacerEvents.RESIZE);
            $container.tween({ y: RacerDevice.height }, RacerDevice.height/3+300, 'easeInOutCubic', function(){
                _this.animating = false;
                Global.CONTAINER.css({ pointerEvents: 'auto' });
                $container.clearAlpha();
                $container.clearTransform();
                $container.hide();
            });
            Global.CONTAINER.show().transform({ y: -RacerDevice.height }).tween({ y: 0 }, RacerDevice.height/3+300, 'easeInOutCubic', function(){
                GATracker.trackPage("live");
                _content.detach();
                _this.delayedCall(_content.attach, 500);
                _this.events.fire(RacerEvents.INPUT_FOCUS);
                Global.CONTAINER.clearTransform();
                Global.CONTAINER.clearAlpha();
            });
        }
        _this.visible = false;
    }
}, 'Singleton');
