Class(function RacerDevice() {
  Inherit(this, Events);
  var _this = this;
  var $header, $input, _timeout;
  var _last = Date.now();
  var _frameCount = 0;
  var w = window.innerWidth;
  var h = window.innerHeight;

  this.portrait = h > w;
  this.width = this.setWidth = this.portrait ? w : h;
  this.height = this.setHeight = this.portrait ? h : w;

  this.mobile =
    (!window.location.hash.strpos("table") && Config.FORCE_MOBILE) ||
    Device.mobile;
  this.tablet = Mobile.tablet;
  this.phone = this.mobile && (this.width < 500 || this.height < 500);
  this.android = Mobile.os == "Android" || Device.detect("android");
  this.iOS = Mobile.os == "iOS";
  this.chrome =
    Mobile.browser == "Chrome" ||
    Device.browser.chrome ||
    Device.detect("crios");
  this.chrome_iphone = Device.detect("iphone") && this.chrome;
  this.chrome_version = (function () {
    var agent = Device.agent.toLowerCase();
    var check = !_this.android ? "crios/" : "chrome/";
    var version = agent.split(check)[1];
    if (_this.chrome && _this.android && version)
      return Number(version.split(".")[0]);
    if (_this.chrome && _this.iOS && version)
      return Number(version.split(".")[0]);
    return Device.browser.version;
  })();
  this.animate = !this.android;
  this.fallback = true;
  //this.animate = false;
  this.MAKEUP_FRAMES = this.android;
  this.BLUR = !this.android && !Mobile.tablet;
  this.removeURL = false;
  this.fallback_browser = !_this.mobile && !_this.chrome;

  var _checkRate = RacerDevice.mobile ? 30 : 45;
  var _checkCount = this.iOS ? 20 : 50;

  (function () {
    Hydra.ready(init);
    if (_this.mobile) Render.startRender(loop);
  })();

  function init() {
    _this.doc =
      Device.browser.ie || Device.browser.firefox
        ? document.documentElement
        : document.body;
    setTimeout(setDimensions, 500);
    addListeners();
    resizeHandler();
  }

  function setDimensions() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var portrait = h > w;
    _this.setWidth = portrait ? w : h;
    _this.setHeight = portrait ? h : w;
  }

  function loop(t) {
    var diff = t - _last;
    _last = t;
    var rate = 1000 / diff;
    Global.HOLD_FRAMERATE = rate;
    Global.LAST_FRAME = diff;

    if (!Global.BUILDING_TRACK && !Global.TABLE) {
      if (!Global.LOADED) {
        if (rate < _checkRate) {
          _frameCount++;
        } else {
          _frameCount--;
          if (_frameCount < 0) _frameCount = 0;
        }

        if (_frameCount >= _checkCount && !Config.PRESENTATION) {
          Global.BAD_PERFORMANCE = "framerate";
        }
      }

      if (diff > 10000 && RacerDevice.mobile) {
        if (Config.USE_WEBSOCKETS) SocketConnection.timeout();
      }
    }
  }

  //*** Event handlers
  function addListeners() {
    _this.events.subscribe(RacerEvents.REFRESH, refreshPage);
    window.addEventListener("orientationchange", orientationChange);
    _this.events.subscribe(HydraEvents.RESIZE, function () {
      if (_timeout) clearTimeout(_timeout);
      _timeout = setTimeout(resizeHandler, 100);
    });
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await requestWakeLock();
      } else if (this.wakeLock && typeof this.wakeLock.release === 'function' && document.visibilityState === 'hidden') {
        await this.wakeLock.release();
        this.wakeLock = null;
      }
    });
    (async () => {
      await requestWakeLock();
    })();
  }

  const requestWakeLock = async () => {
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
      console.log('Wake Lock is active');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  function refreshPage() {
    var $overlay = $(".overlay");
    $overlay
      .size("100%")
      .bg(Config.BG)
      .css({ top: 0, left: 0, opacity: 0, display: "block" })
      .setZ(222);
    __body.addChild($overlay);

    $overlay.tween({ opacity: 1 }, 300, "easeOutSine", 10, function () {
      Container.instance().refresh();
      $overlay.remove();
    });
  }

  function orientationChange() {
    _this.events.fire(RacerEvents.ORIENTATION_CHANGE);
  }

  function resizeHandler() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    _this.portrait = h > w;

    _this.isKeyboard =
      (w == _this.width && h !== _this.height) ||
      (RacerDevice.android && h < 250) ||
      (w == _this.width && h == _this.height && h != _this.previousHeight);
    var canResize = _this.portrait || !RacerDevice.mobile;
    if (_this.width == w && _this.height == h) canResize = false;

    if ((canResize && !_this.isKeyboard) || _this.android) {
      _this.width = w;
      _this.height = h;
      __body.css({ height: _this.removeURL ? _this.height + 1 : "100%" });
      _this.events.fire(RacerEvents.RESIZE);
    }

    _this.previousHeight = h;
  }

  function initHeader() {
    $header = $(".header");
    $header.size("100%", 40).bg("#f00").setZ(10e10).css({ top: 0, left: 0 });
    __body.addChild($header);
    $header.interact(null, headerClick);
  }

  function headerClick() {
    $header.remove();
    _this.removeURL = false;
    resizeHandler();
    _this.doc.scrollTop = 0;
  }

  //*** Public Methods
  this.getScreen = function () {
    return { w: _this.setWidth, h: _this.setHeight };
  };

  this.cancelTouch = function () {
    Hydra.autoPreventClicks = true;
    window.addEventListener("touchmove", function (e) {
      var touch = Utils.touchEvent(e);
      if (touch.y < 75) return false;
    });

    window.addEventListener('touchstart', function() {
      if (Mobile.os == 'Android' && !Device.getFullscreen()) Device.openFullscreen();
    });
  };

  this.fullscreen = function () {
    _this.removeURL = true;
    resizeHandler();
    window.scrollTo(0, 1);
    setTimeout(function () {
      window.scrollTo(0, 1);
    }, 20);
  };

  this.exitFullscreen = function () {
    _this.removeURL = false;
    resizeHandler();
    window.scrollTo(0, 0);
  };

  this.inputFocus = function () {
    console.log('focus');
    $input.div.focus();
  };
}, "Static");
