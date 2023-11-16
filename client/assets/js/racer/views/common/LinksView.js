Class(function LinksView() {
    Inherit(this, View);
    var _this = this;
    var $this, $about, $music, $live, $priv, $plusone;
    var _about, _music;
    var _links = new Array();
    var _phone = RacerDevice.width < 500;
    var _margin = RacerDevice.width < 350 ? 3 : _phone ? 6 : 8;
    var _fontSize = _phone ? 9 : 12;
    var _bottom = _phone ? 5 : 14;
    if (RacerDevice.chrome_iphone && window.innerHeight < 545) _bottom += 45;
    var _width = RacerDevice.width < 350 ? 200 : !RacerDevice.mobile ? 310 : _phone ? 240 : 300;
        
    
    //*** Constructor
    (function() {
        initHTML();
        if (RacerDevice.mobile) {
            initAbout();
            initMusic();    
        } else {
            initLive();
        }
        initPrivacy();
        if (!RacerDevice.mobile) initPlusOne();
        addListeners();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(_width,20).css({ bottom: _bottom, right: 0, pointerEvents: 'auto', whiteSpace: 'nowrap' });
        $this.invisible();
    }
    
    function initAbout() {
        $about = $('.about');
        $about.fontStyle('AvantGarde', _fontSize, '#aaa');
        $about.text('ABOUT');
        $about.type = 'about';
        $about.css({ opacity: 0.6, display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', letterSpacing: RacerDevice.phone ? '1px' : '1px' });
        $this.addChild($about);
        _links.push($about);
        
        var $line = $('.line');
        $line.size(1, _fontSize-1).css({ display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', opacity: 0.15 }).bg('#fff');
        $this.addChild($line);
    }
    
    function initMusic() {
        $music = $('.music');
        $music.fontStyle('AvantGarde', _fontSize, '#aaa');
        $music.text('MUSIC');
        $music.type = 'music';
        $music.css({ opacity: 0.6, display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', letterSpacing: RacerDevice.phone ? '1px' : '1px' });
        $this.addChild($music);
        _links.push($music);
        
        var $line = $('.line');
        $line.size(1, _fontSize-1).css({ display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', opacity: 0.15 }).bg('#fff');
        $this.addChild($line);
    }
    
    function initLive() {
        $live = $('.live');
        $live.fontStyle('AvantGarde', _fontSize, '#aaa');
        $live.text('LIVE');
        $live.type = 'live';
        $live.css({ opacity: 0.6, display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', letterSpacing: RacerDevice.phone ? '1px' : '1px' });
        if (RacerDevice.fallback_browser) $live.invisible();
        $this.addChild($live);
        _links.push($live);
        
        var $line = $('.line');
        $line.size(1, _fontSize-1).css({ display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', opacity: 0.15 }).bg('#fff');
        if (RacerDevice.fallback_browser) $line.invisible();
        $this.addChild($line);
    }

    function initPrivacy() {
        $priv = $('.privacy');
        $priv.fontStyle('AvantGarde', _fontSize, '#aaa');
        $priv.text('TERMS & PRIVACY');
        $priv.type = 'privacy';
        $priv.css({ opacity: 0.6, display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', letterSpacing: RacerDevice.phone ? '1px' : '1px' });
        $this.addChild($priv);
        _links.push($priv);
    }
    
    function initPlusOne() {
        var $line = $('.line');
        $line.size(1, _fontSize-1).css({ display: 'block', margin: '0 '+_margin+'px', cssFloat: 'left', styleFloat: 'left', position: 'relative', opacity: 0.15 }).bg('#fff');
        $this.addChild($line);
    }
    
    function initAboutOverlay() {
        _about = _this.initClass(ErrorOverlay, { type: 'about', height: 310 });
        __body.addChild(_about);
        _about.events.add(HydraEvents.CLICK, removeAboutOverlay);
        _about.events.add(HydraEvents.ERROR, removeAboutOverlay);
    }
    
    function initMusicOverlay() {
        _music = _this.initClass(ErrorOverlay, { type: 'music', height: 310 });
        __body.addChild(_music);
        _music.events.add(HydraEvents.CLICK, removeMusicOverlay);
        _music.events.add(HydraEvents.ERROR, removeMusicOverlay);
    }
    
    function removeAboutOverlay() {
        if (_about) _about = _about.destroy();
    }
    
    function removeMusicOverlay() {
        if (_music) _music = _music.destroy();
    }

    //*** Event handlers
    function addListeners() {
        for (var i = 0; i < _links.length; i++) {
            _links[i].interact(btnHover, btnClick);
        }
    }
    
    function btnHover(e) {
        switch (e.action) {
            case 'over':
                e.object.tween({ opacity: 1 }, 100, 'easeOutSine');
            break;
            case 'out':
                e.object.tween({ opacity: 0.6 }, 200, 'easeOutSine');
            break;
        }
    }
    
    function btnClick(e) {
        switch (e.object.type) {
            case 'about':
                initAboutOverlay();
                GATracker.trackEvent("clickable_link", "landing", "About");
            break;
            case 'music':
                initMusicOverlay();
                GATracker.trackEvent("clickable_link", "landing", "Music");
            break;
            case 'privacy':
                getURL('https://www.google.com/intl/en/policies/', '_blank');
                if (RacerDevice.mobile) GATracker.trackEvent("clickable_link", "landing", "Terms Privacy");
                else GATracker.trackEvent("clickable_link", "desktop_footer", "Terms Privacy");
            break;
            case 'live':
                if (!RacerDevice.fallback_browser) _this.events.fire(RacerEvents.DESKTOP_LIVE);
            break;
        }

        _this.delayedCall(function(){
            e.action = 'out';
            btnHover(e);
        }, 100);
    }

    //*** Public Methods
    this.animateIn = function(){
        $this.visible().css({ opacity: 0 }).transform({ y: 6 }).tween({ opacity: 0.6, y: 0 }, 300, 'easeOutCubic', function(){
            $this.clearTransform();
            $this.clearAlpha();
        });
    }
    
    this.animateOut = function() {
        $this.tween({ opacity: 0, y: 6 }, 300, 'easeInCubic');
    }
});
