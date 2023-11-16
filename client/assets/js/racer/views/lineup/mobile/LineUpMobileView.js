Class(function LineUpMobileView(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $line, $wrapper, $accelerate, $brake;
    var _car, _titleTop, _titleBottom, _devices, _tip, _ready;
    var _intervalTop, _intervalBottom, _scale, _fontSize;
    
    //*** Constructor
    (function() {
        initHTML();
        initViews();
        initText();
        addListeners();
        setTimeout(resizeHandler, 100);
    })();
    
    function initHTML() {
        $this = _this.element;
        $this.size('100%');
        $this.mouseEnabled(false);
        
        $line = $('.dotted-line');
        $line.size(13,4).css({ width: '105%', left: -13, top: '50%', marginTop: -8 });
        $line.bg(Config.PATH+'assets/images/lineup/dotted-line.png', 0, 0);
        $this.addChild($line);
        
        $wrapper = $('.wrapper');
        $wrapper.size('100%');
        $this.addChild($wrapper);
    }
    
    function initViews() {
        _titleTop = _this.initClass(LineUpViewTitle, { index: _config.index, text: Global.SINGLE_PLAYER ? 'GET READY/TO GO' : 'LINE UP/YOUR SCREENS' });
        $wrapper.addChild(_titleTop);
        
        _devices = _this.initClass(LineUpViewDevices, _config);
        $wrapper.addChild(_devices);
        
        _titleBottom = _this.initClass(LineUpViewTitle, { index: _config.index, text: "TAP WHEN/YOU'RE READY" });
        $wrapper.addChild(_titleBottom);
    }
    
    function initText() {
        $accelerate = $('.acclerate');
        $accelerate.fontStyle('AvantGarde-BoldObl', 20, '#fff');
        $accelerate.css({ width: '100%', textAlign: 'center', top: '50%', opacity: 0, whiteSpace: 'nowrap' });
        $accelerate.text('PRESS<br/>YOUR SCREEN TO<br/>ACCELERATE');
        $accelerate.invisible();
        $this.addChild($accelerate);
        
        $brake = $('.brake');
        $brake.fontStyle('AvantGarde-BoldObl', 20, '#fff');
        $brake.css({ width: '100%', textAlign: 'center', top: '50%', opacity: 0, whiteSpace: 'nowrap' });
        $brake.text('RELEASE TO<br/>BRAKE');
        $brake.invisible();
        $this.addChild($brake);
    }
    
    function initReady() {
        clearInterval(_intervalTop);
        clearInterval(_intervalBottom);
        _devices = _devices.destroy();
        _titleTop = _titleTop.destroy();
        _titleBottom = _titleBottom.destroy();
        $wrapper.hide();

        _car = _this.initClass(LineUpViewCar);
        
        resizeHandler();
        
        if (RacerDevice.animate) {
            $line.tween({ opacity: 0 }, 200, 'easeOutSine', $line.remove);
            $brake.visible().transform({ x: _fontSize*2 }).tween({ opacity: 1, x: 0 }, 500, 'easeOutCubic', 400, $brake.clearAlpha);
            $accelerate.visible().transform({ x: -_fontSize*2 }).tween({ opacity: 1, x: 0 }, 500, 'easeOutCubic', 300, $accelerate.clearAlpha);    
        } else {
            $line.tween({ opacity: 0 }, 200, 'easeOutSine', $line.remove);
            $brake.visible().tween({ opacity: 1 }, 300, 'easeOutSine', 200, $brake.clearAlpha);
            $accelerate.visible().tween({ opacity: 1 }, 300, 'easeOutSine', 200, $accelerate.clearAlpha);  
        }
        
    }
    
    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
        _this.events.subscribe(RacerEvents.GAME_DISCONNECT, disconnect);
    }
    
    function resizeHandler() {
        if (!_this.isReady) {
            if (_this.visible) {
                _titleTop.resize();
                _titleBottom.resize();
            }
            
            if (RacerDevice.height < 400) {
                _titleTop.css({ top: 30 });
                _titleBottom.css({ bottom: -10 });
            } else if (RacerDevice.height < 600) {
                _titleTop.css({ top: 30 });
                _titleBottom.css({ bottom: 20 });
            } else {
                _titleTop.css({ top: '8%', marginTop: -20 });
                _titleBottom.css({ bottom: '5%', marginTop: 35 });
            }
            
            _devices.resize();
            if (_tip) _tip.resize();    
        } else {
            _fontSize = RacerDevice.width/11;
            $accelerate.css({ lineHeight: _fontSize*1.15, fontSize: _fontSize, marginTop: -_fontSize*3.7-40, left: -_fontSize*0.1 });
            $brake.css({ lineHeight: _fontSize*1.15, fontSize: _fontSize, marginTop: _fontSize*0.5+40, left: -_fontSize*0.1 });
        }
    }

    
    function disconnect() {
        clearInterval(_intervalTop);
        clearInterval(_intervalBottom);
        if (_tip) _tip.stop();
    }
        
    //*** Public Methods
    this.throttleOn = function() {
        if (_car) _car.throttleOn();
    }
    
    this.throttleOff = function() {
        if (_car) _car.throttleOff();
    }
    
    this.ready = function() {
        _this.isReady = true;
        if (_this.visible) {
            if (_tip) _tip.stop();
            if (RacerDevice.animate) $wrapper.tween({ opacity: 0 }, 300, 'easeOutSine', initReady);
            else initReady();
        }
    }
    
    this.resize = resizeHandler;
    
    this.animateIn = function() {
        _this.visible = true;
        if (_tip) _tip.animateIn();
        if (RacerDevice.animate) {
            if (_titleTop) _intervalTop = setInterval(_titleTop.shine, 4000);
            if (_titleBottom) _this.delayedCall(function(){ if (_titleBottom) _intervalBottom = setInterval(_titleBottom.shine, 4000); }, 700);
        }
    }
    
    this.animateOut = function(callback) {
        _this.visible = false;
        if (_tip) _tip.stop();
        if (_intervalTop) clearInterval(_intervalTop);
        if (_intervalBottom) clearInterval(_intervalBottom);
        if (_car) _car.animateOut();
        if (callback) _this.delayedCall(callback, 700);
    }
});
