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
var lastCpuTime;

exports.init = function() {
  nt = global.nodetime;

  nt.on("call", function(point, time) {
    if(point === "done") {
      nt.metric(time.scope, 'Requests per minute', 1, undefined, 'sum', true);
      nt.metric(time.scope, 'Average response time', time.ms, 'ms', 'avg', true);
      nt.metric(time.scope, 'Response time histogram', time.ms, 'ms', 'hist', true);
      if(time.cputime) nt.metric(time.scope, 'Average CPU time', time.cputime, 'ms', 'avg', true);
    }
  });

  setInterval(function() {
    try {
      collect();
    }
    catch(e) {
      nt.error(e);
    }
  }, 60000);

  collect();
};


var collect = function() {

  var info = {};
  info._ts = nt.millis();
  info._ns = 'info';
  info['Application name'] = nt.appName;
  try { info['Hostname'] = os.hostname() } catch(err) { nt.error(err) } 
  try { info['OS type'] = os.type() } catch(err) { nt.error(err) } 
  try { info['Platform'] = os.platform() } catch(err) { nt.error(err) } 
  try { info['Total memory (MB)'] = os.totalmem() / 1000000 } catch(err) { nt.error(err) } 
  try { var cpus = os.cpus(); info['CPU'] = {architecture: os.arch(), model: cpus[0].model, speed: cpus[0].speed, cores: cpus.length} } catch(err) { nt.error(err) } 
  try { info['Interfaces'] = os.networkInterfaces() } catch(err) { nt.error(err) } 
  try { info['OS uptime (Hours)'] = Math.floor(os.uptime() / 3600) } catch(err) { nt.error(err) } 
  try { info['Node arguments'] = process.argv } catch(err) { nt.error(err) } 
  try { info['Node PID'] = process.pid; } catch(err) { nt.error(err) } 
  try { info['Node uptime (Hours)'] = Math.floor(process.uptime() / 3600); } catch(err) { nt.error(err) } 
  try { info['Node versions'] = process.versions } catch(err) { nt.error(err) } 
  info['Nodetime version'] = nt.version;

  try {
    nt.emit('info', info);
  }
  catch(err) {
    nt.error(err);
  }


  var osScope = os.hostname();
  var processScope = osScope + ' - Process[' + process.pid + ']';

  try { nt.metric(osScope, 'Load average', os.loadavg()[0]); } catch(err) { nt.error(err); }
  try { nt.metric(osScope, 'Free memory', os.freemem() / 1000000, 'MB'); } catch(err) { nt.error(err); }


  try {
    var mem = process.memoryUsage();
    nt.metric(processScope, 'Node RSS', mem.rss / 1000000, 'MB');
    nt.metric(processScope, 'V8 heap used', mem.heapUsed / 1000000, 'MB');
    nt.metric(processScope, 'V8 heap total', mem.heapTotal / 1000000, 'MB');
  }
  catch(err) {
    nt.error(err);
  }

  var cpuTime = nt.cputime();
  if(cpuTime !== undefined && lastCpuTime !== undefined)
    nt.metric(processScope, 'CPU time', (cpuTime - lastCpuTime) / 1000, 'ms');
  if(cpuTime !== undefined) 
    lastCpuTime = cpuTime;
};

