Class(function MenuDesktopViewMenu() {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _live, _buttons;
    
    //*** Constructor
    (function() {
        initHTML();
        initNav();
        addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(115, 150).css({ top: 110, left: 0 }).setZ(2);
        $this.transform({ skewY: -13 });
        $this.invisible();
        
        var $bg = $('.bg');
        $bg.size('100%').bg(Config.BG).css({ borderRadius: 2 });
        $this.addChild($bg);
    }

    function initNav() {
        var content = Data.CONTENT.getAll();
        
        _buttons = new Array();
        for (var i = 0; i < content.length; i++) {
            var button = _this.initClass(MenuDesktopViewMenuButton, { text: content[i].perma, index: i+1 });
            button.css({ top: i*27+(_live ? 110 : 25), left: 18, pointerEvents: 'auto' });
            _buttons.push(button);
            _this.events.bubble(button, HydraEvents.CLICK);
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.ABOUT_SCROLLED, aboutScrolled);
    }
    
    function aboutScrolled(e) {
        setActive(e.index);
    }
    
    function setActive(index) {
        if (_live) {
            if (index > -1) _live.deactivate();
            else _live.activate();    
        }
        
        for (var i = 0; i < _buttons.length; i++) {
            if (i == index-1) _buttons[i].activate();
            else _buttons[i].deactivate();
        }
    }
    
    //*** Public Methods
    this.setActive = function(index) {
        if (index > -1 && _live) _live.deactivate();
        setActive(index);
    }
    
    this.animateIn = function() {
        $this.visible();
        if (_live) _live.animateIn();
        for (var i in _buttons) {
            _this.delayedCall(_buttons[i].animateIn, i*80+100);
        }
    }

});
