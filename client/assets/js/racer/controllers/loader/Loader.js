Class(function Loader() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _view, _loader;
    var _assets = {};

    //*** Constructor
    (function() {
        initContainer();
        initView();
        initScripts();
        _this.delayedCall(initLoader, 250);
        _this.delayedCall(initSounds, 50);
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%').bg(Config.BG).setZ(10);
        __body.addChild($container);
        
        if (Global.TABLE) $container.hide();
    }
    
    function initView() {
        _view = _this.initClass(LoaderView);
        _view.animateIn();
        _view.events.add(HydraEvents.COMPLETE, instructionComplete);
    }
    
    function initLoader() {
        var assets = [];
        for (var i = 0; i < Config.ASSETS.length; i++) {
            var assetUrl = Config.ASSETS[i];
            assetUrl = assetUrl.strpos('http') ? assetUrl : Config.PATH + assetUrl;
            assets.push(assetUrl);
        }
        
        if (!RacerDevice.mobile) assets.push(Config.PATH+'assets/images/content/hands.jpg');
        
        _loader = new AssetLoader(assets);
        _loader.events.add(HydraEvents.PROGRESS, progress);
        _assets.images = 0;
    }
    
    function initScripts() {
        if (!RacerDevice.fallback_browser) Config.ASSETS.push('assets/js/lib/paper.js');
        if (!Global.TABLE) {
            if (RacerDevice.mobile) Config.ASSETS.push('assets/data/mobile.js');
            else Config.ASSETS.push('assets/data/desktop.js');
        }
    }
    
    function initSounds() {
        var xmlLink = Config.PATH+"assets/sounds/config.xml";
        var mp3link = Config.PATH+"assets/sounds/";
        SCSound.disable = Global.TABLE || Config.DISABLE_SOUNDS || !RacerDevice.mobile;
        
        if (!Global.TABLE) {
            SCSound.initialize(xmlLink, mp3link, null, soundsLoaded, soundsProgress, libLoaded);
            _assets.sounds = Global.TABLE ? 1 : 0;
        } else {
            _assets.sounds = 1;
        }
    }
    
    function checkAssets() {
        
        var perc = (_assets.sounds + _assets.images) / 2;
        _view.update(perc);
        if (perc == 1 && !_view.out) {
            complete();
        }
        
        if (perc > 0.95 && !_view.out && Device.browser.ie) {
            complete();
        }
    }

    //*** Event handlers
    function progress(e) {
        _assets.images = e.percent;
        checkAssets();
    }
    
    function soundsLoaded(e) {
        _assets.sounds = 1;
        checkAssets();
    }
    
    function libLoaded(libNmbr) {
        //console.log("lib:", libNmbr, "loaded");
    }
    
    function soundsProgress(e) {
        if (e > .98) e = .98;
        _assets.sounds = e;
        checkAssets();
    }
    
    function instructionComplete() {
        if (_view.perc == 100) {
            _this.complete = true;
            _this.events.fire(HydraEvents.COMPLETE);
        }
    }
    
    function complete() {
        if (!_this.complete && _view) setTimeout(function(){
            if (!_this.complete && _view) _view.animateOut(function(){
                if (Global.SITE_LOADED == true) return;
		Global.SITE_LOADED = true;
                if (!_this.complete) _this.events.fire(HydraEvents.COMPLETE);
            });
        }, _view.animate ? 800 : 50);
    }

    //*** Public Methods
});
