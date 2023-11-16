Class(function TrackMobileViewReady() {
    Inherit(this, View);
    var _this = this;
    var $this, $bg;
    var _ready, _set, _go;
    
    //*** Constructor
    (function() {
        initHTML();
        initText();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').setZ(10);
        $this.mouseEnabled(false);
        $this.invisible();
        
        $bg = $('.bg');
        $bg.size('100%').bg(Config.BG);
        $this.addChild($bg);
    }
    
    function initText() {
        _ready = _this.initClass(TrackTitleView, { text: 'READY', visible: false });
        _set = _this.initClass(TrackTitleView, { text: 'SET' });
        _go = _this.initClass(TrackTitleView, { text: 'GO' });
    }

    //*** Event handlers
    function animateWords() {
        SCSound.send("start_match");
        _ready.animateIn(function(){
            _ready.animateOut(function(){
                _set.animateIn(function(){
                    _set.animateOut(function(){
                        _go.animateIn(function(){
                            _go.animateOut();
                        });
                    });
                });
            })
        });
    }
    

    //*** Public Methods
    this.animateIn = function() {
        _this.delayedCall(function(){
            _this.events.fire(HydraEvents.COMPLETE);
        }, 4000);
        
        $this.visible();
        $bg.css({ opacity: RacerDevice.animate ? 0 : 0.65 });
        if (RacerDevice.animate) $bg.tween({ opacity: 0.65 }, 300, 'easeOutSine', animateWords);
        else animateWords();
    }
});
