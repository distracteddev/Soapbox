/*
 * Copyright (c) 2012 Dmitri Melikyan
 *
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the 
 * "Software"), to deal in the Software without restriction, including 
 * without limitation the rights to use, copy, modify, merge, publish, 
 * distribute, sublicense, and/or sell copies of the Software, and to permit 
 * persons to whom the Software is furnished to do so, subject to the 
 * following conditions:
 * 
 * The above copyright notice and this permission notice shall be included 
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN 
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR 
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


var os = require('os');


var nt;
var supported = false;
var active = false;

exports.init = function() {
  nt = global.nodetime;

  if(nt.timekit && nt.timekit.startV8Profiler) {
    supported = true;
  }
}


exports.start = function(seconds) {
  if(!supported || active) return;
  active = true;

  seconds || (seconds = 10);

  nt.timekit.startV8Profiler();
  nt.message("V8 profiler started");

  // stop v8 profiler automatically after 10 seconds
  setTimeout(function() {
    exports.stop();
  }, seconds * 1000);
};


exports.stop = function() {
  if(!supported || !active) return;

  var nodes = {};
  var root = undefined;
  var rootSamplesCount = undefined;

  nt.timekit.stopV8Profiler(function(parentCallUid, callUid, totalSamplesCount, functionName, scriptResourceName, lineNumber) {
    if(rootSamplesCount === undefined)
      rootSamplesCount = totalSamplesCount;

    var cpuUsage = ((totalSamplesCount * 100) / rootSamplesCount || 1);
    var obj = {
      _totalSamplesCount: totalSamplesCount,
      _functionName: functionName,
      _scriptResourceName: scriptResourceName,
      _lineNumber: lineNumber,
      _cpuUsage: cpuUsage, 
      _id: nt.nextId++,
      _target: [],
      _label: cpuUsage.toFixed(2) + "% - " + functionName
    };

    if(scriptResourceName && lineNumber) 
      obj._label += " (" + scriptResourceName + ":" + lineNumber + ")";

    nodes[callUid] = obj;
    if(root === undefined) {
      root = obj;
    }

    if(parentCallUid) {
      var parentNode = nodes[parentCallUid];
      if(parentNode) parentNode._target.push(obj);
    }
  });
  nt.message("V8 profiler stopped");

  if(root) {
    var profile = {};
    profile._id = nt.nextId++;
    profile._label = os.hostname() + ' [' + process.pid + ']';
    profile._ts = nt.millis();
    profile._ns = 'cpu-profiles';
    profile.root = root;

    nt.agent.send({cmd: 'updateData', args: profile});
  }

  active = false;
};

