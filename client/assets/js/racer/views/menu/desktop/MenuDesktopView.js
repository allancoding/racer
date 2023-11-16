Class(function MenuDesktopView() {
  Inherit(this, View);
  var _this = this;
  var $this, $logo;
  var _logo, _chrome, _links, _menu, _join, _random;
  var _active = 0;

  //*** Constructor
  (function () {
    initHTML();
    initViews();
    addListeners();
  })();

  function initHTML() {
    $this = _this.element;
    $this.size("100%").mouseEnabled(false);
  }

  function initViews() {
    $logo = $(".logo");
    $logo
      .size(1000, 275)
      .mouseEnabled(false)
      .css({ left: -463, top: -30, opacity: 0 })
      .bg(Config.PATH + "assets/images/common/logos/racer-large.png")
      .setZ(1);
    $this.addChild($logo);

    _menu = _this.initClass(MenuDesktopViewMenu);
    _chrome = _this.initClass(ChromeExperimentView);
    _chrome.css({ zIndex: 222 });
    __body.addChild(_chrome);
    _links = _this.initClass(LinksView);
    _links.css({ zIndex: 222 });
    __body.addChild(_links);
  }

  //*** Event handlers
  function addListeners() {
    $logo.interact(null, logoClick);
    $logo.hit.css({ width: 180, height: 150, left: 463 }).mouseEnabled(true);
    _menu.events.add(HydraEvents.CLICK, menuClick);
    _this.events.subscribe(RacerEvents.DESKTOP_LIVE, liveClick);
    _this.events.subscribe(RacerEvents.EXIT_DESKTOP, logoClick);
    if (!Device.browser.old) __window.keydown(keyPress);
    else document.onkeydown = keyPress;
  }

  function keyPress(e) {
    var e = e || window.event;
    var c = e.keyCode;
    if (c == 38 && _active > 0) menuClick({ index: _active - 1 });
    if (c == 40 && _active !== -1 && _active < 4)
      menuClick({ index: _active + 1 });
  }

  function menuClick(e) {
    _active = e.index;
    if (e.index > -1) {
      _menu.setActive(e.index);
      if (!Content.instance().visible) Content.instance().animateIn(e.index);
      else Content.instance().scroll(e.index);
    } else {
      Content.instance().animateOut();
      _menu.setActive(-1);
    }
  }

  function liveClick() {
    menuClick({ index: -1 });
  }

  function logoClick(e) {
    menuClick({ index: 0 });
  }

  //*** Public Methods
  this.animateIn = function () {
    _this.delayedCall(Content.instance().show, 500);
    if (!_this.visible) {
      _this.visible = true;
      _chrome.animateIn();
      $logo
        .transform({ y: 10, x: -40 })
        .css({ opacity: 0 })
        .tween(
          { opacity: 1, y: 0, x: 0 },
          500,
          "easeOutCubic",
          400,
          function () {
            $logo.clearTransform();
            $logo.clearAlpha();
          }
        );
      _this.delayedCall(_links.animateIn, 400);
      _this.delayedCall(_menu.animateIn, 500);
    }
  };

  this.fadeOut = function () {};

  this.animateOut = function () {
    _this.visible = false;
  };
});
