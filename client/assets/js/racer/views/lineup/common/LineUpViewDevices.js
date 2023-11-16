Class(function LineUpViewDevices(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $devices, $you;
    var _devices, _you, _youAnchor;
    var _width, _height, _distance;
    
    //*** Constructor
    (function() {
        initHTML();
        initDevices();
        initYou();
    })();

    function initHTML() {
        $this = _this.element;
    }
    
    function initDevices() {               
        $devices = $('.device');
        $devices.size('100%').transformPoint('50%', '90%');
        $this.addChild($devices);
        
        _devices = new Array();
        _width = 0;
        _height = 0;
        
        var players = Data.LOBBY.getPlayers();
        for (var i = 0; i < players.length; i++) {
            var device = _this.initClass(LineUpViewDevicesDevice, players[i]);
            $devices.addChild(device);
            _devices.push(device);
        }
        
        _this.delayedCall(function(){
            // Checks width and tallest device
            for (var i = 0; i < _devices.length; i++) {
                _devices[i].css({ left: _width });
                _width += _devices[i].width + 10;
                if (_devices[i].height > _height) _height = _devices[i].height;
                if (i == _config.index) {
                    _devices[i].me = true;
                    _youAnchor = _width-_devices[i].width/2-9;
                } else {
                    _devices[i].me = false;
                }
            }
            
            // Centers devices vertically
            for (var i = 0; i < _devices.length; i++) {
                _devices[i].css({ top: _height/2-_devices[i].height/2 });
            }
            
            _distance = _height-_devices[_config.index].height;
            _width -= 10;
            _height += 15;
            resizeHandler();
        }, 50);
    }
    
    function initYou() {
        _you = _this.initClass(LineUpViewDevicesYou);
    }

    //*** Event handlers    
    function resizeHandler() {
        var maxH = RacerDevice.height*0.38;
        var checkWidth = RacerDevice.width-20;
        var scale = checkWidth/_width;
        var scaleH = _height > maxH ? maxH/_height : 1;
        if (scaleH < scale) scale = scaleH;
            
        if (_width > checkWidth || _height > maxH) {
            $devices.transform({ scale: scale });
            _you.css({ left: _youAnchor*scale+(_width/2-(_width/2)*scale), top: _height-((_height/2-(_height/2)*scale)) });
            _you.element.transform({ scale: 0.66+scale/3 });
            _you.setDistance(_distance*scale);  
        } else {
            $devices.clearTransform();
            _you.css({ left: _youAnchor, top: _height });
            _you.element.clearTransform();
            _you.setDistance(_distance);
        }
        
        $this.css({ width: _width, height: _height, top: '50%', marginTop: -_height/2-(RacerDevice.height < 500 ? 10 : 0), left: '50%', marginLeft: -_width/2 });
    }

    //*** Public Methods
    this.resize = function() {
        resizeHandler();
    }
    
    this.animateIn = function() {
        var change = -1;
        for (var i = 0; i < _devices.length; i++) {
            if (_devices[i].me) change = 1;
            var x = _devices[i].me ? 0 : 50*change;
            _devices[i].animateIn(x, _devices[i].isIndex ? 700 : 500);
        }
    }
    
    this.animateOut = function() {
        $this.tween({ opacity: 0 }, 300, 'easeOutSine', $this.hide);
    }
});
