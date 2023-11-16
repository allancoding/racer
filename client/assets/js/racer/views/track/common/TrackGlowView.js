Class(function TrackGlowView() {
    Inherit(this, View);
    var _this = this;
    var $this, $top, $touch;
    var _val = 0;
    var _step = RacerDevice.android ? 0.03 : 0.015;
    var _perc = 0.16;
    var _top = 10+(window.innerHeight/20);
    var _timeout;
    var _size = 150+window.innerWidth/3;
    var _color;
    
    switch (Global.COLOR_INDEX) {
        case 0: _color = 'blue'; break;
        case 1: _color = 'green'; break;
        case 2: _color = 'yellow'; break;
        case 3: _color = 'orange'; break;
        case 4: _color = 'red'; break;  
    }
    
    //*** Constructor
    (function() {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').css({ top: 0, left: 0, opacity: 1 }).mouseEnabled(false);

        $touch = $('.touch');
        $touch.size(_size,_size).css({ marginLeft: -_size/2, marginTop: -_size/2 }).mouseEnabled(false);
        $touch.bg(Config.PATH+'assets/images/track/touchglow/'+_color+'.png');
        $touch.invisible();
        $this.addChild($touch);
    }

    //*** Public Methods
    this.animateIn = function(x, y){
        $touch.visible().css({ top: y, left: x });
        _this.on = true;
    }
    
    this.animateOut = function(){
        if (!$touch.invisible) return false;
        $touch.invisible();
        _this.on = false;
    }
});
