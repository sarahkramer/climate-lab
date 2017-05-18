'use strict';

var App = (function() {
  function App(options) {
    var defaults = {
      enableSound: true,
      simplifyTolerance: 1
    };
    this.opt = $.extend({}, defaults, options);
    this.init();
  }

  App.prototype.init = function(){
    var _this = this;

    // Initialize controls
    var sliders = {
      "#tt-speed": {
        orientation: "horizontal", min: 0, max: 1, step: 0.001, value: 0,
        start: function( event, ui ) { _this.transitioning = true; },
        slide: function(e, ui){ _this.onSpeed(ui.value); },
        stop: function( event, ui ) { _this.transitioning = false; }
      },
      "#tt-scale": {
        orientation: "horizontal", min: 0, max: 1, step: 0.001, value: 1,
        start: function( event, ui ) { _this.transitioning = true; },
        slide: function(e, ui){ _this.onScale(ui.value); },
        stop: function( event, ui ) { _this.transitioning = false; }
      }
    };
    var controls = new Controls({sliders: sliders});

    // Set initial speed and scale
    this.speed = 0;
    this.scale = 1.0;
    this.dataKey = "co2";
    this.onSpeed(this.speed);

    // Initialize viz and spinners
    this.viz = new DataViz({el: "#pane", enableSound: this.opt.enableSound});
    this.spinner = new Spinner({el: "#spinner"});

    this.loadData();
  };

  App.prototype.loadData = function(){
    var _this = this;

    $.getJSON(this.opt.dataURL, function(data) {
      console.log('Data loaded.');
      _this.onDataLoaded(data);
    });
  };

  App.prototype.onDataLoaded = function(data){
    var d = data[this.dataKey];

    this.data = d.data;
    this.minDomain = d.minDomain;
    this.maxDomain = d.maxDomain;

    var minRange = d.minRange[1] - d.minRange[0];
    var maxRange = d.maxRange[1] - d.maxRange[0];
    this.viz.setRangeMinMax(minRange, maxRange);

    this.onScale(this.scale);
    this.render();
  };

  App.prototype.onScale = function(value) {
    value = UTIL.easeInOutCubic(value);
    var d0 = UTIL.lerp(this.maxDomain[0], this.minDomain[0], value);
    var d1 = UTIL.lerp(this.maxDomain[1], this.minDomain[1], value);
    var domain = [d0, d1];

    var filtered = _.filter(this.data, function(d){ return d[0] >= d0 && d[1] <= d1; });
    var mapped = _.map(filtered, function(d){ return {x: d[0], y: d[1]}; });
    var simplified = mapped;
    if (mapped.length > 365) simplified = simplify(mapped, this.opt.simplifyTolerance);
    var values = _.pluck(simplified, 'y');
    var range = [_.min(values), _.max(values)];

    this.startDate = Date.now();
    this.viz.update(simplified, domain, range);
  };

  App.prototype.onSpeed = function(value) {
    var r = this.opt.durationRange;
    this.duration = UTIL.lerp(r[0], r[1], value);
    this.startDate = Date.now();
  };

  App.prototype.render = function(){
    var _this = this;

    if (this.startDate==undefined) {
      this.startDate = Date.now();
    }
    var d = Date.now();
    var elapsed = d - this.startDate;
    var hold = this.opt.durationHold;
    var dur = this.duration + hold;
    var nonHold = this.duration / dur;
    var progress = elapsed % dur / dur;

    // logic for determining if we should hold the last note
    if (progress >= nonHold) {
      progress = 1.0;
    } else {
      progress = UTIL.norm(progress, 0, nonHold);
    }

    if (this.transitioning) {
      this.viz.renderProgress(0);
    } else {
      this.viz.renderProgress(progress);
    }

    // this.spinner.render(progress);
  	requestAnimationFrame(function(){ _this.render(); });
  };

  return App;

})();

$(function() {
  var app = new App(CONFIG);
});
