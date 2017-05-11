'use strict';

var Sound = (function() {
  function Sound(options) {
    var defaults = {
      frequency: [60, 2000]
    };
    this.opt = $.extend({}, defaults, options);
    this.init();
  }

  Sound.prototype.init = function(){
    this.started = false;
    this.osc = new Tone.Oscillator({
			"frequency" : 440,
			"volume" : -10
		}).toMaster();

    this.frequency = this.opt.frequency[0];
  };

  Sound.prototype.change = function(percent){
    var ff = this.opt.frequency;
    var f = Math.round(UTIL.lerp(ff[0], ff[1], percent));
    if (f!=this.frequency) {
      this.frequency = f;
      this.osc.frequency.value = f;
    }
  };

  Sound.prototype.end = function(){
    Tone.Master.volume.rampTo(-Infinity, 0.05);
  };

  Sound.prototype.start = function(){
    if (!this.started) {
      this.started = true;
      this.osc.start();
    }
  	Tone.Master.volume.rampTo(0, 0.05);
  };

  return Sound;

})();