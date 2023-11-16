Class(function LineUpViewTitleLetter(_config) {
    Inherit(this, View);
    var _this = this;
    var $this, $text, $shadow;
    _this.animate = (_config.letter !== ' ' && _config.letter !== ',') ? true : false;
    var _size = 0;
    
    //*** Constructor
    (function() {
        initHTML();
        _this.delayedCall(setSize, 100);
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ top: 0, left: 0, overflow: 'hidden', webkitBackfaceVisibility: 'hidden' });
        $this.fontStyle('AvantGarde-BoldObl', 30, '#fff');
        
        $text = $('.text');
        $text.css({ position: 'relative', top: 0, left: 0, webkitBackfaceVisibility: 'hidden' }).setZ(2);
        $text.text(_config.letter);
        $this.addChild($text);
        
        if (_this.animate) {
            $shadow = $('.shadow');
            $shadow.css({ top: 0, left: 0, opacity: 0.07, webkitBackfaceVisibility: 'hidden', color: '#000' }).setZ(1);
            $shadow.text(_config.letter);
            $shadow.invisible();
            $this.addChild($shadow);
        }
    }
    
    function setSize() {
        _this.width = CSS.textSize($this).width || 10;
    }

    //*** Event handlers

    //*** Public Methods
    this.getWidth = function(size) {
        _size = size;
        var width = _this.width*(_size/30);
        $this.css({ width: width*1.5, height: _size*1.2 });
        if ($shadow) $shadow.css({ width: width*1.5, height: _size*1.3, top: _size*0.15, left: _size*0.1 });
        $text.css({ position: 'absolute', width: width*1.5, height: _size*1.3, top: _size*0.15, left: _size*0.1 });
        return width;
    }
    
    this.shine = function(delay) {
        if ($shadow && $shadow.visible) $shadow.visible();
        if ($text && $text.tween) $text.tween({ opacity: 0.9, y: -_size*0.15, x: -_size*0.06 }, 150, 'easeInOutCubic', delay, function(){
            if ($text && $text.tween) $text.tween({ opacity: 1, y: -0, x: 0 }, 500, 'easeInOutCubic', function(){
                if ($text && $text.clearTransform) $text.clearTransform();
                if ($shadow && $shadow.invisible) $shadow.invisible();
            });
        });
    }
});
