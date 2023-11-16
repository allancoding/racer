Class(function LobbyCodeViewCodeSingle(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $overlay, $text, $dash, $border, $input, $bg, $blink;
    var _code = '', _blink, _isHost;
    _config.size = _config.size || 70;
    _this.isLocked = (_config.set !== '') ? true : false;
    
    //*** Constructor
    (function() {
        initHTML();
        initText();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ cursor: 'text', webkitBackfaceVisibility: 'hidden' }).setZ(5);
        if (!_config.name) $this.css({ overflow: 'hidden' });
        $this.invisible();
        $this.mouseEnabled(false);
        
        $overlay = $('.overlay');
        $overlay.css({ height: '110%', width: '110%', top: '-5%', left: '-5%', webkitBackfaceVisibility: 'hidden' }).setZ(20);
        $overlay.bg(Config.BG);
        $this.addChild($overlay);
        
        if (_config.border) {
            $border = $('.border');
            $border.css({ top: 0, left: 0, border: '2px solid #fff', opacity: _this.isLocked ? 1 : 0.2 });
            $this.addChild($border);
            
            $bg = $('.bg');
            $bg.size('100%').css({ top: 0, left: 0, webkitBackfaceVisibility: 'hidden', background: '-webkit-linear-gradient(top, #fff 30%, #e6e6e6 100%)' });
            $bg.invisible();
            $this.addChild($bg);
        }
        
        $blink = $('.blink');
        $blink.size(2, 10).css({ backgroundColor: '#fff', webkitBackfaceVisibility: 'hidden', opacity: 0.75 }, true).setZ(5).hide();
        $this.addChild($blink);
    }
    
    function initText() {
        $text = $('.text');
        $text.fontStyle('AvantGarde-BoldObl', 12, '#fff');
        $text.css({ width: '100%', webkitBackfaceVisibility: 'hidden', textAlign: 'center'}).setZ(10);
        $text.text(_config.set);
        $this.addChild($text);
    }
    
    //*** Event handlers
    function resizeHandler() {
        var radius = Math.round(_config.size*0.02);
        var width = _config.name ? _config.size*0.65 : _config.size;
        $this.size(width, _config.size).css({ borderRadius: radius });
        $text.css({ fontSize: _config.size*0.57, top: _config.size/2-_config.size*0.25, left: -_config.size*0.05 });
        $blink.css({ width: _config.size*0.04, height: _config.size*0.52, left: _config.name ? width*0.1 : width*0.22, top: _config.size*0.24 });
        if ($border) $border.css({ borderRadius: radius, width: _config.size*0.9, height: _config.size*0.9, border: _config.size*0.042+'px solid #fff' });
        if ($bg) $bg.css({ borderRadius: radius });
        var size = _config.size*0.06;
        if (_isHost) $text.css({ textShadow: size+'px '+size*0.8+'px rgba(255,255,255,0.25)' });
        else $text.css({ textShadow: 'none' });
    }
    
    //*** Public Methods
    this.resize = function(size) {
        _config.size = size;
        resizeHandler();
    }
    
    this.reset = function() {
        _code = '';
        $text.text('');
        $text.css({ textShadow: 'none' });
        if ($border) $border.css({ opacity: 0.25 });
    }
    
    this.change = function(code) {
        $text.text(code);
        $text.css({ textShadow: 'none' });
        _code = code;
    }
    
    this.focus = function(){
        $blink.show();
        if ($border) $border.stopTween().css({ opacity: 0.75 });
    }
    
    this.blur = function(noStop) {
        $blink.hide();
        if ($border) {
            if (_code == '') $border.css({ opacity: 0.25 });
            else $border.stopTween().clearAlpha();
        }
    }
    
    this.set = function(code, index, isHost, noAnim, keepBorder) {
        _isHost = isHost;
        $this.visible();
        $text.text(code);
        $overlay.hide();
        $blink.hide();
        if (code == '?') {
            $text.css({ color: '#111' });
        } else {
            $text.css({ color: '#fff' });
        }
        
        if (_config.border && !keepBorder) {
            if (!noAnim) {
                $text.tween({ color: Config.BG }, 80, 'linear', 280);
                $bg.visible().transform({ y: _config.size+1 }).tween({ y: 0 }, 500, 'easeInOutCubic');       
            } else {
                $text.css({ color: Config.BG });
                $bg.visible().clearTransform(); 
            }
        } else {
            if ($border) {
                if (_code == '') $border.css({ opacity: 0.25 });
                else $border.stopTween().clearAlpha();    
            }
        }
        
        resizeHandler();
    }
    
    this.animateIn = function(code) {
        if (code) $text.text(code);
        $this.visible();
        $overlay.tween({ opacity: 0 }, 300, 'easeOutSine');
        if (RacerDevice.animate) {
            $this.transform({ y: _config.size/6 }).tween({ y: 0 }, 300, 'easeOutCubic');
            $text.transform({ scale: 0.75 }).tween({ scale: 1 }, 400, 'easeOutCubic');
            _this.delayedCall(function(){
                _this.visible = true;
            }, 400);
        }
    }
    
    this.animateOut = function() {
        $overlay.show().tween({ opacity: 1 }, 300, 'easeOutSine');
        if (RacerDevice.animate) $this.tween({ y: -_config.size/6 }, 300, 'easeInCubic');
        setTimeout(function(){
            $this.hide();
        }, 300);
    }
});
