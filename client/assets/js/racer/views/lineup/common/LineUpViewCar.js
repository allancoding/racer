Class(function LineUpViewCar() {
    Inherit(this, View);
    var _this = this;
    var $this, $bg, $line, $car;
    var _you;
    
    _this.touched = true;
    
    //*** Constructor
    (function() {
        initHTML();
        initCar();
        _this.delayedCall(animateIn, 500);
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ height: 60, width: '100%', top: '50%', marginTop: -30, overflow: 'hidden' });
        $this.invisible();
        
        $bg = $('.bg');
        $bg.size('100%').bg(Config.BG).css({ opacity: 0.75 });
        $this.addChild($bg);
        
        $line = $('.line');
        $line.css({ height: 4, width: '100%', top: '50%', marginTop: -2 }).bg(Config.COLORS[Global.COLOR_INDEX]);
        $this.addChild($line);
    }
    
    function initCar() {
        var color = 'blue';
        switch (Config.COLORS[Global.COLOR_INDEX]) {
            case '#ec1f27': color = 'red'; break;
            case '#dac620': color = 'yellow'; break;
            case '#3bb54a': color = 'green'; break;
            case '#f79221': color = 'orange'; break;
        }

        $car = $('.car');
        $car.size(60,40).css({ top: '50%', marginTop: -20, marginLeft: -30 });
        $car.bg(Config.PATH+'assets/images/track/cars/'+color+'.png');
        $this.addChild($car);

        if (_you) $car.css({ marginLeft: -60 });
    }
    
    function animateIn() {
        $this.visible();
        $this.transform({ y: 30 }).tween({ y: 0 }, 300, 'easeOutCubic');
        $bg.transform({ y: -60 }).tween({ y: 0 }, 300, 'easeOutCubic');
        $line.transform({ x: -window.innerWidth }).tween({ x: 0 }, window.innerWidth/3+300, 'easeInOutCubic', 300);
        $car.transform({ x: -60 }).tween({ x: window.innerWidth/2 }, window.innerWidth/3+300, 'easeOutCubic', 600, function(){
            _this.touched = false;
        });
    }

    //*** Event handlers


    //*** Public Methods
    this.throttleOn = function() {
        if (!_this.touched) {
            GATracker.trackEvent("clickable_link", "line_up_event", "Press To Accelerate");
            $car.tween({x: window.innerWidth+60},  window.innerWidth/3+300, 'easeInCubic');
        }
        _this.touched = true;
    }
    
    this.throttleOff = function() {
    }
    
    this.animateOut = function(hideLine) {
        if (!_this.touched) $car.tween({ x: window.innerWidth+60 }, window.innerWidth/3+300, 'easeInCubic');
        if (hideLine) $this.tween({ opacity: 0 }, 300, 'easeOutSine');
        _this.touched = true;
    }
});
