'use strict';

var App = (function() {
  function App(options) {
    var defaults = {
      speedRange: [0.0, 1.0]
    };
    this.opt = $.extend({}, defaults, options);
    this.init();
  }

  App.prototype.init = function(){
    var _this = this;

    this.globe = new Globe({el: "#globe"});
    this.orbit = new Orbit({el: "#orbit"});
    this.label = new Label({el: "#label"});
    this.annotations = new Annotations({el: "#annotations", dataKey: "netrad"});

    // Initialize controls
    var sliders = {
      "#tt-speed": {
        orientation: "horizontal", min: 0, max: 1, step: 0.01, value: 0.25,
        slide: function(e, ui){ _this.onSpeed(ui.value); }
      }
    };
    var controls = new Controls({sliders: sliders});

    this.onSpeed(0.25);
    this.render();
    this.loadListeners();
  };

  App.prototype.loadListeners = function(){
    var _this = this;

    $(window).on('resize', function(e){
      _this.globe.onResize();
      _this.orbit.onResize();
    });
  };

  App.prototype.onSpeed = function(value) {
    var r = this.opt.speedRange;
    this.speed = UTIL.lerp(r[0], r[1], value);
    this.globe.setSpeed(this.speed);
  };

  App.prototype.render = function(){
    var _this = this;
    var progress = this.globe.getProgress();

    this.globe.isLoaded() && this.globe.render(progress);
    this.orbit.isLoaded() && this.orbit.render(progress);
    this.label.render(progress);

    if (this.globe.isLoaded()) {
      var angle = this.globe.getRotationAngle();
      this.annotations.render(progress, angle);
    }

    requestAnimationFrame(function(){
      _this.render();
    });
  }

  return App;

})();

$(function() {
  var app = new App(CONFIG);
});
