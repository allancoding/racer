Class(function LobbyCodeViewCode(_config) {
  Inherit(this, View);
  var _this = this;
  var $this, $share, $overlay;
  var _singles;
  var _size, _gap;

  //*** Constructor
  (function () {
    initHTML();
    initCode();
  })();

  function initHTML() {
    $this = _this.element;
    $this.size("100%").css({ webkitBackfaceVisibility: "hidden" });

    $overlay = $(".overlay");
    $overlay.size("100%").bg(Config.BG).setZ(222);
    $overlay.invisible();
    $this.addChild($overlay);
  }

  function initCode() {
    _singles = new Array();
    for (var i = 0; i < _config.length; i++) {
      var single = _this.initClass(LobbyCodeViewCodeSingle, {
        border: _config.border,
        size: 10,
        index: Number(i),
        set: "",
        name: _config.name,
        input: _config.input,
      });
      _singles.push(single);
    }
    _this.singles = _singles;
  }

  //*** Event handlers
  function resizeHandler() {
    for (var i = 0; i < _singles.length; i++) {
      _singles[i].resize(_size);
      var offset = _config.name ? _size * 0.5 + _gap : _size + _gap;
      _singles[i].css({ left: i * offset, top: 0 });
    }
  }

  //*** Public Methods
  this.resize = function (size, gap) {
    _size = size;
    _gap = gap;
    resizeHandler();
  };

  this.update = function (e) {
    var input = e.code.split("");
    for (var i = 0; i < _singles.length; i++) {
      var code = input[i] || "";
      var isEnd =
        i == _singles.length - 1 && i == input.length - 1 ? true : false;
      _singles[i].change(code);
      if (i == input.length && e.blink) _singles[i].focus();
      else _singles[i].blur(isEnd);
    }
  };

  this.set = function (code, isHost, noAnim, keepBorder) {
    if (!code) return false;
    var split = code.split("");
    for (var i = 0; i < split.length; i++) {
      _singles[i].set(split[i], i, isHost, noAnim, keepBorder);
    }
  };

  this.animateIn = function (code, noAnim) {
    if (_this.overlayed) {
      $overlay.tween({ opacity: 0 }, 300, "easeOutSine");
    } else if (noAnim) {
    } else {
      for (var i = 0; i < _singles.length; i++) {
        var singleCode = code && code.split("")[i] ? code.split("")[i] : null;
        _this.delayedCall(_singles[i].animateIn, i * 50 + 100, singleCode);
      }
    }
  };

  this.animateOut = function (callback) {
    _this.overlayed = true;
    $overlay
      .visible()
      .css({ opacity: 0 })
      .tween({ opacity: 1 }, 300, "easeOutSine", 100, function () {
        if (callback) callback();
      });
  };
});
