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

function Request(verb, host, path) {
  this.verb = verb;
  this.host = url.parse(host);
  this.path = path;
}
Request.prototype.execute = function(shell) {
  var ijsrt = shell.state._;

  return ijsrt.async(function(deferred) {
    console.log('path: ' + this.path);
    console.log('verb: ' + this.verb);

    var transport = this.host.protocol == 'https:' ? https : http;
    var options = {
      hostname: this.host.hostname,
      port: this.host.port,
      path: this.path,
      method: this.verb
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

Request.parse = function(args, data, state) {
  var verb;
  var url;

  for (var i = 0; i < VERBS.length; i++) {
    if (data.indexOf(VERBS[i] + ' ') === 0) {
      verb = VERBS[i];
      url = data.substring(verb.length).trim();

      break;
    }
  }

  if (!verb) {
    throw new Error('Invalid request. Missing HTTP verb.')
  }

  return new Request(verb, args.domain, url);
}

module.exports = Request;
