Class(function DeviceModel(_data) {
    Inherit(this, Model);
    var _this = this;
    var _devices;
    
    //*** Constructor
    (function() {
        setDevices();
        findDevice();
    })();

    function setDevices() {
        _devices = new Array();
        for (var i = 0; i < _data.length; i++) {
            _devices[_data[i].perma] = _data[i];
        }
    }
    
    function findDevice() {
        var agent = Device.agent.toLowerCase();
        _this.device = _devices['samsung-galaxy-tab-2'];
        _this.device.title = RacerDevice.mobile ? 'DEFAULT' : 'DESKTOP';
        
        for (var i = 0; i < _data.length; i++) {
            var string = _data[i].perma.replace("-"," ")
            if (agent.strpos(string)) _this.device = _data[i];
        }
        
        if (agent.strpos('gt-i9100')) {
            _this.device = _devices['samsung-galaxy-s2'];
        }
        
        if (agent.strpos('ipad')) {
            _this.device = _devices['ipad'];
        }
        
        if (agent.strpos('iphone')) {
            if (RacerDevice.height < 400 && RacerDevice.width < 400) {
                _this.device = _devices['iphone-4'];    
            } else {
                _this.device = _devices['iphone-5'];    
            }
        }
        
        Global.DEVICE_NAME = _this.device.title;
    }
    
    //*** Event handlers

    //*** Public Methods
    this.getDevice = function() {
        return _this.device;
    }
});
