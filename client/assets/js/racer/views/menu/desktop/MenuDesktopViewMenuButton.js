Class(function MenuDesktopViewMenuButton(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper, $bg, $text, $active;

    //*** Constructor
    (function() {
        initHTML();
        initText();
        addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ height: 30, webkitBackfaceVisibility: 'hidden' , width: '100%' });
        $this.invisible();
        
        if (_config.solid) {
            $bg = $('.bg');
            $bg.size('100%').css({ borderRadius: 1, opacity: 0.6 }).bg('#eee');
            $this.addChild($bg);   
        }
        
        $wrapper = $('.wrapper');
        $wrapper.size('100%').css({ opacity: _config.solid ? 1 : 0.5 });
        $this.addChild($wrapper);
    }
    
    function initText() {
        $text = $('.text');
        $text.fontStyle('AvantGarde', 17, _config.solid ? Config.BG : '#eee');
        $text.css({ letterSpacing: '1px', top: 8, left: 10, whiteSpace: 'nowrap' });
        $text.text(_config.text.replace('-', ' ').toUpperCase());
        $wrapper.addChild($text);
        
        $active = $('.text');
        $active.fontStyle('AvantGarde', 17, _config.solid ? Config.BG : '#eee');
        $active.css({ fontWeight: 'bold', letterSpacing: '0.7px', opacity: 0, top: 8, left: 10, whiteSpace: 'nowrap'  });
        $active.transform({ x: -15 });
        $active.text(_config.text.toUpperCase());
        $wrapper.addChild($active);
    }
    
    function setSize() {
        var width = $text.div.offsetWidth+20;
        $this.css({ width: width });
    }

    //*** Event handlers
    function addListeners() {
        $this.interact(hover, click);
    }
    
    function hover(e) {
        if (!_this.active && _this.visible) {
            switch (e.action) {
                case 'over': SCSound.send("rollover"); hoverIn(); break;
                case 'out': hoverOut(); break;
            }
        }
    }
    
    function hoverIn(activate) {
        $this.hit.css({ width: '120%', left: '-20%' });
        if (!_config.solid) $wrapper.tween({ opacity: activate ? 1 : 0.8, x: activate ? 0 : 6 }, 200, 'easeOutCubic');
        else $bg.tween({ opacity: activate ? 1 : 0.8 }, 200, 'easeOutSine');
    }
    
    function hoverOut() {
        $this.hit.css({ width: '100%', left: 0 });
        if (!_config.solid) $wrapper.tween({ opacity: 0.5, x: 0 }, 300, 'easeOutCubic');
        else $bg.tween({ opacity: 0.6 }, 300, 'easeOutSine');
    }
    
    function click(e) {
        if (!_this.active && _this.visible) {           
            SCSound.send("click");
            _this.events.fire(HydraEvents.CLICK, { type: _config.text, index: _config.index }, false);
            $this.hit.css({ width: '100%', left: 0 });
        }
    }
    
    
    //*** Public Methods
    this.activate = function() {
        hoverIn(true);
        if (!_this.active) {
            $text.tween({ opacity: 0, x: 30 }, 300, 'easeOutCubic');
            $active.tween({ opacity: 1, x: 0 }, 300, 'easeOutCubic', 150);
        }
        
        _this.active = true;
    }
    
    this.deactivate = function() {
        hoverOut();
        if (_this.active) {
            $text.tween({ opacity: 1, x: 0 }, 300, 'easeOutCubic', 150);
            $active.tween({ opacity: 0, x: -15 }, 300, 'easeOutCubic');
        }
        _this.active = false;
    }
    
    this.animateIn = function() {
        _this.visible = true;
        $this.visible();
        setSize();
        $this.transform({ x: -15 }).css({ opacity: 0 }).tween({ opacity: 1, x: 0 }, 300, 'easeOutCubic', function(){
            $this.clearAlpha();
            $this.clearTransform();
        });
    }
});
