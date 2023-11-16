Class(function LineUp(_data) {
    Inherit(this, Controller);
    var _this = this;
    var $container, $wrapper, $overlay;
    var _view;
    
    Global.LINEUP = false;
    
    //*** Constructor
    (function() {
        initContainer();
        initView();
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%').css({ opacity: 0, background: Global.GRADIENT, overflow: 'hidden' }).setZ(6);
                
        $wrapper = $('.wrapper');
        $wrapper.size('100%').css({ overflow: 'hidden' }).setZ(1).mouseEnabled(false);
        $container.addChild($wrapper);
    }
    
    function initView() {
        _view = _this.initClass(Global.TABLE_MOBILE ? LineUpTableView : LineUpMobileView, {
            index: Global.PLAYER_INDEX,
            total: Global.TOTAL_PLAYERS
        });
        $wrapper.addChild(_view);
    }

    //*** Event handlers
    function addListeners() {
        if (Global.TABLE_MOBILE) {
            _this.events.subscribe(RacerEvents.TABLE_GAME_STARTING, startMatch);
        } else {
            $container.interact(null, ready);
        }
    }
    
    function ready() {
        if (!_this.ready) {
            GATracker.trackEvent("clickable_link", "line_up_event", "Tap When Ready");
            _this.ready = true;
            SCSound.send("tap_ready");
            if (_view) _view.ready();
            _this.events.subscribe(RacerEvents.START_MATCH, startMatch);
            _this.delayedCall(sendSocket, Global.SINGLE_PLAYER ? 2500 : 1500);
            
            _this.touched = true;
            _this.delayedCall(function(){
                _this.touched = false;
            }, 500);
        } else {
            if (!_this.touched) {
                if (_view && _this.visible) _view.throttleOn();
                sendSocket();
                _this.touched = true;
            }
        }
    }
    
    function sendSocket() {
        if (!_this.socketSent) Data.SOCKET.playerReady();
        _this.socketSent = true;
    }
    
    function startMatch(e) {
        var delay = e && e.delay ? e.delay : 1;
        _this.delayedCall(function(){
            _this.events.fire(HydraEvents.COMPLETE);    
        }, delay+1000);         
    }
    
    //*** Public Methods
    this.animateIn = function() {
        Global.LINEUP = true;
        if (!_this.visible) {
            GATracker.trackPage("line_up");
            SCSound.send("lineup_in");
            $container.tween({ opacity: 1 }, 300, 'easeOutSine', 100);
            if (RacerDevice.animate) $wrapper.css({ opacity: 0 }).transform({ scale: 1.1 }).tween({ opacity: 1, scale: 1 }, 400, 'easeOutCubic', 300, hide);
            else $wrapper.css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', 300, hide);
            
            function hide() {
                $wrapper.clearAlpha();
                $container.clearAlpha();
                if (_view) _view.animateIn();
                addListeners();
            }
        }
        _this.visible = true;
    }
    
    this.animateOut = function(callback) {
        Global.LINEUP = false;
        if (_this.visible) {
            if (!_this.ready && _view) _view.ready();
            SCSound.send("lineup_out", 300 + Global.ANIMATION_DELAY);
            SCSound.send("fade_out");
            if (_view) _view.animateOut(function(){
                if (!Global.TABLE) {
                    $wrapper.transform({ y: 0 }).tween({ y: window.innerHeight*0.7 }, 700, 'easeInOutCubic');
                    $container.transform({ y: 0 }).tween({ y: -window.innerHeight-10 }, 700, 'easeInOutCubic', callback);
                }
            });    
        }
        _this.visible = false;
    }
    
    this.destroy = function() {
        Global.LINEUP = false;
        return this._destroy();
    }
});
