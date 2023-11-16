Class(function ErrorOverlay(_config) {
  Inherit(this, View);
  var _this = this;
  var $this, $close, $bg, $wrapper, $title, $copy, $appStore, $playStore;
  var _button, _filter, _height;

  Global.ERROR = true;

  var _titleText = "AW SNAP";
  var _titleSize = 55;
  var _copyText = _config.type.toUpperCase();
  var _copySize = 20;
  var _buttonText = "REFRESH";
  var _buttonWidth = 240;
  var _buttonSize = null;
  var _showClose = false;

  var _chromeAppStoreLink =
    "https://itunes.apple.com/us/app/chrome/id535886823?mt=8";
  var _chromePlayStoreLink =
    "https://play.google.com/store/apps/details?id=com.android.chrome&hl=en";
  var _musicLink =
    "https://play.google.com/store/music/album?id=Bn3t4iq5r5fvw4puw7q5y62deny";
  var _youTubeLink = "http://youtu.be/2N03GWn4Xok";
  var _link = RacerDevice.android ? _chromeAppStoreLink : _chromeAppStoreLink;

  switch (_config.type) {
    case "removed":
      _copyText = "The host has removed you<br/>from the lobby";
      _buttonText = "RETURN HOME";
      break;
    case "fps":
      _copyText =
        "Your phone or tablet isn’t fast enough.<br/>Racer’s an experiment that might<br/>not work with every device.";
      _buttonText = "LEARN MORE";
      break;
    case "latency-you":
      _copyText =
        "It looks like your connection is too slow.<br/>Wifi works best.";
      _buttonText = "REFRESH";
      break;
    case "latency":
      _copyText = "Another racer’s connection is too slow. Start a new race.";
      _buttonText = "RETURN TO LOBBY";
      break;
    case "lostconnection":
      GATracker.trackPage("mobile disconnect error");
      _copyText = "Your phone went to sleep or lost its connection.";
      _buttonText = "REFRESH";
      break;
    case "missing":
      _copyText = "Another racer’s phone went to sleep or lost its connection.";
      _buttonText = "RETURN TO LOBBY";
      break;
    case "singleplayer":
      GATracker.trackPage("race_with_friends");
      _titleText = "RACE WITH FRIENDS";
      _titleSize = 44;
      _buttonWidth = 260;
      _buttonText = "CONTINUE AS ONE PLAYER";
      _copyText =
        "Racer is designed to work<br/>across multiple screens.<br/>It’s most fun with at least<br/>two other players.";
      _copySize = 18;
      _buttonSize = 12;
      _showClose = true;
      break;
    case "about":
      GATracker.trackPage("about");
      _titleText = "YOU.<br/>A FEW FRIENDS.</br>ONE RACE.";
      _titleSize = 34;
      _buttonText = "OK, COOL";
      _copyText =
        "Line up your phones and tablets to create a racetrack across up to five screens.<br/>No apps. No downloads. Just start a race, sync up and tap your screens to rev your engines. Multiplayer games for the mobile browser are here.";
      _copySize = 12;
      _showClose = true;
      break;
    case "music":
      GATracker.trackPage("music");
      _titleText = "RACER BY<br/>GIORGIO</br>MORODER";
      _titleSize = 38;
      _copyText =
        "Music pioneer Giorgio Moroder scored the dynamic soundtrack for Racer. Snag the single now on the Google Play store.";
      if (!Config.DOWNLOAD_TRACK)
        _copyText =
          "Music pioneer Giorgio Moroder scored the dynamic soundtrack for Racer. Listen to the single now on YouTube";
      _copySize = 14;
      _showClose = true;
      _buttonText = null;
      break;
    case "notchrome":
      if (RacerDevice.mobile)
        GATracker.trackPage("mobile non-chrome browser error");
      else GATracker.trackPage("non-chrome browser error");
      _titleText = "MADE FOR<br/>CHROME";
      _titleSize = 38;
      _copyText =
        'For the best experience<br/>we recommend racing<br/>with Chrome for Mobile.<br/><a href="' +
        _link +
        '" target="_blank">Get it now on the ' +
        (RacerDevice.android ? "play" : "app") +
        " store.</a>";
      _copySize = 14;
      _buttonText = RacerDevice.android ? null : "CONTINUE WITHOUT CHROME";
      _showClose = RacerDevice.android ? false : true;
      _buttonWidth = 250;
      _buttonSize = 11;
      break;
    case "oldchrome":
      _titleText = "UPDATE CHROME";
      _titleSize = 38;
      _copyText =
        "Racer is made for the latest version of Chrome for mobile. Update now to race your friends.";
      _copySize = 14;
      _buttonText = null;
      break;
  }

  //*** Constructor
  (function () {
    track();
    initConfig();
    initHTML();
    if (_showClose) initClose();
    initTitle();
    initCopy();
    if (
      (_config.type == "notchrome" && !RacerDevice.android) ||
      (_config.type == "oldchrome" && !RacerDevice.android)
    )
      initAppStore();
    if (
      _config.type == "music" ||
      (_config.type == "notchrome" && RacerDevice.android) ||
      (_config.type == "oldchrome" && RacerDevice.android)
    )
      initPlayStore();
    if (_buttonText) initButton();
    _this.delayedCall(addListeners, _config.delay + 300);
    _this.delayedCall(animateIn, _config.delay);
  })();

  function track() {
    if (_config.type == "music") GATracker.trackPage("music");
    else GATracker.trackPage("error/" + _config.type);
  }

  function initConfig() {
    _config = _config || {};
    _config.type =
      _config.type && _config.type !== "" ? _config.type : "missing";
    if (_config.type == "missing" && Global.SINGLE_PLAYER)
      _config.type = "latency";
    _config.delay = _config.delay || 1;
    _height = _config.height || 310;
  }

  function initHTML() {
    $this = _this.element;
    $this.size("100%").css({ top: 0, left: 0 }).setZ(222);
    if (_config.toBody) __body.addChild($this);
    $this.hide();

    $bg = $(".bg");
    var color = Global.LINEUP ? "#000" : Config.BG;
    var alpha = RacerDevice.animate ? 0.85 : 0.9;
    $bg
      .size("100%")
      .bg(color)
      .css({ opacity: Global.GAME_PLAYING ? alpha - 0.3 : alpha });
    $this.addChild($bg);

    $wrapper = $(".wrapper");
    $wrapper
      .size(320, _height)
      .css({
        top: "50%",
        left: "50%",
        marginLeft: -160,
        marginTop: -_height / 2,
      });
    $this.addChild($wrapper);

    if (Global.CONTAINER) {
      _filter = new CSSFilter(Global.CONTAINER);
      if (RacerDevice.BLUR) _filter.blur = 2;
      _filter.grayscale = 1;
    }
  }

  function initClose() {
    $close = $(".text");
    $close.fontStyle("AvantGarde-BoldObl", 14, "#fff");
    $close.css({
      width: "100%",
      top: 15,
      right: 10,
      opacity: 0.5,
      textAlign: "right",
      paddingRight: 5,
    });
    $close.text("CLOSE X");
    $this.addChild($close);
  }

  function initTitle() {
    $title = $(".text");
    $title.fontStyle("AvantGarde-BoldObl", _titleSize, "#fff");
    $title.css({
      width: "100%",
      letterSpacing: "1px",
      lineHeight: _titleSize * 1.1,
      marginTop: 2,
      textShadow:
        _titleSize * 0.06 +
        "px " +
        _titleSize * 0.06 +
        "px rgba(255,255,255,0.2)",
      textAlign: "center",
      position: "relative",
    });
    $title.text(_titleText);
    $wrapper.addChild($title);
  }

  function initCopy() {
    $copy = $(".text");
    $copy.fontStyle("AvantGarde", _copySize, "#fff");
    $copy.css({
      width: "90%",
      marginLeft: "5%",
      letterSpacing: "1px",
      marginTop: 5,
      lineHeight: _copySize * 1.3 + 2 + "px",
      textAlign: "center",
      position: "relative",
    });
    $copy.text(_copyText);
    $wrapper.addChild($copy);
  }

  function initAppStore() {
    $appStore = $(".app-store");
    $appStore
      .size(150, 50)
      .css({
        position: "relative",
        margin: "20px auto 0 auto",
        display: "block",
      });
    $appStore.bg(Config.PATH + "assets/images/common/logos/appstore.png");
    $appStore.interact(null, function () {
      close();
      getURL(_chromeAppStoreLink, "_blank");
    });
    $wrapper.addChild($appStore);
  }

  function initPlayStore() {
    $playStore = $(".play-store");
    $playStore
      .size(250, 85)
      .css({
        position: "relative",
        margin: "20px auto 0 auto",
        display: "block",
      });
    if (_config.type == "music") {
      if (Config.DOWNLOAD_TRACK) {
        $playStore.bg(Config.PATH + "assets/images/common/logos/play.png");
        $playStore.interact(null, function () {
          GATracker.trackEvent("music", "music_events", "Download Music");
          close();
          getURL(_musicLink, "_blank");
        });
      } else {
        $playStore
          .bg(Config.PATH + "assets/images/common/logos/youtube.png")
          .css({ backgroundPosition: "-20px 0" });
        $playStore.interact(null, function () {
          GATracker.trackEvent("music", "music_events", "Download Music");
          close();
          getURL(_youTubeLink, "_blank");
        });
      }
    } else {
      $playStore.bg(Config.PATH + "assets/images/common/logos/play.png");
      $playStore.interact(null, function () {
        close();
        getURL(_chromePlayStoreLink, "_blank");
      });
    }

    _musicLink;
    $wrapper.addChild($playStore);
  }

  function initButton() {
    _button = _this.initClass(HorizontalButtonView, {
      text: _buttonText,
      width: _buttonWidth,
      noSound: _config.toBody,
    });
    if (_buttonSize) _button.resize(_buttonWidth, 55, _buttonSize);
    _button.css({ bottom: 0 });
    _button.text = _buttonText;
    $wrapper.addChild(_button);
    _button.animateIn(true);
  }

  function animateIn() {
    if (_filter) _filter.apply();
    $this.show();
    $this.css({ opacity: 0 }).tween({ opacity: 1 }, 200, "easeOutSine");
    if (RacerDevice.animate)
      $wrapper
        .css({ opacity: 0 })
        .transform({ scale: 0.95 })
        .tween(
          { opacity: 1, scale: 1 },
          250,
          "easeOutCubic",
          200,
          $wrapper.clearTransform
        );
  }

  //*** Public Methods
  function addListeners() {
    if (_showClose) {
      $bg.interact(null, close);
      if ($close) $close.interact(null, close);
    }

    if (_button) _button.events.add(HydraEvents.CLICK, click);
  }

  function animateOut(callback) {
    if (_filter) _filter.clear();
    if (_buttonText !== "REFRESH" && _buttonText !== "RETURN TO LOBBY") {
      if (RacerDevice.animate)
        $wrapper.tween({ opacity: 0 }, 200, "easeOutSine");
      $this.tween(
        { opacity: 0 },
        200,
        "easeOutSine",
        RacerDevice.animate ? 100 : 0,
        callback
      );
    } else {
      callback();
    }
  }

  function click() {
    if (_config.type == "about")
      GATracker.trackEvent("about", "about_events", "OK Cool");
    animateOut(function () {
      Global.ERROR = false;
      _this.events.fire(HydraEvents.CLICK, {
        type: _config.type,
        text: _button ? _button.text : null,
      });
    });
  }

  function close() {
    if (_config.type == "music")
      GATracker.trackEvent("music", "music_events", "Close");
    if (_config.type == "about")
      GATracker.trackEvent("about", "about_events", "Close");
    if ($close) $close.clearAlpha();
    animateOut(function () {
      Global.ERROR = false;
      _this.events.fire(HydraEvents.ERROR, {
        type: _config.type,
        text: _button ? _button.text : null,
      });
    });
  }

  this.destroy = function () {
    Global.ERROR = false;
    if (_filter) _filter.clear();
    return _this._destroy();
  };
});
