Class(function Main() {
    Inherit(this, Events);
    var _this = this;
    var $plus1, $wrapper;
    var _container, _loader, _cover, _error;
    
	//*** Constructor
	(function() {
	    GATracker.trackPage('landing');
	    Hydra.development(Config.DEVELOPMENT && !Device.mobile);
	    //$plus1 = __body.find('#plusone');
        //if ($plus1) $plus1.hide();
        if (RacerDevice.mobile) __body.div.innerHTML = '';
        setTimeout(RacerDevice.fullscreen, 200);
        
	    if (RacerDevice.mobile) {
            _cover = Cover.instance();
            RacerDevice.cancelTouch();
        }
        
	    init();
	})();
	
	function init() {
        if (RacerDevice.portrait || Config.DEVELOPMENT || !RacerDevice.mobile) checkError();
        else _this.events.subscribe(RacerEvents.RESIZE, checkError);
	}

    function checkError() {
        _this.events.unsubscribe(RacerEvents.RESIZE, init);
        if (RacerDevice.mobile && !Global.TABLE && !Config.DEVELOPMENT) {
            if (!RacerDevice.chrome && (!Utils.cookie('notchrome') || RacerDevice.android)) { // If not chrome 
                __body.css({ pointerEvents: 'auto' });
                Utils.cookie('notchrome', true);
                _error = new ErrorOverlay({ type: 'notchrome', toBody: true });
                if (!RacerDevice.android) _error.events.add(HydraEvents.ERROR, initLoader);
                if (!RacerDevice.android) _error.events.add(HydraEvents.CLICK, initLoader);
            } else if (RacerDevice.chrome && RacerDevice.chrome_version < 26) { // If old chrome
                __body.css({ pointerEvents: 'auto' });
                _error = new ErrorOverlay({ type: 'oldchrome', toBody: true });
            } else {
                initLoader();
            }
        } else {
            initLoader();
        }
    }
    
	function initLoader() {
	    _this.events.unsubscribe(RacerEvents.RESIZE, init);
	    __body.css({ pointerEvents: 'none' });
	    if (_error) _error = _error.destroy();
	    if (!_loader) setTimeout(function(){
	        _loader = new Loader();
            _loader.events.add(HydraEvents.COMPLETE, loaderComplete);    
	    }, 100);
	}
	
	//*** Event Handlers
	function loaderComplete() {
	    _this.events.unsubscribe(RacerEvents.RESIZE, init);
	    __body.css({ pointerEvents: 'auto' });
	    setTimeout(function() {
    	    Data.init();
    	    if (!RacerDevice.fallback_browser) paper.install(window);
    	    Global.LOADED = true;
    	    _loader = _loader.destroy();
    	    _container = Container.instance();
	    }, 100);
	}
});
	
