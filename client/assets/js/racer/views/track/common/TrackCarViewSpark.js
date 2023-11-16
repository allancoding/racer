Class(function TrackCarViewSpark(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $sprite;
    var _sprite;
    
    //*** Constructor
    (function() {
        initHTML();
        animateIn();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ width: 50, height: 50, left: _config.x, top: _config.y });
        $this.transform({ rotation: _config.rotation-Utils.doRandom(60,120), scale: _config.scale+(Utils.doRandom(-10,20)/100) });
        
        $sprite = $('.sprite');
        $sprite.css({ width: 50, height: 50 }).bg(Config.PATH+'assets/sprites/sparks/'+Utils.doRandom(1,5)+'.png', 0, 0, 'no-repeat');
        $this.addChild($sprite);
        
        _sprite = new Sprite({
            width: 50,
            height: 50,
            rows: 1,
            cols: 5,
            frames: 5,
            fps: 10,
            obj: $sprite,
            loop: false
        });
    }
    
    function animateIn() {
        _sprite.play();
        setTimeout(function(){
            _sprite.stop();
            _sprite = null;
            $sprite.remove();
            $this.remove();
        }, 500);
    }
});
