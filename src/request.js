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
    https = require('https');

var VERBS = [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD' ];

function Request(verb, host, path) {
  this.verb = verb;
  this.host = host;
  this.path = path;
}
Request.prototype.execute = function(shell) {
  var ijsrt = shell.state._;

  return ijsrt.async(function(deferred) {
    console.log('url: ' + this.host);
    console.log('verb: ' + this.host);

    deferred.resolve(null);
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
