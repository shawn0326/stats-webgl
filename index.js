/**
 * The StatsWebGL class.
 * This class is used to collect the statistics of WebGL.
 */
class StatsWebGL {
  constructor() {
    const current = {
      drawCalls: 0,

      drawArrayCalls: 0,
      drawElementsCalls: 0,
      drawArrayInstancedCalls: 0,
      drawElementsInstancedCalls: 0,

      faces: 0,
      vertices: 0,
      points: 0,

      useProgramCalls: 0,
      bindTextureCalls: 0,

      compileShaderCalls: 0,
      uploadTextureCalls: 0,

      cpuCost: 0,
      gpuCost: 0,
    };

    const supportWebGL2 = "WebGL2RenderingContext" in window;
    if (!supportWebGL2) {
      console.error("stats-webgl only support WebGL2 for now, but your browser does not support it.");
    }

    WebGL2RenderingContext.prototype.drawArrays = _h(WebGL2RenderingContext.prototype.drawArrays, function () {
      current.drawArrayCalls++;
      current.drawCalls++;
      if (arguments[0] == this.POINTS) {
        current.points += arguments[2];
      } else {
        current.vertices += arguments[2];
      }
    });

    WebGL2RenderingContext.prototype.drawElements = _h(WebGL2RenderingContext.prototype.drawElements, function () {
      current.drawElementsCalls++;
      current.drawCalls++;
      current.faces += arguments[1] / 3;
      current.vertices += arguments[1];
    });

    WebGL2RenderingContext.prototype.useProgram = _h(WebGL2RenderingContext.prototype.useProgram, function () {
      current.useProgramCalls++;
    });

    WebGL2RenderingContext.prototype.bindTexture = _h(WebGL2RenderingContext.prototype.bindTexture, function () {
      current.bindTextureCalls++;
    });

    WebGL2RenderingContext.prototype.linkProgram = _h(WebGL2RenderingContext.prototype.linkProgram, function () {
      current.compileShaderCalls++;
    });

    WebGL2RenderingContext.prototype.texImage2D = _h(WebGL2RenderingContext.prototype.texImage2D, function () {
      current.uploadTextureCalls++;
    });

    this._current = current;
    this._queryExt = null;
    this._query = null;
    this._queryStatus = 0; // 0: idle, 1: begin, 2: end
    this._supportTimerQuery = true;
  }

  /**
   * Begin to collect the statistics.
   * @param {WebGL2RenderingContext} gl
   */
  begin(gl) {
    const current = this._current;

    // reset the statistics
    current.drawCalls = 0;
    current.drawArrayCalls = 0;
    current.drawElementsCalls = 0;
    current.drawArrayInstancedCalls = 0;
    current.drawElementsInstancedCalls = 0;
    current.faces = 0;
    current.vertices = 0;
    current.points = 0;
    current.useProgramCalls = 0;
    current.bindTextureCalls = 0;
    current.compileShaderCalls = 0;
    current.uploadTextureCalls = 0;
    // because cpuCost and gpuCost are set in end(), so we don't need to reset them here.
    // current.cpuCost = 0;
    // current.gpuCost = 0;

    // mark the cpu begin time

    performance.mark("stats-webgl-begin");

    // mark the gpu end time and calculate the gpu cost

    if (!gl || !this._supportTimerQuery) return;

    if (!this._queryExt) {
      // init timer query extension
      const extension = gl.getExtension("EXT_disjoint_timer_query_webgl2");
      this._supportTimerQuery = !!extension;
      this._queryExt = extension;
      this._query = gl.createQuery();
      return;
    }

    if (this._queryStatus === 0) {
      gl.beginQuery(this._queryExt.TIME_ELAPSED_EXT, this._query);
      this._queryStatus = 1;
    }
  }

  /**
   * End to collect the statistics.
   * @param {WebGL2RenderingContext} gl
   */
  end(gl) {
    const current = this._current;

    // mark the cpu end time and calculate the cpu cost

    performance.mark("stats-webgl-end");
    const cpuMeasure = performance.measure("stats-webgl-duration", "stats-webgl-begin", "stats-webgl-end");
    current.cpuCost = cpuMeasure.duration;

    // mark the gpu end time and calculate the gpu cost

    if (this._queryStatus === 1) {
      gl.endQuery(this._queryExt.TIME_ELAPSED_EXT);
      this._queryStatus = 2;
    } else if (this._queryStatus === 2) {
      if (gl.getQueryParameter(this._query, gl.QUERY_RESULT_AVAILABLE)) {
        const ns = gl.getQueryParameter(this._query, gl.QUERY_RESULT);
        const ms = ns * 1e-6;
        current.gpuCost = ms;
        this._queryStatus = 0;
      }
    }
  }

  /**
   * Get the current statistics.
   */
  getCurrent() {
    return this._current;
  }
}

function _h(f, c) {
  return function () {
    c.apply(this, arguments);
    f.apply(this, arguments);
  };
}

// export the StatsWebGL instance
export default new StatsWebGL();
