Class(function Cover() {
  Inherit(this, View);
  var _this = this;
  var $this, $title, $text;

  //*** Constructor
  (function () {
    initHTML();
    initText();
    addListeners();
    resizeHandler();
  })();

  function initHTML() {
    $this = _this.element;
    $this.size("100%").bg(Config.BG).setZ(222);
    $this.hide();
    $this.mouseEnabled(false);
    __body.addChild($this);
  }

  function initText() {
    $title = $(".ready");
    $title.fontStyle("AvantGarde-BoldObl", 20, "#fff");
    $title.css({
      width: "100%",
      textAlign: "center",
      whiteSpace: "nowrap",
      top: "50%",
    });
    $title.text("WOAH THERE!");
    $this.addChild($title);

    $text = $(".text");
    $text.fontStyle("AvantGarde", 12, "#fff");
    $text.css({
      width: "100%",
      textAlign: "center",
      top: "50%",
      whiteSpace: "nowrap",
    });
    $text.text(
      "You can only race right-side up,<br/>Please rotate your device to continue.".toUpperCase()
    );
    $this.addChild($text);
  }

  function setFontSize() {
    var check =
      window.innerHeight * 1.5 > window.innerWidth
        ? window.innerWidth
        : window.innerHeight * 1.5;

    $title.fSize = check / 20 + 30;
    if ($title.fSize < 20) $title.fSize = 20;
    $title.css({
      fontSize: $title.fSize,
      marginTop: -$title.fSize * 1.1,
      left: -$title.fSize * 0.1,
    });

    $text.fSize = check / 40;
    if ($text.fSize < 9) $text.fSize = 9;
    $text.css({
      fontSize: $text.fSize,
      marginTop: $text.fSize * 0.4,
      letterSpacing: $text.fSize / 8 + "px",
      lineHeight: $text.fSize * 1.6 - 2,
    });
  }

  //*** Event handlers
  function addListeners() {
    _this.events.subscribe(RacerEvents.RESIZE, resizeHandler);
  }

  function resizeHandler() {
    setFontSize();
    if (window.innerHeight < window.innerWidth && !RacerDevice.isKeyboard)
      show();
    else hide();
  }

  function show() {
    if (Global.LOADED) SCSound.send("error");
    $this.show();
    _this.events.fire(HydraEvents.BROWSER_FOCUS, { type: "blur" });
  }

  function hide() {
    $this.hide();
  }
}, "Singleton");
