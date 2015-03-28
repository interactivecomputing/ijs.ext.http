// Copyright 2015 Interactive Computing project (https://github.com/interactivecomputing).
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
// except in compliance with the License. You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the
// License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific language governing permissions
// and limitations under the License.
//
// request.js
// Implements request object.
//

var http = require('http'),
    https = require('https'),
    url = require('url');

var VERBS = [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD' ];

function Request(shell, verb, host, path) {
  this.shell = shell;
  this.verb = verb;
  this.host = url.parse(host);
  this.path = path;
}
Request.prototype.execute = function() {
  var self = this;
  var ijsrt = self.shell.state._;

  return ijsrt.async(function(deferred) {
    var transport = self.host.protocol == 'https:' ? https : http;
    var options = {
      hostname: self.host.hostname,
      port: self.host.port,
      path: self.path,
      method: self.verb
    };
    var request = transport.request(options, function(response) {
      response.setEncoding('utf8');

      var content = [];
      response.on('end', function() {
        content = content.join('');
        deferred.resolve(content);
      });
      response.on('data', function(chunk) {
        content.push(chunk);
      });
    });

    request.on('error', function(e) {
      deferred.reject(e);
    });

    request.end();
  });
}

Request.parse = function(shell, args, data) {
  var verb;
  var path;

  for (var i = 0; i < VERBS.length; i++) {
    if (data.indexOf(VERBS[i] + ' ') === 0) {
      verb = VERBS[i];
      path = data.substring(verb.length).trim();

      break;
    }
  }

  if (!verb) {
    throw new Error('Invalid request. Missing HTTP verb.')
  }

  return new Request(shell, verb, args.domain, path);
}

module.exports = Request;
