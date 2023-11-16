Class(function LobbyPlayerViewPlayerYou(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $icon, $text;
    _this.scale = window.innerHeight < 500 ? window.innerHeight/500 : 1;
    _this.active = 0;
    
    //*** Constructor
    (function() {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(120,30).css({ top: '50%', marginTop: -10, webkitBackfaceVisibility: 'hidden' }).setZ(100);
        $this.transformPoint(0,9);
        $this.hide();
        
        $icon = $('.arrow');
        $icon.size(8,6).css({ top: 8, left: 10, webkitBackfaceVisibility: 'hidden' });
        $icon.transform({ rotation: -90 });
        $this.addChild($icon);
        
        $icon.inner = $('.arrow-icon');
        $icon.inner.size(8,6).bg(Config.PATH+'assets/images/lineup/you-triangle.png');
        $icon.addChild($icon.inner);
        
        $text = $('.text');
        $text.css({ width: '100%', whiteSpace: 'nowrap', top: 2, left: 24, textAlign: 'left'});
        $text.fontStyle('AvantGarde-BoldObl', 20, '#fff');
        $text.text('');
        $this.addChild($text);
    }
    
    //*** Event handlers
    
    //*** Public Methods
    this.activate = function() {
        if (_this.active !== 2) {
            $this.show().transform({ scale: _this.scale }).clearAlpha();
            _this.visible = true;
            $text.css({ color: '#fff', fontSize: 20, top: 2 });
            $icon.inner.bg(Config.PATH+'assets/images/lineup/you-triangle.png');
            $icon.inner.div.className = 'arrow-icon';
            $icon.css({ left: 10 });    
        }
        
        $text.text((Utils.cookie('player_name') || Global.RESULTS) ? 'YOU' : 'TAP TO CHANGE');
        _this.active = 2;
    }
    
    this.deactivate = function() {
        if (_this.active !== 1) {
            $this.show().transform({ scale: _this.scale }).clearAlpha();
            _this.visible = true;
            $text.css({ color: '#111', fontSize: 18, top: 3 }).text('PLAYER '+(Number(_config.index)+1));
            $icon.inner.bg(Config.PATH+'assets/images/lineup/you-triangle-dark.png');
            $icon.inner.div.className = 'arrow-icon-stopped';
            $icon.css({ left: 5 });
        }
        _this.active = 1;
    }
    
    this.animateIn = function() {
        if (!_this.visible) $this.show().transform({ x: 20, scale: _this.scale }).css({ opacity: 0 }).tween({ opacity: 1, x: 0 }, 300, 'easeOutCubic', function(){
            if (_this.scale == 1) $this.clearTransform();
        });
        _this.visible = true;
    }
    
    this.animateOut = function() {
        if (_this.visible) $this.hide();
        _this.visible = false;
    }
});
