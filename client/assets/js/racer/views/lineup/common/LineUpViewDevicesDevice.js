Class(function LineUpViewDevicesDevice(_data) {
    Inherit(this, View);
    var _this = this;
    var $this, $device, $tick, $name;
    var _name;
        
    _this.width = Number(_data.agent.imgwidth)*2;
    _this.height = Number(_data.agent.imgheight)*2;
    
    //*** Constructor
    (function() {
        initHTML();
        initDevice();
        initName();
        //initTick();
        _this.delayedCall(checkMe, 100);
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(_this.width, _this.height);
    }
    
    function initDevice() {
        $device = $('.device');
        $device.size(_this.width, _this.height).css({ webkitBackfaceVisibility: 'hidden' });
        $device.bg(Config.PATH+'assets/images/common/devices/'+_data.agent.perma+'.png');
        $this.addChild($device);
    }
    
    function initName() {
        $name = $('.name');
        $name.fontStyle('AvantGarde-BoldObl', 44, '#fff');
        $name.css({ width: '100%', top: 90, textAlign: 'center', letterSpacing: '5px' });
        $name.text(_data.name);
        $this.addChild($name);
    }
    
    function initTick() {
        $tick = $('.tick');
        $tick.size(100,100).css({ top: '50%', marginLeft: -50, left: '50%', marginTop: -50 });
        $tick.bg(Config.PATH+'assets/images/lineup/tick.png');
        $tick.invisible();
        $this.addChild($tick);
    }
    
    function checkMe() {
        if (!_this.me) {
            $this.css({ opacity: 0.5 });
            $device.css({ opacity: 0.5 });
        }
    }

    //*** Public Methods
    this.showTick = function() {
        
    }
    
    this.animateIn = function(x, delay) {
        if (!_this.me) {
            $this.css({ opacity: 0.5 });
            $device.css({ opacity: 0.5 });
        }
    }
    
    this.animateOut = function() {
        $this.tween({ y: 10, opacity: 0 }, 200, 'easeInCubic', $this.hide);
    }
});
