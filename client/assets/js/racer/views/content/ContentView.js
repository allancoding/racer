Class(function ContentView() {
    Inherit(this, View);
    var _this = this;
    var $this, $wrapper;
    var _sections = new Array()
    var _timeout, _timeout2, _timeout3, _current = -1;
    
    //*** Constructor
    (function() {
        initHTML();
        initHeader();
        initContent();
        addListeners();
        setTimeout(resizeHandler, 1500);
        //setTimeout(scrollHandler, 1800);
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').css({ overflowY: 'scroll', overflowX: 'hidden' }).setZ(1);
        
        $wrapper = $('.wrapper');
        $wrapper.css({ position: 'relative', width: 640, padding: '0 20px', margin: '0 auto', display: 'block'  }).setZ(1);
        $this.addChild($wrapper);
    }
    
    function initHeader() {
        var header = _this.initClass(ContentViewHeader);
        $wrapper.addChild(header);
        _sections.push(header);
    }
    
    function initContent() {
        var content = Data.CONTENT.getAll();
        
        for (var i = 0; i < content.length; i++) {
            var text = _this.initClass(ContentViewSection, content[i]);
            text.perma = content[i].perma;
            $wrapper.addChild(text);
            _sections.push(text);
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
        $this.div.onscroll = scrollHandler;
    }
    
    function resizeHandler() {
        for (var i = 0; i < _sections.length; i++) {
            _sections[i].top = _sections[i].element.div.offsetTop;
        }
    }
    
    function scrollHandler() {
        if (_this.animating) return false;
        if (_timeout) clearTimeout(_timeout);
        _timeout = setTimeout(function(){
            var scroll = $this.div.scrollTop;
            var section = 0;
            for (var i = 0; i < _sections.length; i++) {
                if (scroll > _sections[i].top-RacerDevice.height/2) section = i;
            }
            
            if (section !== _current) {
                _this.events.fire(RacerEvents.ABOUT_SCROLLED, { index: section });
            }
            _current = section;
            
            if (scroll > 500) _this.events.fire(RacerEvents.ABOUT_SCROLLED_DOWN, { top: false });
            else _this.events.fire(RacerEvents.ABOUT_SCROLLED_DOWN, { top: true });
        }, 150);
    }
    
    function fireScroll(index) {
        if (_timeout2) clearTimeout(_timeout2);
        _timeout2 = setTimeout(function(){
            if (index == 0) _this.events.fire(RacerEvents.ABOUT_SCROLLED_DOWN, { top: true });
            else _this.events.fire(RacerEvents.ABOUT_SCROLLED_DOWN, { top: false });
        }, 700);
    }

    //*** Public Methods
    this.attach = function(){
        for (var i = 0; i < _sections.length; i++) {
            _sections[i].attach();
        }
    }
    
    this.detach = function() {
        for (var i = 0; i < _sections.length; i++) {
            _sections[i].detach();
        }
    }
    
    this.forceScroll = function(index) {
        $this.div.scrollTop = _sections[index].top;
    }
    
    this.scroll = function(index) {
        fireScroll(index);
        
        switch (_sections[index].perma) {
            case 'about': GATracker.trackPage("About"); break;
            case 'tech': GATracker.trackPage("Tech"); break;
            case 'music': GATracker.trackPage("Music"); break;
            case 'story': GATracker.trackPage("Story"); break;
        }
        
        var top = _sections[index].top;
        var scroll = $this.div.scrollTop;
        if (top !== scroll) {
            if (_timeout) clearTimeout(_timeout);
            _this.animating = true;
            var time = Math.abs(scroll-top)/4+200;
            TweenManager.tween($this.div, {scrollTop: _sections[index].top }, time, 'easeInOutCubic', null);
            if (_timeout3) clearTimeout(_timeout3);
            _timeout3 = setTimeout(function() {
                _this.animating = false;
            }, time+50);
        }
    }
});
