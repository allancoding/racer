Class(function LobbyCodeView(_config) {
  Inherit(this, View);
  var _this = this;
  var $this, $buttons, $instruction;
  var _code, _input, _join, _exit, _width;
  var _size = 10;
  var _gap = 1;
  var _timeout;

  _config.length = _config.length || 5;
  _config.border = _config.border || false;
  _config.text = _config.text || false;
  _config.center = _config.center || false;
  _config.keepInput = _config.keepInput || false;
  _config.table = _config.table || false;

  //*** Constructor
  (function () {
    initHTML();
    initCode();
    if (_config.text && _config.input) initButtons();
    if (_config.input) addListeners();
  })();

  function initHTML() {
    $this = _this.element;
    if (_config.center) $this.css({ position: "relative", margin: "0 auto" });
    $this.setZ(20);
    $this.invisible();
  }

  function initCode() {
    _code = _this.initClass(LobbyCodeViewCode, _config);
    if (_config.input) _input = _this.initClass(LobbyCodeViewInput, _config);
  }

  function initButtons() {
    $buttons = $(".buttons");
    $buttons
      .css({
        width: 230,
        height: 50,
        bottom: -70,
        left: "50%",
        marginLeft: -115,
      })
      .setZ(222);
    $this.addChild($buttons);

    _join = _this.initClass(HorizontalButtonView, {
      text: "JOIN",
      width: 125,
      height: 50,
    });
    $buttons.addChild(_join);

    if (!_config.table) {
      _join.css({ left: 0, marginLeft: 105 });

      _exit = _this.initClass(HorizontalButtonView, {
        text: "EXIT",
        width: 90,
        height: 50,
      });
      _exit.css({ left: 0, marginLeft: 0 });
      $buttons.addChild(_exit);
    }

    if (RacerDevice.mobile && !Global.TABLE) {
      $instruction = $(".text");
      $instruction.fontStyle("AvantGarde", 15, "#aaa");
      $instruction.css({
        fontWeight: "bold",
        width: "100%",
        whiteSpace: "nowrap",
        letterSpacing: "1px",
        bottom: -150,
      });
      $instruction.text("DON'T HAVE A CODE?<br/>EXIT NOW AND START A NEW RACE");
      $instruction.invisible();
      $this.addChild($instruction);
    }
  }

  //*** Event handlers
  function addListeners() {
    _input.events.add(HydraEvents.UPDATE, inputUpdate);
    _input.events.add(HydraEvents.COMPLETE, formSubmit);
    _input.events.add(HydraEvents.CLICK, inputFocus);
    if (_join) _join.events.add(HydraEvents.CLICK, doneClick);
    if (_exit) _exit.events.add(HydraEvents.CLICK, exitClick);
  }

  function resizeHandler() {
    _this.width = Math.round(
      _size * _config.length + _gap * (_config.length - 1)
    );
    _this.height = _size;

    $this.size(_this.width, _this.height);

    if (_config.text) $this.css({ marginBottom: _gap * 2 });
    if (_code) _code.resize(_size, _gap);
    if (_input) _input.resize(_size);

    if (_config.table) {
      if ($buttons) $buttons.css({ bottom: -_size * 0.2 - 45 });
      if (_join) _join.resize(_size * 2.5, _size * 0.7);
    }

    var width = RacerDevice.width < 330 ? 250 : RacerDevice.width - 100;
    if (width > 330) width = 330;
    if (_width) width = _width;
    var height = Global.TABLE ? width * 0.25 : width * 0.15 + 12;

    if ($buttons && $buttons.css)
      $buttons.css({
        height: height,
        width: width,
        bottom: -height * 1.25,
        left: "50%",
        marginLeft: -width / 2,
      });
    if (_join)
      _join.resize(Global.TABLE ? width : width * 0.6, height, height * 0.3);
    if (_join && _join.css)
      _join.css({
        left: Global.TABLE ? -width * 0.01 : width * 0.4,
        marginLeft: 0,
      });
    if (_exit) _exit.resize(width * 0.35, height, height * 0.32);
    if (_exit && _exit.css) _exit.css({ left: 0, marginLeft: 0 });
    if ($instruction && $instruction.css)
      $instruction.css({
        fontSize: height * 0.2,
        bottom: -height * 2.3,
        letterSpacing: height * 0.02 + "px",
        lineHeight: height * 0.28,
      });
  }

  function autoSumbit(delay) {
    if (_timeout) clearTimeout(_timeout);
    _timeout = setTimeout(formSubmit, delay);
  }

  function inputUpdate(e) {
    if (e) {
      _code.update(e);
      if (_input.code.length == _config.length) {
        if (_join) _join.enable();
        autoSumbit(1000);
      } else {
        if (_config.name && _input && _input.code && _input.code.length > 0)
          autoSumbit(3000);
        if (_join) _join.disable();
        if (!_config.text) $this.stopTween().css({ opacity: 0.75 });
      }
    }
  }

  function inputFocus() {
    if (_config.name) {
      GATracker.trackEvent("clickable_link", "lobby", "Click To Change");
      autoSumbit(3000);
    }
  }

  function reset() {
    if (_input) _input.reset();
    if (_exit && !_exit.visible) _exit.animateIn();
    if (_join && !_join.visible) _this.delayedCall(_join.animateIn, 100);
  }

  function formSubmit(e) {
    if (
      (_input && _input.code && _input.code.length == _config.length) ||
      _config.name
    ) {
      if (_join) _join.click();
      doneClick();
      if (!_config.text && $this.css) $this.css({ opacity: 1 });
    }
  }

  function doneClick(e) {
    if (!_this.clicked) {
      if (RacerDevice.mobile)
        GATracker.trackEvent("clickable_link", "enter_code", "Join");
      else GATracker.trackEvent("clickable_link", "desktop_live", "Join");
      if (_timeout) clearTimeout(_timeout);
      _this.clicked = true;
      if (_input && _input.blur) _input.blur();
      if (!_config.text && $this && $this.tween)
        $this.tween({ opacity: 1 }, 150, "easeOutSine");
      if (_input && (_input.code || _config.name))
        _this.events.fire(HydraEvents.COMPLETE, {
          code: _input.code.toUpperCase(),
        });
    }
  }

  function exitClick() {
    if (RacerDevice.mobile)
      GATracker.trackEvent("clickable_link", "enter_code", "Exit");
    else GATracker.trackEvent("clickable_link", "desktop_live", "Exit");

    if (RacerDevice.mobile) {
      Data.SOCKET.exitLobby();
      _this.events.fire(RacerEvents.REFRESH);
    } else {
      _this.events.fire(RacerEvents.EXIT_DESKTOP);
    }
  }

  //*** Public Methods
  this.enable = function () {
    _this.enabled = true;
    _this.clicked = false;
    if (_input) _input.enable();
  };

  this.disable = function () {
    _this.disabled = false;
    if (_input) _input.disable();
  };

  this.resize = function (size, width) {
    _size = size;
    _gap = Math.round(size / 10);
    if (width) _width = width;
    resizeHandler();
  };

  this.reset = function (error) {
    _this.clicked = false;
    if (_join) _join.disable();
    if (error && _input) _input.showError(error);
    reset();
  };

  this.nameSet = function (code, isMe) {
    $this.visible();
    _code.set(code, isMe);
  };

  this.set = function (syncCode, isHost, noAnim) {
    $this.visible();
    _code.set(syncCode, isHost, noAnim);
    if (_input) {
      _input.set(syncCode);
      _input.disable();
    }

    if ($instruction && $instruction.tween)
      $instruction.tween({ opacity: 0 }, 300, "easeOutSine");
    if (_exit) _exit.animateOut();
    if (_join) _join.animateOut();

    _this.delayedCall(function () {
      if (_join && !_config.keepInput) _join = _join.destroy();
      if (_exit) _exit = _exit.destroy();
      if ($instruction && $instruction.remove) $instruction.remove();
      if ($buttons && $buttons.remove) $buttons.remove();
      if (_input) _input = _input.destroy();

      $instruction = null;
      $buttons = null;
    }, 800);
  };

  this.blur = function () {
    for (var i in _singles) {
      _singles[i].blur();
    }
  };

  this.animateIn = function (syncCode, noAnim) {
    $this.visible();

    if (syncCode && _input) _input.set(syncCode);
    _code.animateIn(syncCode, noAnim);

    if (_config.input && !syncCode) {
      _this.delayedCall(reset, 400);
      if ($instruction && $instruction.visible)
        $instruction
          .visible()
          .css({ opacity: 0 })
          .transform({ y: 10 })
          .tween({ opacity: 1, y: 0 }, 300, "easeOutCubic", 700, function () {
            $instruction.clearTransform().clearAlpha();
          });
      if (_input) _input.animateIn();
      if (_join) _join.disable(true);
    }
  };

  this.animateOut = function (callback) {
    _code.animateOut(function () {
      if (callback) callback();
    });
  };
});
