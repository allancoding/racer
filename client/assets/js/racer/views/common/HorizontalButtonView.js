Class(function HorizontalButtonView(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $loader, $shadow, $overlay, $wrapper, $bg, $border, $text;
    var _shadowOffset = 4;
    
    _config = _config || {};
    _config.width = _config.width || 256;
    _config.height = _config.height || 58;
    _config.radius = 2;
    _config.color = '#f4f4f4';
    
    // _config.color = '#f4f4f4';
    _config.shadow = true;
    _this.enabled = true;
    
    //*** Constructor
    (function() {
        initHTML();
        initText();
        if (_config.text == 'JOIN' && !Global.TABLE) initLoader();
        addListeners();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(_config.width+4,_config.height+4).css({ left: '50%', webkitBackfaceVisibility: 'hidden' }).setZ(2);
        $this.invisible();
        
        $overlay = $('.overlay');
        $overlay.css({ height: '125%', width: '110%', top: '-10%', left: '-5%', opacity: 0, webkitBackfaceVisibility: 'hidden' }).setZ(20);
        $overlay.bg(Config.BG);
        $overlay.hide();
        $this.addChild($overlay);
        
        if (_config.shadow) {
            $shadow = $('.shadow');
            $shadow.alpha = 1;
            $shadow.size(_config.width,_config.height).bg('#555').css({ webkitBackfaceVisibility: 'hidden' });
            $this.addChild($shadow);
        }
        
        $wrapper = $('.wrapper');
        $wrapper.size(_config.width-6,_config.height-6).css({ background: '-webkit-linear-gradient(top, #2d2d2d 0%, #1d1d1d 100%)', overflow: 'hidden', webkitBackfaceVisibility: 'hidden' });
        $this.addChild($wrapper);
        
        $border = $('.border');
        $border.size(_config.width-8, _config.height-8).css({ overflow: 'hidden', top: 2, left: 2, webkitBackfaceVisibility: 'hidden' }).setZ(5);
        $wrapper.addChild($border);
        
        $bg = $('.bg');
        $bg.size('100%').css({ width: '104%', height: '108%', left: '-2%', top: '-4%', background: _config.color, webkitBackfaceVisibility: 'hidden' }).setZ(6);
        $bg.transform({ y: _config.height });
        $border.addChild($bg);
    }
    
    function initText() {
        $text = $('.text');
        $text.fontStyle('AvantGarde', 15, '#f4f4f4');
        $text.css({ width: '100%', textAlign: 'center', fontWeight: 'bold' }).setZ(10);
        $text.text(_config.text);
        $this.addChild($text);
    }
    
    function initLoader() {
        $loader = $('.spin-loader');
        $loader.bg(Config.PATH+'assets/images/common/spin-loader.png').setZ(19);
        $loader.css({ left: '50%', top: '50%' });
        $loader.hide();
        $this.addChild($loader);
    }

    //*** Event handlers
    function addListeners() {
        $this.interact(hover, click);
    }
    
    function hover(e) {
        if (!_this.clicked && _this.enabled && _this.visible) {
            switch (e.action) {
                case 'over':
                    $text.css({ color: '#111' });
                    if (_config.shadow) {
                        if (RacerDevice.animate) {
                            $this.tween({ x: _shadowOffset*0.8, y: _shadowOffset*0.8 }, 50, 'easeOutCubic');
                            $shadow.tween({ x: -_shadowOffset*0.8, y: -_shadowOffset*0.8 }, 50, 'easeOutCubic');    
                        } else {
                            $this.transform({ x: _shadowOffset*0.8, y: _shadowOffset*0.8 });
                            $shadow.transform({ x: -_shadowOffset*0.8, y: -_shadowOffset*0.8 });
                        }
                    }
                    
                    $bg.visible().clearTransform().stopTween().clearAlpha();
                break;
                case 'out':
                    $text.css({ color: '#f4f4f4' });
                    if (_config.shadow) {
                        $this.tween({ x: 0, y: 0 }, 140, 'easeOutCubic');
                        $shadow.tween({ x: 0, y: 0 }, 140, 'easeOutCubic');
                    }
                    
                    if (RacerDevice.animate) $bg.tween({ y: -_config.height+5 }, 300, 'easeOutCirc', $bg.invisible);
                    else $bg.invisible();
                break;
            }
        }
    }
    
    function click(e) {
        if (!_this.clicked && _this.enabled && _this.visible) {
            if ($loader) {
                $text.invisible();
                $loader.show();
            }
            if (!_config.noSound) {
                if (_config.start) SCSound.send("start_click");
                else SCSound.send("click");
            }
            $text.css({ color: '#111' });
            $bg.visible().clearTransform();
            _this.clicked = true;
            if (!$loader) _this.events.fire(HydraEvents.CLICK, { text: _config.text });
        }
    }
    
    function resizeHandler(fontSize) {
        if ($loader) $loader.size(_config.height*0.6, _config.height*0.6).css({ marginLeft: -_config.height*0.3, marginTop: -_config.height*0.3 });
        
        _config.radius = _config.height*0.05;
        
        $this.size(_config.width+4,_config.height+4).css({ marginLeft: -_config.width/2 });
        $wrapper.size(_config.width, _config.height).css({ borderRadius: _config.radius });
        $text.css({ top: fontSize ? _config.height*0.5-fontSize*0.4 : _config.height*0.4, fontSize: fontSize || _config.height*0.25, letterSpacing: fontSize ? fontSize*0.09+'px' : _config.height*0.021+'px' });
        
        if ($border) {
            var borderWidth = Math.round(_config.height*0.04)+1;
            $border.size(_config.width-borderWidth*2-2, _config.height-borderWidth*2-2);
            $border.css({ borderRadius: _config.radius, border: borderWidth+'px solid '+_config.color });
        }
        if (!_this.clicked) $bg.transform({ y: _config.height });
        if ($shadow) {
            _shadowOffset = Math.round(_config.height*0.09);
            $shadow.size(_config.width,_config.height).css({ borderRadius: _config.radius, top: _shadowOffset, left: _shadowOffset });
        }
    }

    //*** Public Methods
    this.changeColor = function(color) {
        _config.color = color;
        if ($shadow) $shadow.bg(color);
        $bg.bg(color);
        $border.css({ borderColor: color });
    }
    
    this.resize = function(width, height, fontSize) {
        _config.width = width;
        _config.height = height;
        resizeHandler(fontSize);
    }
    
    this.reset = function() {
        _this.clicked = false;
        _this.enabled = true;
        $text.css({ color: '#f4f4f4' });
        if ($loader) {
            $text.visible();
            $loader.hide();
        }
        $bg.invisible();
        if ($shadow) $shadow.clearTransform().css({ opacity: $shadow.alpha });
        $this.visible().show().clearTransform();
        hover({ action: 'out' });
    }
    
    this.enable = function() {
        if (!_this.enabled) {
            $this.mouseEnabled(true);
            $text.text(_config.text).setZ(10);
            _this.enabled = true;
            _this.clicked = false;
            $bg.invisible();
            $this.clearTransform();
            if ($shadow) $shadow.clearTransform().css({ opacity: $shadow.alpha });
            $overlay.css({ opacity: 0 });    
        }
    }
    
    this.disable = function(noAnim, text) {
        if (text) $text.text(text).setZ(30);
        if (_this.enabled) {
            if ($loader && _this.clicked) {
                $text.visible();
                $loader.hide();
            }

            $this.mouseEnabled(false);
            _this.enabled = false;
            if (!noAnim) {
                $overlay.show().css({ opacity: 0.9 });
                if (!RacerDevice.android) $text.tween({ color: '#f4f4f4' }, 200, 'easeOutCubic');
                else $text.css({ color: '#f4f4f4' });
                $bg.tween({ opacity: 0 }, 200, 'easeOutSine', $bg.invisible);
            }
        }
    }
    
    this.click = function() {
        _this.clicked = true;
        if (!$text.invisible || !$this.show) return false;
        if ($loader) {
            $text.invisible();
            $loader.show();
            $bg.stopTween().visible().css({ opacity: 1 }).clearTransform();
            $this.tween({ x: _shadowOffset*0.8, y: _shadowOffset*0.8 }, 50, 'easeOutCubic');
            $shadow.tween({ x: -_shadowOffset*0.8, y: -_shadowOffset*0.8 }, 50, 'easeOutCubic');
        } else {
            $text.stopTween().css({ color: RacerDevice.android ? '#f4f4f4' : '#111' });
            if (!RacerDevice.android) $text.tween({ color: '#f4f4f4' }, 200, 'easeOutSine');
            $bg.visible().stopTween().transform({ y: 0 }).css({ opacity: 1 }).tween({ opacity: 0 }, 200, 'easeOutSine', function(){
                $bg.stopTween().css({ opacity: 1 }).invisible();
            });
        }
    }
    
    this.animateIn = function(noAnim) {
        _this.visible = false;
        _this.clicked = false;
        
        $this.visible().show().clearTransform();
        
        if (!noAnim) {
            if (RacerDevice.animate) $this.transform({ y: _config.height/8 }).tween({ y: 0 }, 300, 'easeOutCubic');
            $overlay.show().css({ opacity: 1 }).tween({ opacity: _this.enabled ? 0 : 0.9 }, 200, 'easeOutSine', function(){
                if (_this.enabled) $overlay.hide();
            });
        }
        
        _this.delayedCall(function(){
            _this.visible = true;
        }, 400);
    }
    
    this.animateOut = function() {
        _this.visible = false;
        if (RacerDevice.animate) $this.tween({ y: -_config.height/4 }, 250, 'easeInQuad')
        $overlay.show().tween({ opacity: 1 }, 250, 'easeOutSine'); 
        _this.delayedCall(function(){
            $this.hide();
        }, 260);
    }
});
