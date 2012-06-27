Nodetime - Performance Profiler for Node.js
===========================================

Nodetime reveals response time and other internals of HTTP requests and underlying HTTP, database, file system and other API calls in your Node.js application. Coupled with related process and OS state information it enables tracing performance problems down to the root cause. Nodetime supports multiple APIs including native HTTP client, file system, cluster and sockets, Socket.io, Redis, MongoDB, MySQL, PostgreSQL, Memcached and Cassandra. HTTP based data stores like CouchDB and Riak are supported via HTTP API. 

The profiler running within the application securely sends profiling data to the Nodetime server, which forwards it to the browser in real-time.

Nodetime is a high level profiler designed to run in prdocution environments. By hooking up to various APIs it gives developers clear API level visibility of performance, i.e. time and CPU usage, averages, stack traces and much more.



## Installation and Usage

Install Nodetime with npm 

    npm install nodetime 

The following call should be placed before any other require statement in your application, e.g. at the first line of your main module

    require('nodetime').profile()

After your start your application, a link of the form `https://nodetime.com/[session_id]` will be printed to the console, where the session will be your unique id for accessing the profiler server. Copy the link into your browser and you're done! No need to refresh the browser, new data will appear as it arrives from the profiler.

See the API section on how to get the session id programmatically.

**Note**: installing Nodetime on Heroku requres explicit installation of `timekit` module, which is a dependency of nodetime and is automatically installed on other platforms.

### Modes of Operation

Profiler running in the application is automatically activated only at startup and when there is a profiling session from nodetime.com, i.e. the page is open in your browser. After profiling session is ended the profiler is automatically deactivated within minutes. If profiler runs in headless mode, it should be resumed programmatically using the API, otherwise it will be paused automatically. 

Nodetime automatically detects if an application is running under constant load, e.g. production, or it is being tested or debugged. If the server is under load Nodetime will capture and send only slowest requests and related information. A custom filtering of samples is possible at profiler level allowing to keep only necessary samples.

It is also possible to disable sending profiling data to the web console and dump everything to the console by passing `headless` flag at initialization, e.g. `require('nodetime').profile({headless: true})`. Other possibilities to output profiling result are through local API, dtrace and stdout.


### Nodetime Pro

Designed for frequent development and production use, Nodetime Pro allows you to connect your applications to your account directly and persistently, instead of using instance-based temporary sessions.

Several applications can be associated with one account and can also be groupped by application name. Here is how the profiler initialization statement will look like:

  require('nodetime').profile({
      accountKey: 'your_account_key', 
      appName: 'your_application_name'
    });

[Sign up](http://nodetime.com/pro) now or [learn more](http://nodetime.com/blog/nodetime-pro) about Nodetime Pro.


## Features

### Request and Operation Sampling
A core feature of Nodetime, which gives you visibility of what's happening inside your application by showing requests and operations, e.g. API calls, with a lot of information, including response time, CPU time, operations such as database calls, http client requests, file system and other API calls, which happened at the same time. And this all completed with related context information and application state.


### Custom Sampling
Nodetime samples requests and some Socket.io communication out of the box. For other types of applications or a specific operation tracing needs it provides simple API functions and extension mechanisms. Using time() and timeEnd() functions will tell a lot about enclosed code segment. Read more in the blog post A [Powerful Alternative to Node's console.time()](http://nodetime.com/blog/powerful-alternative-to-nodes-console-time).


### Sample Filtering
If there are too many requests or operations handled by the application, Nodetime will send only slowest samples of requests and their operations to the profiler web console (though still emitting all samples on the local API level). For systems under load, this can result in making the faster but more important requests invisible. Filtering allows you to specify what exactly you want to see. For example, you can specify to sample only those requests, which are slower than 100ms or match a certain URL pattern. Or, requests, which have an underlying database call to a database on specific machine with given IP address. While API gives you the full power of programmatic filtering, profiling web console at nodetime.com makes it a few clicks to filter samples down to very specific ones.


### CPU Profiling
As a logical next step after detecting high CPU utilization, Nodetime makes it increadably easy to use V8's built-in sampling CPU profiler to analyze hot spots and locate inefficient functions. Read more about using CPU profiler in the blog post [CPU Profiling with Nodetime](http://nodetime.com/blog/cpu-profiling-with-nodetime).


### Metrics
Nodetime also displays short term metrics in web console to highlight current state and dynamics. Charts include OS Load average and free memory, Node's RSS and Heap size as well as average response / CPU times and counts for HTTP client / server requests and supported API calls and libraries, e.g. File System, Redis, MongoDB, MySQL, PostgreSQL, Memcached and Cassandra.


### DTrace
Nodetime can fire DTrace probes on API-level calls it catches. This opens up powerful analytics possibilities on supported systems. Read more in the blog post [Trace API Calls In DTrace](http://nodetime.com/blog/trace-api-calls-in-dtrace).


## API

`require('nodetime')` - returns a singleton instance of Nodetime object.


### Methods:

`profile(options)` - starts the profiler. Options are:

* `headless` - if true, no data is sent to the server.
* `stdout` - if true, dumps samples using `console.log()`. Also sets `headless` to true. Explicitly set `headless` to false if you want both, the dump and sending to Nodetime server.
* `dtrace` - activates firing of DTrace probes. Available only in OS X 64 bit and Solaris 32 bit. DTrace provider dependency should be installed manually with `npm install dtrace-provider`. Provider name is `nodetime` and probe names are `api-call-start` and `api-call-done`. Argumets are as follows: `id`, `scope` and `command`. More about DTrace support in the blog post [Trace API Calls in DTrace](http://nodetime.com/blog/trace-api-calls-in-dtrace).
* `debug` - used for debugging nodetime itself, so hopefully you won't need it.

`pause()` - deactivaties the profiler.

`resume([seconds])` - activates the profiler for a given duration. If no `seconds` argument is specified, defaults to 180 seconds.

`filter(test)` - sets sample filter. Filter makes it possible to restrict emitted samples. `test` is a function, which return true or false indicating wether to keep the sample or not, eg.

    nodetime.filter(function(sample) {
      return (sample._ms >= 100); // the sample is ignored if request took less than 100 ms
    })

`time(label[, context])` - marks time measurement start. Optional context parameter is used to pass more information about execution context as hash pairs.

`timeEnd(label[, context])` - marks time measurement end. At this point a sample containing measured interval information, such as response time, CPU time, Operations and related data will be emitted and send to server if not in headless mode. Optional context parameter is used to pass more information about execution context as hash pairs. Read more in the blog post [A Powerful Alternative to Node's console.time()](http://nodetime.com/blog/powerful-alternative-to-nodes-console-time).

`metric(scope, name, value, unit, op)` - aggregates and sends metrics to the web console every minute. `op` argument takes only `val`, `sum` and `avg` values at the moment.

### Events:

`on('session', function(id) {})` - Emitted when a unique session id is received from the server. The event is not emitted if in `headless` mode.

`on('sample', function(sample) {})` - Sample object represents a profiled request. **Important:** the structure of sample object will not be kept backwards compatible in future versions. 

`on('call', function(point, time) {})` - Call events emit API calls directly. `point` parameter can be "start" and "done", specifying the point when the call was emitted. `time` object represents call inforamtion and  has the following fields:  

* `id` - unique id of the call
* `scope` - scope of the call, i.e. library, namespace or API name
* `command` - command, e.g. execute, get, set, etc.
* `begin` - start time of the call
* `end` - end time of the call
* `ms` - duration of the call
* `cputime` - time spent in CPU


`on('value', function(value) {})` - Emits variable values, e.g. "average response time", "load average", etc. `value` is a JSON object with fields `scope`, `name`, `value`, `op` and a caouple of meta properties. 


## Run-time Overhead

Nodetime is based on probes hooked into API calls and callbacks using wrappers. It measures time, adds variables and creates objects, which naturally causes overhead. A significant part of the overhead is the reading of stack traces of sampled operations taking a couple of hundred microseconds, but which is limited to 1000 stack traces per minute to make sure lowest possible overhead for systems under load. Although, the probes are mostly attached around calls involving network communication, which makes the overhead insignificant. However, it is recommended to measure overhead for specific cases.


## License

Copyright (c) 2012 Dmitri Melikyan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

