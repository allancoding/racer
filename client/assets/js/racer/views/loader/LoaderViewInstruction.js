Class(function LoaderViewInstruction(_config) {
  Inherit(this, View);
  var _this = this;
  var $this, $overlay, $line, $text;

  //*** Constructor
  (function () {
    initHTML();
    setTimeout(positionText, 150);
  })();

  function initHTML() {
    $this = _this.element;
    $this.css({
      width: "100%",
      height: 20,
      top: "45%",
      left: 0,
      overflow: "hidden",
    });
    $this.invisible();
    $this.transform({ skewY: -15 });

    $overlay = $(".overlay");
    $overlay.size("100%").bg(Config.BG).setZ(100);
    $overlay.invisible();
    $this.addChild($overlay);

    $line = $(".line");
    $line.css({ width: "100%", height: 3 }).bg(_config.color);
    $this.addChild($line);

    $text = $(".text");
    $text.fontStyle("AvantGarde", 20, "#fff");
    $text.css({ fontWeight: "bold", whiteSpace: "nowrap" });
    $text.bg(Config.BG);
    $text.text(_config.text);
    $this.addChild($text);
  }

  function positionText() {
    var fontSize = window.innerWidth / 22;
    if (fontSize > 24) fontSize = 24;
    if (fontSize < 11) fontSize = 11;
    $text.css({
      fontSize: fontSize,
      paddingLeft: 7,
      letterSpacing: fontSize * 0.05 + "px",
    });
    $text.width = $text.div.offsetWidth;
    $text.css({
      textAlign: "left",
      width: $text.width,
      left: "50%",
      marginLeft: -fontSize * 7,
    });
    $line.css({ top: fontSize * 0.4 });

    $this.css({
      marginTop: fontSize * 1.3 * _config.index - fontSize * 3.9,
      height: fontSize,
    });
  }

  //*** Public Methods
  this.animateIn = function () {
    $this.visible();
    $line
      .transform({ x: -window.innerWidth })
      .tween({ x: 0 }, 400, "easeOutCubic");
    $text
      .transform({ x: -window.innerWidth })
      .tween({ x: 0 }, 500, "easeOutQuint", 300);
  };

  this.fade = function (callback) {
    $overlay
      .visible()
      .css({ opacity: 0 })
      .tween({ opacity: 0.5 }, 300, "easeOutSine", function () {
        if (callback) callback();
      });
  };

  this.animateOut = function (callback) {
    $line.tween({ x: window.innerWidth }, 400, "easeInCubic");
    $text.tween({ x: window.innerWidth }, 400, "easeInQuart", 150, function () {
      //$this.hide();
      if (callback) callback();
    });
  };
});
