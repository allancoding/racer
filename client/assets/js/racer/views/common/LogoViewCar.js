Class(function LogoViewCar(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $car;
    
    var _color = '';
    _config.scale = _config.scale || 0.6;
    
    switch (Config.COLORS[_config.index]) {
        case '#14a8df': _color = 'blue'; break;
        case '#ec1f27': _color = 'red'; break;
        case '#dac620': _color = 'yellow'; break;
        case '#3bb54a': _color = 'green'; break;
        case '#f79221': _color = 'orange'; break;
    }

    //*** Constructor
    (function() {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(60*_config.scale,40*_config.scale).css({ top: _config.index*16, marginTop: -16*_config.scale });
        $this.invisible();
        
        $car = $('.car');
        $car.size(50*_config.scale,40*_config.scale).css({ left: 0, top: 0 });
        $car.bg(Config.PATH+'assets/images/track/cars/'+_color+'.png');
        $car.transform({ skewY: 15, rotation: -15 });
        $this.addChild($car);
    }
    
    //*** Public Methods
    this.animateIn = function() {
        $this.visible().transform({ x: -30 }).tween({ x: window.innerHeight }, window.innerWidth/2+200, 'linear', $this.invisible);
    }
    

});
