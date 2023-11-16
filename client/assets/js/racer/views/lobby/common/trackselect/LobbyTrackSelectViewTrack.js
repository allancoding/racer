Class(function LobbyTrackSelectViewTrack(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $overlay, $bg, $border, $text;
    var _width = 200, _height = 40;    
    
    //*** Constructor
    (function() {
        initHTML();
        initBorder();
        initText();
        addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.hide();
        
        $overlay = $('.overlay');
        $overlay.size('100%').bg(Config.BG).setZ(10);
        $this.addChild($overlay);
        
        $bg = $('.bg');
        $bg.size('100%').css({ borderRadius: 3, background: '-webkit-linear-gradient(top, #333333 0%, #262626 100%)' }).setZ(1);
        $this.addChild($bg);
    }
    
    function initBorder() {
        $border = $('.border');
        $border.css({ top: 0, left: 0, borderRadius: 3 }).setZ(5);
        $this.addChild($border);
    }
    
    function initText() {
        $text = $('.text');
        $text.fontStyle('AvantGarde-BoldObl', 20, '#fff');    
        $text.css({ width: '100%', textAlign: 'center' }).setZ(2);
        $text.text(_config.text);
        $this.addChild($text);
    }

    //*** Event handlers
    function addListeners() {
        $this.interact(hover, click);
    }
    
    function hover(e) {
        if (!_this.selected && _this.visible) {
            switch (e.action) {
                case 'over':
                    $overlay.tween({ opacity: 0 }, 100, 'easeOutSine');
                break;
                case 'out':
                    $overlay.tween({ opacity: 0.3 }, 250, 'easeOutSine');
                break;
            }    
        }
    }
    
    function click() {
        var text = '';
        switch (_config.index) {
            case 0: text = 'SIMPLE'; break;
            case 1: text = 'EXCITING'; break;
            case 2: text = 'CRAZY'; break;
        }
        
        if (!_this.selected && _this.visible) {
            _this.selected = true;
            $overlay.invisible();
        
            $bg.div.className = 'bg';
            $text.div.className = 'text';
            
            $bg.css({ background: '#eee' });
            $text.css({ color: Config.BG });
            $border.css({ border: $border.setWidth+'px solid #eee' });
        
            _this.events.fire(HydraEvents.CLICK, { index: _config.index, type: text });
        }
    }
    
    function resizeHandler() {
        $this.css({ width: _width, height: _height });
        
        $border.setWidth = Math.round(_height/25)+1;
        $border.size(_width-$border.setWidth*2, _height-$border.setWidth*2);
        $border.css({ border: $border.setWidth+'px solid #aaa' });
        
        var fontSize = _height*0.38;
        if (fontSize < 13) fontSize = 13;
        $text.css({ fontSize: fontSize, top: _height*0.5-fontSize*0.45, letterSpacing: fontSize*0.07+'px' });
    }
    

    //*** Public Methods
    this.select = function() {
        _this.selected = true;
        $overlay.invisible();
        $text.div.className = 'text';
        $bg.bg('#eee');
        $text.css({ color: Config.BG });
        $border.css({ border: $border.setWidth+'px solid #eee' });
    }
    
    this.unselect = function() {
        _this.selected = true;
        $text.div.className = 'text';
        $overlay.stopTween().css({ opacity: 0.3 });
        $text.css({ opacity: 0.5 });
    }
    
    this.resize = function(width, height) {
        _height = height;
        _width = width;
        resizeHandler();
    }
    
    this.animateIn = function() {
        _this.visible = true;
        resizeHandler();
        $overlay.css({ opacity: 1 }).tween({ opacity: 0.3 }, 400, 'easeOutSine');
        $this.show();
        if (RacerDevice.animate) $this.transform({ rotationX: -50, y: _height/3 }).tween({ rotationX: 0, y: 0 }, 400, 'easeOutCubic');
        $text.div.className = 'pulsate-text';
    }
    
    this.animateOut = function() {
        _this.visible = false;
        $overlay.tween({ opacity: 1 }, 300, 'easeOutSine');
        if (RacerDevice.animate) $this.tween({ y: -_height/2 }, 300, 'easeOutCubic', $this.hide);
    }
});
