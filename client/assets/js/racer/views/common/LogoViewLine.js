Class(function LogoViewLine(_config) {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _width = window.innerWidth;

    //*** Constructor
    (function() {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.css({ width: '100%', height: _config.full ? 3 : 2, top: _config.index*(_config.full ? 16 : 8), left: 0, webkitBackfaceVisibility: 'hidden' });
        $this.bg(Config.LOGO_COLORS[4-_config.index]);
        if (!_config.small) $this.hide();
    }

    //*** Public Methods
    this.resize = function(width) {
        _width = width;
    }
    
    this.animateIn = function(move) {
        $this.show();
        $this.transform({ x: -move });
        $this.tween({ x: 0 }, _config.full ? move/2+200 : 600, 'easeInOutCubic');    
    }
    
    this.animateOut = function(move) {
        $this.tween({ x: move }, 500, 'easeInOutCubic');
    }
});
