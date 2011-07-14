/// <reference path="vsdoc/jquery.js" />
/* This file is Copyright (c) 2010, Chakrit Wichian
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
* - Redistributions of source code must retain the above copyright
*   notice, this list of conditions and the following disclaimer.
* - Redistributions in binary form must reproduce the above copyright
*   notice, this list of conditions and the following disclaimer in the
*   documentation and/or other materials provided with the distribution.
* - Neither the name of copyright holder nor the
*   names of its contributors may be used to endorse or promote products
*   derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// jquery-deps.js - jQuery dependency manager
(function () {
  // TODO: Detect dependency loops
  // TODO: Enable pre-loading of images
  // TODO: Add support for multiple/nested deps resolving context
  //       so it's possible to use this without calling init

  var $ = jQuery;

  var basePath = "/",
    depGraph = {},
    loadedDeps = {},
    loadQueue = [];


  // OPTIMIZE: Find out the number of concurrent requests we can pull at once
  //           which probably depends on the browser
  var loadCounter = 6,
    shouldSpinLoad = false,
    spinId = null;

  var filenameRx = /(?:\\|\/|^)([a-zA-Z0-9\-]+)\.[a-zA-Z]{0,4}$/,
    head = $("head");

  // "execute" the content
  function processItem(name, content) {
    debug.log("Processing: %s...", name);

    var tag = null;

    function stringEndsWith(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    function getFilenameWithoutExtension(str) {
      return filenameRx.exec(str)[1];
    }

    // WARN: Potential evil, tread lightly.
    if (stringEndsWith(name, ".js")) {
      $.globalEval(content);

    } else if (stringEndsWith(name, ".css")) {
      $(document.createElement("style"))
        .text(content)
        .appendTo(head);

    } else if (stringEndsWith(name, ".html") ||
      stringEndsWith(name, ".htm") ||
      stringEndsWith(name, ".haml")) {

      // create a "<script type='text/html'>" to store templates
      // html must be called *before* appendTo in order for this to work.
      $(document.createElement("script"))
        .attr("type", "text/html")
        .attr("id", getFilenameWithoutExtension(name) + "-template")
        .html(content)
        .appendTo(head);
    }

  }


  function isModule(resource) {
      return resource.indexOf(".") < 0;
  }


  // actual script loader
  function spinLoad() {
    function innerSpinLoad() {

      shouldSpinLoad = false;
      clearTimeout(spinId);
      spinId = null;

      if (loadQueue.length == 0) return;

        var item = loadQueue[0];

      // if we have a function, it means all of the function's dependencies
      // (which should have been on the queue preceding the function)
      // have been loaded so we can now execute the function
      if (typeof item == 'function') {
        loadQueue.shift()(); // item == loadQueue[0]
        shouldSpinLoad = true;
      } else if (isModule(item)) {
        loadQueue.shift();
        shouldSpinLoad = true;
        loadedDeps[item] = true;
      }

      // item is not a function, its a dependency string
      // if we have loading slots available, add it to the loadQueue.
      for (var i = 0, l = loadQueue.length; i < l && loadCounter > 0; i++) {
        item = loadQueue[i];

        // skip any functions that are waiting to be executed but doesn't need loading
        // or if the dependency has been and is pending.
        if (item in loadedDeps || typeof item == 'function' || isModule(item)) {
          continue;
        }


        // occupy a load slot and spin off a loading function
        loadCounter -= 1;
        loadedDeps[item] = false; // this makes (item in loadedDeps) === true
        shouldSpinLoad = true;

        $.ajax({
            url : basePath + item,
            success : (function (item) {
                return function (content) {
                            var idx = $.inArray(item, loadQueue);
                            loadQueue[idx] = function () {

                              // mark as loaded and ready for use (executed)
                              loadedDeps[item] = true;
                                try {
                                    processItem(item, content);
                                } catch (e) {
                                    alert("processing of " + item + " failed: " + e);
                                }
                            };
                            loadCounter += 1;
                            spinLoad();
                  }})(item),
            error : function(xmlHttp, status) {
                alert('loading of ' + item + ' failed: ' + status);
            },
            dataType : 'text'

        });
      }

      if (shouldSpinLoad) spinLoad();
    }

    spinId = spinId || setTimeout(innerSpinLoad, 1);
  }


  // initialize the depedency graph
  function initDeps(basePath_, deps) {
    if (typeof basePath_ == 'object' && deps == null) {
      deps = basePath_;
      basePath_ = null;
    }

    if (basePath_ !== null) basePath = basePath_;
    depGraph = deps;
  }

  // recursively ensure all dependencies are loaded
  function ensureDeps(dep) {

    if (dep in depGraph) {
      // ensure all required deps are queued first
      var requiredDeps = depGraph[dep];
      for (var i = 0; i < requiredDeps.length; i++)
        ensureDeps(requiredDeps[i]);

    }

    // if it's already loaded, skip it
    if (loadedDeps.hasOwnProperty(dep) || $.inArray(dep, loadQueue) != -1)
      return;

    // else push it to the load queue
    loadQueue.push(dep);
  }

  // request loading of certain dependencies
    function loadDeps(deps, callback) {
        if (!(deps instanceof Array)) deps = [deps];

    // push all dependencies onto the queue
    for (var i = 0; i < deps.length; i++)
      ensureDeps(deps[i]);

    // then add the callback *after* the deps
    if (callback && typeof callback == 'function') {
      loadQueue.push(callback);
    }

    spinLoad();
  }


  // wire up to jQuery
  $.deps = {
    init: initDeps,
    load: loadDeps,

    // for debugging purpose
    getGraph: function () { return depGraph; }
  };

})();