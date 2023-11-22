Class(function MenuMobileView() {
    Inherit(this, View);
    var _this = this;
    var $this, $text, $errorTitle, $errorText;
    var _logo, _chrome, _links, _start, _join, _errorButton;
    var _width;
    
    //*** Constructor
    (function() {
        initHTML();
        initViews();
        if (!Global.BAD_PERFORMANCE) initButtons();
        else initError();
        addListeners();
        resizeHandler();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').css({ webkitBackfaceVisibility: 'hidden' });
        $this.invisible();
    }
    
    function initViews() {
        _logo = _this.initClass(LogoView);
        _chrome = _this.initClass(ChromeExperimentView);
        _links = _this.initClass(LinksView);
    }
    
    function initButtons() {
        $text = $('.text');
        $text.fontStyle('AvantGarde', 15, '#fff');
        $text.css({ fontWeight: 'bold', width: '100%', textAlign: 'left', whiteSpace: 'nowrap', letterSpacing: '1px', lineHeight: 22, top: '49%', marginTop: -50 });
        $text.text('GET READY TO RACE AND TELL YOUR<br>FRIENDS TO GO TO:<br><strong> '+Config.URL+'</strong>')
        $text.invisible();
        $this.addChild($text);
        
        _start = _this.initClass(HorizontalButtonView, { text: 'START A NEW RACE', color: '#eee', shadow: true, start: true });
        _start.css({ top: '50%', marginTop: -35 });
    
        _join = _this.initClass(HorizontalButtonView, { text: 'JOIN A RACE', color: '#eee', shadow: true });
        _join.css({ top: '50%', marginTop: 45 });
    }
    
    function initError() {
        $errorTitle = $('.error-title');
        $errorTitle.fontStyle('AvantGarde-BoldObl', 40, '#fff');
        $errorTitle.css({ width: '100%', top: '50%', letterSpacing: '2px', marginTop: -65, textAlign: 'center', opacity: 0 });
        $errorTitle.text('AW SNAP');
        $this.addChild($errorTitle);
        
        $errorText = $('.error-text');
        $errorText.fontStyle('AvantGarde', 12, '#fff');
        $errorText.css({ fontWeight: 'bold', width: '100%', top: '50%', whiteSpace: 'nowrap', letterSpacing: '0.5px', marginTop: -15, textAlign: 'center', lineHeight: 17, opacity: 0 });
        
        switch (Global.BAD_PERFORMANCE) {
            case 'latency':
                $errorText.text('It looks like<br/>your connection is too slow.<br/>Wifi works best.');
            break;
            case 'framerate':
                if (RacerDevice.mobile) GATracker.trackPage("mobile old device error");
                else GATracker.trackPage("old device error");
                $errorText.text('Your phone or tablet isn’t fast enough.<br/>Racer’s an experiment that might<br/>not work with every device.');
            break;
        }
       
        $this.addChild($errorText);
        
        _errorButton = _this.initClass(HorizontalButtonView, { text: 'LEARN MORE' });
        _errorButton.css({ top: '50%', marginTop: 48 });
        _errorButton.events.add(HydraEvents.CLICK, initAboutOverlay);
    }
    
    function initAboutOverlay() {
        _about = _this.initClass(ErrorOverlay, { type: 'about', height: 310 });
        __body.addChild(_about);
        _about.events.add(HydraEvents.CLICK, removeAboutOverlay);
        _about.events.add(HydraEvents.ERROR, removeAboutOverlay);
    }
    
    function removeAboutOverlay() {
        _errorButton.reset();
        if (_about) _about = _about.destroy();
    }

    //*** Event handlers
    function addListeners() {
        if (_start) _start.events.add(HydraEvents.CLICK, startClick);
        if (_join) _join.events.add(HydraEvents.CLICK, joinClick);
        _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
    }
    
    function resizeHandler() {
        var height = window.innerHeight/12+18;
        if (height < 50) height = 50;
        if (height > 70) height = 70;
        _width = 150+height*2.2;
        if (RacerDevice.width < 340) _width = 260;
        
        if ($text) {
            var fontSize = _width/24;
            $text.css({ fontSize: fontSize, letterSpacing: fontSize*0.09+'px', width: _width, left: '50%', marginLeft: -_width/2+1, marginTop: -height*0.75-10, lineHeight: fontSize*1.4+'px'  });
        }
        
        if (_start) {
            _start.resize(_width, height);
            _start.css({ marginTop: -10 });
        }
        if (_join) {
            _join.resize(_width, height);
            _join.css({ marginTop: height*1.35-10 });
        }
    }
    
    function startClick() {
        GATracker.trackEvent("clickable_link", "landing", "Start New Race");
        _this.events.fire(HydraEvents.COMPLETE, { action: 'start' });
    }
    
    function joinClick() {
        GATracker.trackEvent("clickable_link", "landing", "Join Race");
        _this.events.fire(HydraEvents.COMPLETE, { action: 'join' });
    }

    //*** Public Methods
    this.animateIn = function() {
        $this.visible();
        var delay = window.innerWidth*0.8+1000;
        _logo.animateIn();
        _this.delayedCall(_logo.moveUp, delay, _width);
        _this.delayedCall(_chrome.animateIn, delay+350);
        _this.delayedCall(_links.animateIn, delay+350);
        
        if ($text) $text.visible().css({ opacity: 0 }).transform({ y: 5 }).tween({ opacity: 1, y: 0 }, 300, 'easeOutCubic', delay+500);
        
        if (_start) {
            _this.delayedCall(_start.animateIn, delay+550);
            _this.delayedCall(_join.animateIn, delay+650);    
        } else {
            $errorTitle.css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', delay+600);
            $errorText.css({ opacity: 0 }).tween({ opacity: 1 }, 300, 'easeOutSine', delay+800);
            _this.delayedCall(_errorButton.animateIn, delay+1000);  
        }
        
    }
    
    this.fadeOut = function() {
        $this.mouseEnabled(false);
        if ($text) $text.tween({ opacity: 0 }, 200, 'easeOutSine');
        if (_start) _start.animateOut();
        if (_join) _join.animateOut();
        _chrome.animateOut();
        _links.animateOut();
    }
    
    this.animateOut = function(callback) {
        _this.delayedCall(_logo.animateOut, 400, callback);
    }
});
