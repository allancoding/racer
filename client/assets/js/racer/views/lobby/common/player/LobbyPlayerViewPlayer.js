Class(function LobbyPlayerViewPlayer(_index) {
  Inherit(this, View);
  var _this = this;
  var $this,
    $overlay,
    $wrapper,
    $border,
    $bg,
    $result,
    $resultBehind,
    $place,
    $time,
    $remove;
  var _letters, _name, _you;
  var _width = 200,
    _height = 40;
  var _data = new Object();
  var _time, _position;

  _this.color = 0;

  //*** Constructor
  (function () {
    initHTML();
    initWrapper();
    initBorder();
    initBG();
    initName();
    initYou();
    initPlace();
    initTime();
    initRemove();
    addListeners();
  })();

  function initHTML() {
    $this = _this.element;
    $this
      .size("100%", _height)
      .css({ webkitBackfaceVisibility: "hidden" })
      .setZ(1);
    if (!Global.RESULTS) $this.hide();
  }

  function initWrapper() {
    $wrapper = $(".wrapper");
    $wrapper
      .size("100%")
      .css({ borderRadius: 2, top: 0, left: 0 })
      .bg("#2a2a2a")
      .setZ(2);
    $wrapper.hide();
    $this.addChild($wrapper);

    if (RacerDevice.mobile) {
      $overlay = $(".overlay");
      $overlay.size("100%").bg(Config.BG).setZ(30);
      $overlay.mouseEnabled(false);
      $overlay.hide();
      $wrapper.addChild($overlay);
    }

    $wrapper.inner = $(".inner");
    $wrapper.inner.size("100%").css({ top: 0, left: 0, opacity: 0 }).setZ(1);
    $wrapper.inner.hide();
    $wrapper.addChild($wrapper.inner);
  }

  function initBorder() {
    $border = $(".border");
    $border.css({ top: 0, left: 0, borderRadius: 2, opacity: 0 }).setZ(10);
    $border.hide();
    $wrapper.inner.addChild($border);
  }

  function initBG() {
    $bg = $(".bg");
    $bg.size("100%").css({ top: 0, borderRadius: 2, left: 0 });
    $wrapper.inner.addChild($bg);
  }

  function initName() {
    _name = _this.initClass(LobbyCodeView, {
      border: false,
      length: 3,
      text: false,
      input: RacerDevice.mobile,
      keepInput: true,
      name: true,
    });
    _name.nameSet("???");
    $wrapper.addChild(_name);
  }

  function initYou() {
    _you = _this.initClass(LobbyPlayerViewPlayerYou, { index: _index });
    $wrapper.addChild(_you);
  }

  function initPlace() {
    $place = $(".place");
    $place.fontStyle("AvantGarde", 20, "#fff");
    $place.css({ width: "100%", overflow: "visible", opacity: 0 }).setZ(11);
    $wrapper.inner.addChild($place);

    $result = $(".result");
    $result.setZ(11);
    $result.place = -2;
    $wrapper.inner.addChild($result);

    $resultBehind = $(".result");
    $resultBehind.css({ opacity: 0.6 }).setZ(1);
    $this.addChild($resultBehind);
  }

  function initTime() {
    $time = $(".time");
    $time.fontStyle("AvantGarde", 20, "#fff");
    $time
      .css({
        textAlign: "right",
        fontWeight: "bold",
        overflow: "visible",
        right: 10,
        width: "100%",
        opacity: 0,
      })
      .setZ(11);
    $wrapper.inner.addChild($time);
  }

  function initRemove() {
    $remove = $(".remove");
    $remove
      .size("100%")
      .css({
        overflow: "hidden",
        borderRadius: 2,
        display: "block",
        boxShadow: "0 0 3px #000",
      })
      .setZ(222);
    $remove.hide();

    $remove.back = $(".remove");
    $remove.back.size("100%").bg("#777").css({ borderRadius: 2 });
    $remove.addChild($remove.back);

    $remove.inner = $(".text");
    $remove.inner.fontStyle("AvantGarde", 20, "#fff");
    $remove.inner.css({ fontWeight: "bold" });
    $remove.inner.setZ(11);
    $remove.inner.text("REMOVE PLAYER");
    $remove.addChild($remove.inner);

    $remove.close = $(".close");
    $remove.close
      .size(160, 160)
      .bg(Config.PATH + "assets/images/common/close.png");
    $remove.close.setZ(222);
    $remove.addChild($remove.close);

    $wrapper.addChild($remove);
  }

  //*** Event handlers
  function addListeners() {
    _name.events.add(HydraEvents.COMPLETE, nameChange);
    $this.click(touchSwiped);
    if (RacerDevice.mobile) {
      $this.touchSwipe(touchSwiped);
      $remove.close.interact(null, removeClick);
    }
  }

  function nameChange(e) {
    var code = e.code || "";
    var isSwear = Data.CONFIG.swearFilter(code);
    if (!isSwear && code.length == 3) Data.SOCKET.editPlayer(code);
    else _name.nameSet(_this.data.name, _this.data.me);
    _this.delayedCall(_name.enable, 500);
  }

  function resizeHandler() {
    $this.css({ width: _width, height: _height });

    $border.setWidth = Math.round(_height / 11) + 1;
    if (_this.data && _this.data.me) {
      $border.size(
        _width - $border.setWidth * 2,
        _height - $border.setWidth * 2
      );
      var color = Config.COLORS[_this.data.color];
      $border.css({
        boxShadow: "0 0 " + $border.setWidth * 4 + "px " + color,
        border: $border.setWidth + "px solid rgba(255,255,255,0.15)",
      });
    }

    _name.resize(_height);
    _name.css({
      top: 0,
      left: Global.RESULTS ? _height * 1.5 : $border.setWidth * 2.5,
    });

    if (_you) {
      _you.css({
        left:
          (Global.RESULTS ? _height * 3.3 : _height * 2) + $border.setWidth * 4,
      });
      _you.scale = _height < 60 ? _height / 60 : 1;
      _you.element.transform({ scale: _you.scale });
    }

    if ($result)
      $result
        .size(_height * 0.8, _height * 0.528)
        .css({
          left: $border.setWidth * 3,
          top: _height * 0.5 - _height * 0.25,
        });
    if ($resultBehind && $resultBehind.size)
      $resultBehind
        .size(_height * 0.8, _height * 0.528)
        .css({
          left: $border.setWidth * 3,
          top: _height * 0.5 - _height * 0.264,
        });

    var fontSize = _height * 0.35;
    if (fontSize < 13) fontSize = 13;
    if ($place)
      $place.css({
        left: _height * 3.3 + $border.setWidth * 4,
        fontSize: fontSize,
        top: _height * 0.5 - fontSize * 0.42,
        letterSpacing: fontSize * 0.065 + "px",
      });
    if ($time)
      $time.css({
        right: _height * 0.45 - 2,
        fontSize: fontSize * 0.88,
        top: _height * 0.5 - fontSize * 0.36,
        letterSpacing: fontSize * 0.065 + "px",
      });
    if ($remove.inner)
      $remove.inner.css({
        left: _height * 1.2,
        fontSize: fontSize * 0.88,
        top: _height * 0.5 - fontSize * 0.37,
        letterSpacing: fontSize * 0.06 + "px",
      });
    if ($remove.close)
      $remove.close
        .size(_height * 0.6, _height * 0.6)
        .css({ top: _height * 0.22, left: _height * 0.22 });
  }

  function setStyle(noAnim) {
    var gradient = RacerUtil.gradient(
      _this.data.gradient[0],
      _this.data.gradient[1],
      _this.data.gradient[2]
    );
    if (_this.data.me) {
      Global.COLOR = _this.data.gradient[1];
      Global.COLOR_INDEX = _this.data.color;
      Global.GRADIENT = gradient;
    }

    $bg.gradient = gradient;
    $bg.css({ background: gradient });
    _name.nameSet(_this.data.name, _this.data.me);

    if (_this.data.me) {
      if (_you) _you.animateIn();
      if (Global.LOBBY_WAITING) {
        $place.invisible();
        $time.invisible();
      }
      $this.setZ(3);
      _name.enable();
      if (noAnim) {
        $border.show().tween({ opacity: 1 }, 300, "easeOutSine");
        if ($overlay)
          $overlay.tween({ opacity: 0 }, 300, "easeOutSine", $overlay.hide);
      } else {
        $border.stopTween().show().css({ opacity: 1 });
        if ($overlay) $overlay.stopTween().hide();
      }
    } else {
      if (_you) _you.animateOut();
      if ($place) $place.visible();
      if ($time) $time.visible();
      $this.setZ(2);
      _name.disable();

      if (noAnim) {
        $border.tween({ opacity: 0 }, 300, "easeOutSine", $border.hide);
        if ($overlay)
          $overlay
            .stopTween()
            .show()
            .tween({ opacity: 0.4 }, 300, "easeOutSine");
      } else {
        $border.stopTween().hide();
        if ($overlay) $overlay.stopTween().show().css({ opacity: 0.4 });
      }
    }

    if (Global.RESULTS) {
      $result.show();
      if ($resultBehind && $resultBehind.hide) $resultBehind.show();
      $place.hide();
      if (_this.data.placement) {
        $time
          .text(_this.data.placement.lap_time)
          .css({ fontWeight: "bold" })
          .show()
          .clearAlpha();
        if ($result) {
          if ($result.place !== _this.data.placement.place)
            $result.bg(
              Config.PATH +
                "assets/images/common/places/" +
                _this.data.placement.place +
                ".png"
            );
          $result.place = _this.data.placement.place;
        }
        if ($resultBehind && $resultBehind.bg)
          $resultBehind
            .bg(
              Config.PATH +
                "assets/images/common/places/" +
                _this.data.placement.place +
                ".png"
            )
            .css({ opacity: 0.9 - _this.data.placement.place * 0.15 });
      } else {
        $time.hide().text("");
        if ($result) {
          if ($result.place !== -1)
            $result.bg(Config.PATH + "assets/images/common/places/empty.png");
          $result.place = -1;
        }
        if ($resultBehind && $resultBehind.bg)
          $resultBehind.bg(
            Config.PATH + "assets/images/common/places/empty.png"
          );
      }
    } else {
      if ($result) $result.hide();
      if ($resultBehind && $resultBehind.hide) $resultBehind.hide();
      if (_this.data.placement) {
        $time
          .text(_this.data.placement.lap_time)
          .css({ fontWeight: "bold" })
          .show()
          .clearAlpha();
        $place
          .text(RacerUtil.formatPlaceWord(_this.data.placement.place))
          .css({ fontWeight: "bold" })
          .show()
          .clearAlpha();
      } else {
        $time.hide().text("");
        $place.hide().text("");
      }
    }

    resizeHandler();
  }

  function touchSwiped(e) {
    if (e.direction && _this.active && !_this.data.me && Global.ISHOST) {
      var isLeft = e.direction == "left" ? true : false;
      if (!_this.removing) showRemove(isLeft);
      else hideRemove(isLeft);
    }
  }

  function showRemove(left) {
    _this.events.fire(RacerEvents.REMOVING_PLAYER, { index: _index });
    _this.removing = true;
    $remove.show();
    $remove.inner
      .transform({ x: left ? 10 : -10 })
      .css({ opacity: 0 })
      .tween(
        { opacity: 1, x: 0 },
        300,
        "easeOutCubic",
        left ? 200 : 0,
        $remove.inner.clearTransform
      );
    $remove.close
      .transform({ scale: 0.7 })
      .css({ opacity: 0 })
      .tween(
        { scale: 1, opacity: 1 },
        300,
        "easeOutCubic",
        left ? 200 : 0,
        $remove.close.clearTransform
      );
    $remove.back
      .transform({ x: left ? _width : -_width })
      .tween({ x: 0 }, 400, "easeOutCubic", $remove.back.clearTransform);
  }

  function hideRemove(left) {
    _this.removing = false;
    $remove.inner.tween({ opacity: 0 }, 150, "easeOutSine");
    $remove.close.tween({ opacity: 0 }, 150, "easeOutSine");
    $remove.back.tween({ x: left ? -_width : _width }, 300, "easeOutCubic");
    _this.delayedCall(function () {
      if (!_this.removing) {
        $remove.hide();
      }
    }, 350);
  }

  function removeClick() {
    _this.events.fire(RacerEvents.REMOVED_PLAYER, { index: _this.data.index });
    _name.nameSet("???");
    $wrapper.inner.hide();
    $remove.hide();
    $wrapper.inner.hide().stopTween();
    $border.stopTween().show().css({ opacity: 1 });
    _this.removing = false;
    _this.active = false;
    Data.SOCKET.removePlayer(_this.data.index);
  }

  //*** Public Methods
  this.hideRemove = hideRemove;

  this.resize = function (width, height) {
    _height = height;
    _width = width;
    resizeHandler();
  };

  this.fadeOut = function () {
    _name.nameSet("???");
    $wrapper.inner.tween({ opacity: 0 }, 200, "easeOutSine", function () {
      $wrapper.inner.hide().stopTween();
      $border.stopTween().show().css({ opacity: 1 });
      if ($overlay) $overlay.stopTween().hide();
    });
  };

  this.fadeIn = function () {
    $wrapper.inner
      .show()
      .css({ opacity: 0 })
      .tween({ opacity: 1 }, 200, "easeOutSine", function () {
        $wrapper.inner.stopTween().clearAlpha();
      });
  };

  this.activate = function () {
    $this.clearTransform().stopTween().setZ(2).mouseEnabled(true);
    $wrapper.inner.stopTween().show().clearAlpha();

    if (_you) _you.activate();
    _name.element.mouseEnabled(true);

    _this.active = true;
  };

  this.deactivate = function () {
    $this.clearTransform().stopTween().setZ(1).mouseEnabled(false);
    $wrapper.inner.stopTween().hide();
    $border.stopTween().show().css({ opacity: 1 });
    if ($overlay) $overlay.stopTween().hide();

    if (_you) _you.deactivate();
    _name.nameSet("???");
    _name.element.mouseEnabled(false);
    if (_this.removing) hideRemove();
    _this.active = false;
  };

  this.setText = function (time, position) {
    _this.isSet = true;
    if ($time)
      $time
        .text(time)
        .css({ fontWeight: "bold" })
        .tween({ opacity: 1 }, 300, "easeOutSine");
    if ($place)
      $place
        .text(position)
        .css({ fontWeight: "bold" })
        .tween({ opacity: 1 }, 300, "easeOutSine");
  };

  this.updateTime = function (time) {
    if (!_time)
      $time
        .css({ fontWeight: "bold" })
        .tween({ opacity: 0.7 }, 300, "easeOutSine");
    _time = time;
    $time.show().text(time);
  };

  this.updatePosition = function (position) {
    if (!_position)
      $place
        .css({ fontWeight: "normal" })
        .tween({ opacity: 0.7 }, 300, "easeOutSine");
    _position = position;
    if ($place) $place.show().text(position);
  };

  this.update = function (e) {
    _this.data = e;
    if (_this.active) {
      if (_this.removing) hideRemove(true);
      setStyle();
    }
  };

  this.animateIn = function () {
    _this.visible = true;
    $this.show();
    resizeHandler();
    //if (_this.active && !(_this.data &&_this.data.name) && _name) _this.delayedCall(_name.animateIn, 500);
    $wrapper.show();

    if (
      _this.data &&
      (_this.data.placement || (Global.RESULTS && _this.data.name))
    ) {
      $wrapper
        .transform({ x: _width / 5 })
        .css({ opacity: 0 })
        .tween({ opacity: 1, x: 0 }, 400, "easeOutCubic");
    } else {
      $wrapper
        .transform({ y: _height / 3 })
        .css({ opacity: 0 })
        .tween({ opacity: 1, y: 0 }, 400, "easeOutCubic");
    }

    _this.delayedCall(function () {
      if ($resultBehind) {
        $resultBehind.remove();
        $resultBehind = null;
      }
    }, 500);
  };

  this.animateOut = function () {
    _this.visible = false;
    if (RacerDevice.animate)
      $wrapper.tween(
        { y: -_height / 3, opacity: 0 },
        300,
        "easeInCubic",
        $this.hide
      );
  };
});
