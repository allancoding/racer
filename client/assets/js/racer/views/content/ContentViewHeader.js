Class(function ContentViewHeader() {
  Inherit(this, View);
  var _this = this;
  var $this, $wrapper, $image, $title, $text;

  //*** Constructor
  (function () {
    initHTML();
    initImage();
    initLine();
    initTitle();
    initText();
    addListeners();
    resizeHandler();
  })();

  function initHTML() {
    $this = _this.element;
    $this.css({
      display: "block",
      position: "relative",
      height: 600,
      width: "100%",
      marginTop: 120,
      marginBottom: window.innerHeight / 4,
    });

    $wrapper = $(".wrapper");
    $wrapper.css({ width: 680, left: "50%", marginLeft: -340 });
    $this.addChild($wrapper);
    _this.wrapper = $wrapper;
  }

  function initImage() {
    $image = $(".image");
    $image
      .size(600, 400)
      .css({ position: "relative", margin: "0 auto" })
      .bg(Config.PATH + "assets/images/content/hands.jpg");
    $wrapper.addChild($image);
  }

  function initLine() {
    $line = $(".line");
    $line
      .size(680, 1)
      .css({ position: "relative", background: "rgba(255,255,255,0.2)" });
    $wrapper.addChild($line);
  }

  function initTitle() {
    var fontSize = 48;
    $title = $(".title");
    $title.fontStyle("AvantGarde-BoldObl", fontSize, "#999");
    $title.css({
      display: "block",
      marginTop: 30,
      position: "relative",
      width: "100%",
      whiteSpace: "nowrap",
      textAlign: "center",
    });
    //$title.text('VISIT <br><span>'+(window.location.port != '' ? window.location.protocol+"//"+window.location.hostname+":"+window.location.port : window.location.protocol+"//"+window.location.hostname)+'/racer</span> ON<br/>YOUR PHONE OR TABLET');
    $wrapper.addChild($title);
  }

  function initText() {
    $text = $(".title");
    $text.fontStyle("AvantGarde", 17, "#999");
    $text.css({
      display: "block",
      marginTop: 20,
      position: "relative",
      width: "100%",
      lineHeight: 21,
      whiteSpace: "nowrap",
      textAlign: "center",
    });
    $text.text("Scroll down to take a look under the hood. ");
    $wrapper.addChild($text);
  }

  //*** Event handlers
  function addListeners() {
    _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
  }

  function resizeHandler() {
    var scale = window.innerHeight < 840 ? window.innerHeight / 840 : 1;
    if (scale < 0.5) scale = 0.5;
    $this.css({ marginTop: 120 * scale, height: 200 + 400 * scale });
    $image.size(600 * scale, 400 * scale);
    var fontSize = 24 + 24 * scale;
    $title.css({
      fontSize: fontSize,
      marginTop: 30 * scale,
      lineHeight: fontSize * 1.1,
      textShadow: fontSize * 0.08 + "px " + fontSize * 0.08 + "px #444",
      letterSpacing: fontSize / 20 + "px",
    });
    $text.css({ marginTop: 20 * scale });
  }

  //*** Public Methods
  this.attach = function () {};

  this.detach = function () {};
});
