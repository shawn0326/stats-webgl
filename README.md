# stats-webgl

[![npm version](https://badge.fury.io/js/stats-webgl.svg)](https://badge.fury.io/js/stats-webgl)

A pure webgl stats. now only support webgl2.

Features:

- draw calls
- shader compiling and texture uploading collecting
- use EXT_disjoint_timer_query to collect gpu cost

## Install

Npm:

```bash
npm install --save stats-webgl
```

CDN:

* unpkg.com/stats-webgl/dist/stats-webgl.js

## Usage

Call `stats.begin(gl)` before your render code, and call `stats.end(gl)` after your render code. Use `stats.getCurrent()` to get current stats info.

```js
function animation() {
  stats.begin(gl);
  // do some render thing
  stats.end(gl);

  // get current stats info
  const currentStatsInfo = stats.getCurrent();

  requestAnimationFrame(animation);
}
```

Here is the stats info looks like:

```js
{
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
    // if gpuCost is 0, 
    // it means your browser doesn't support EXT_disjoint_timer_query
    gpuCost: 0, 
}
```

