Class(function LineUpViewDevicesYou() {
    Inherit(this, View);
    var _this = this;
    var $this, $icon, $text;
    var _anim;
    
    _this.canAnimate = true;
    _this.scale = window.innerHeight < 500 ? window.innerHeight/500 : 1;
    
    //*** Constructor
    (function() {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(60,40).css({ marginLeft: -30, marginTop: 5, overflow: 'visible', webkitBackfaceVisibility: 'visible' });
        $this.transformPoint(30,0);
                
        $icon = $('.arrow-icon');
        $icon.size(8,6).css({ top: 9, left: 27 }).bg(Config.PATH+'assets/images/lineup/you-triangle.png');
        $this.addChild($icon);
        
        $text = $('.text');
        $text.css({ width: '100%', top: 20, left: -2, textAlign: 'center' });
        $text.fontStyle('AvantGarde-BoldObl', 24, '#fff');
        $text.text('YOU');
        $this.addChild($text);
    }
    
    //*** Event handlers
    //*** Public Methods
    this.setDistance = function(dist) {
        var dist = Math.floor(dist/5)*5;
        if (dist < 10) dist = 10;
        if (dist > 30) dist = 30;
        $icon.div.style.webkitAnimationName = 'arrowIcon'+dist;
    }
    
    this.animateIn = function() {
        if (_this.canAnimate) {
            _this.visible = true;
        }
    }
    
    this.animateOut = function() {
        _this.canAnimate = false;
        $this.tween({ opacity: 0 }, 300, 'easeOutSine', function() {
            $this.hide();
        });
    }
});
