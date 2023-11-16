Class(function ContentVideoView() {
    Inherit(this, View);
    var _this = this;
    var $this, $video;
    var _video, _scale;
    var _width = 852;
    var _height = 480;
    
    _this.visible = false;
    
    //*** Constructor
    (function() {
        initHTML();
        initVideo();
        addListeners();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(_width,_height).setZ(1).css({ overflow: 'hidden', bottom: 0, left: -40, pointerEvents: 'none' }).mouseEnabled(false);
        $this.transformPoint(0,_height);
    }
    
    function initVideo() {
        $video = $('.video');
        $video.size(_width,_height).transformPoint(0, _height).mouseEnabled(false);
        $this.addChild($video);

        _video = _this.initClass(Video, {
            width: _width,
            height: _height,
            src: Config.PATH+'assets/videos/hands',
            loop: true
        });
        
        _video.div.style.bottom = '0px';
        $video.addChild(_video);
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
    }
    
    function resizeHandler() {
        var max = _width*2+700;
        var scale = window.innerWidth/max;
        if (scale < 0.2) scale = 0.2;
        if (scale > 1) scale = 1;
        if (window.innerWidth < max) $video.transform({ scale: scale });
        else $video.clearTransform();
    }
    

    //*** Public Methods
    this.animateOut = function() {
        if (_this.visible && $video) {
            $this.tween({ y: _height }, 250, 'easeInCubic', function(){
                _video.pause();
            });
        }
        _this.visible = false;
    }
    
    this.animateIn = function() {
        if (!_this.visible && $video) {
            _video.play();
            $this.tween({ y: 0 }, 300, 'easeOutCubic');
        }
        _this.visible = true;
    }
    
    this.play = function() {
        if (_video && _this.visible) _video.play();
    }
    
    this.pause = function() {
        if (_video) _video.pause();
    }

});
