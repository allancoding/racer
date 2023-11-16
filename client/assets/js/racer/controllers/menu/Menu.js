Class(function Menu() {
  Inherit(this, Controller);
  var _this = this;
  var $container;
  var _view;

  //*** Constructor
  (function () {
    initContainer();
    initView();
    addListeners();
  })();

  function initContainer() {
    $container = _this.container;
    $container.size("100%").setZ(1);
    if (!RacerDevice.mobile)
      $container.size(350, 300).setZ(333).mouseEnabled(false);
  }

  function initView() {
    _view = _this.initClass(
      Global.TABLE_MOBILE
        ? MenuTableView
        : RacerDevice.mobile
        ? MenuMobileView
        : MenuDesktopView
    );
  }

  //*** Event handlers
  function addListeners() {
    _this.events.bubble(_view, HydraEvents.COMPLETE);
  }

  //*** Public Methods
  this.animateIn = function () {
    _view.animateIn();
  };

  this.fadeOut = function () {
    _view.fadeOut();
  };

  this.animateOut = function (callback) {
    _view.animateOut(callback);
  };
});
