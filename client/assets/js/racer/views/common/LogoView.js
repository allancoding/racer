    Class(function LogoView(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $logo, $lines;
    var _lines, _cars;
    var _outerWidth;
    _config = _config || {};
    var _full = RacerDevice.mobile || false;
    if (_config.small) _full = false;
    var _width = _full ? RacerDevice.width : 420;
    var _height = _full ? 200 : 120;
    var _scale;
    
    //*** Constructor
    (function() {
        initHTML();
        initLines();
        if (_full) initCars();
        initLogo();
        addListeners();
        if (_full) resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ width: _full ? '100%' : 450, height: _height, webkitBackfaceVisibility: 'hidden' }).setZ(4);
        $this.invisible();
    }
    
    function initLines() {
        $lines = $('.lines');
        $lines.css({ width: '100%', height: 100, webkitBackfaceVisibility: 'hidden', top: _full ? 47 : 80 }).setZ(1);
        $lines.transform({ skewY: -15 }).mouseEnabled(false);
        $this.addChild($lines);

        _lines = new Array();
        for (var i in Config.COLORS) {
            var line = _this.initClass(LogoViewLine, { index: i, full: _full, small: _config.small });
            $lines.addChild(line);
            _lines.push(line);
        }
    }
    
    function initCars() {
        _cars = new Array();
        for (var i in Config.COLORS) {
            var car = _this.initClass(LogoViewCar, { index: i });
            $lines.addChild(car);
            _cars.push(car);
        }
    }
    
    function initLogo() {
        $logo = $('.logo');
        $logo.css({ webkitBackfaceVisibility: 'hidden' });
        if (_full) $logo.size(250, 167).css({ top: -50, left: '50%', marginLeft: -130 }).setZ(10);
        else if (_config.small) $logo.size(175, 118).css({ top: -37, left: 32 }).setZ(10);
        else $logo.size(175, 118).css({ top: -37, left: 26 }).setZ(10);
        $logo.transform({ skewY: 15 });
        if (_full) $logo.bg(Config.PATH+'assets/images/common/logos/racer.png');
        else $logo.bg(Config.PATH+'assets/images/common/logos/racer-small.png');
        $lines.addChild($logo);
    }

    //*** Event handlers
    function addListeners() {
        if (_full) _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
        else $this.interact(null, click);
    }
    
    function resizeHandler(width) {
        _width = _full ? RacerDevice.width : 420;
        $this.css({ width: '100%', top: RacerDevice.height/2-90-30*(RacerDevice.height/500) });
        $lines.width = !_full ? _width : _this.up ? '300%' : '100%';
        $lines.css({ left: _this.up ? '-100%' : 0, width: $lines.width });
        if (_outerWidth && _outerWidth > 260) $this.transformPoint(window.innerWidth/2-_outerWidth/11, window.innerHeight/6);
        if (_this.isUp) $this.transform({ y: _this.y, scale: _scale, x: _this.x });
    }
    
    function click() {
        if (_config.small) {
            Data.SOCKET.exitLobby();
            _this.events.fire(RacerEvents.REFRESH);    
        } else {
            _this.events.fire(HydraEvents.CLICK);   
        }
    }

    //*** Public Methods
    
    this.moveUp = function(width) {
        for (var i = 0; i < _cars.length; i++) {
            _cars[i] = _cars[i].destroy();
        }
        
        _scale = RacerDevice.height < 600 ? 0.55 : 1;
        if (_scale > 1) _scale = 1;
        if (_full && _scale < 1) _this.up = true;
        _outerWidth = width;
        resizeHandler();
        _this.y = _scale < 1 ? -30*(RacerDevice.height/400)-70 : -140;
        _this.x = _scale < 1 ? -59 : 0;
        
        $this.transform({ y: 0, scale: 1, x: 0 }).tween({ y: _this.y, scale: _scale, x: _this.x }, 600, 'easeInOutCubic', function(){
            _this.isUp = true;
        });
    }
    
    this.animateIn = function(){
        $this.visible();
        if (!_config.small) {
            SCSound.send("logo_in");
            $logo.transform({ x: -window.innerWidth, y: 0, skewY: 15 }).tween({ x: 0, y: 0, skewY: 15 }, window.innerWidth*0.3+300, 'easeOutCubic', window.innerWidth*0.5+600);
            for (var i = 0; i < _lines.length; i++) {
                _this.delayedCall(_lines[i].animateIn, i*75, _full ? window.innerWidth : window.innerWidth*1.4+3);
            }
            
            if (_cars) {
                var delay = window.innerWidth/2+250;
                var offset = 75;
                _this.delayedCall(_cars[0].animateIn, delay+offset*2);
                _this.delayedCall(_cars[1].animateIn, delay);
                _this.delayedCall(_cars[2].animateIn, delay+offset*3.5);
                _this.delayedCall(_cars[3].animateIn, delay+offset*0.7);
                _this.delayedCall(_cars[4].animateIn, delay+offset*1.3);    
            }
        } else {
            var scale = window.innerHeight/1000+0.1;
            if (scale > 1) scale = 1;
            var top = -52 + scale*50;
            if (scale < 1) $this.css({ top: top, left: -17 });
            $this.transformPoint(40,40).transform({ y: -120, scale: scale }).tween({ y: 0 }, 500, 'easeOutCirc', 200);
        }
    }
    
    this.animateOut = function(callback) {
        SCSound.send("logo_out");
        var left = _this.up ? window.innerWidth*2.75 : window.innerWidth;
        $logo.tween({ x: left/4, opacity: 0 }, 300, 'easeInSine');
        for (var i = 0; i < _lines.length; i++) {
            _this.delayedCall(_lines[i].animateOut, i*50, left);
        }
        _this.delayedCall(function(){
            if (callback) callback();
        }, 800);
    }
});
