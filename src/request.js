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

function Request(shell, verb, host, path, headers, body) {
  this.shell = shell;
  this.verb = verb;
  this.host = url.parse(host);
  this.path = path;
  this.headers = headers;
  this.body = body;
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
      method: self.verb,
      headers: self.headers
    };

    var request = transport.request(options, function(response) {
      if (response.statusCode != 200) {
        deferred.reject(response.statusCode + ' ' + (response.statusMessage || ''));
        return;
      }

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

    if (self.body) {
      request.write(self.body, 'utf8');
    }
    request.end();
  });
}

Request.parse = function(shell, args, data) {
  var verb;
  var path;
  var headers = {};
  var body;

  data = data.split('\n');

  // Determine verb and path from the first line
  var firstLine = data[0];
  for (var i = 0; i < VERBS.length; i++) {
    if (firstLine.indexOf(VERBS[i] + ' ') === 0) {
      verb = VERBS[i];
      path = firstLine.substring(verb.length).trim();

      break;
    }
  }

  if (!verb) {
    throw shell.createError('Invalid request. Missing or unsupported HTTP verb.');
  }

  // Determine headers from subsequent lines until an empty line is found.
  var i;
  for (i = 1; i < data.length; i++) {
    var line = data[i].trim();
    if (!line) {
      break;
    }

    var nameValue = line.split(':');
    if (nameValue.length != 2) {
      throw shell.createError('Invalid request. Invalid HTTP header.');
    }
    headers[nameValue[0].trim()] = nameValue[1].trim();
  }

  if ((i + 1) < data.length) {
    body = data.slice(i + 1).join('\n');

    if (body && ((verb == 'GET') || (verb == 'HEAD'))) {
      throw shell.createError('Invalid request. Data is note supported for GET and HEAD requests.');
    }

    headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
  }

  return new Request(shell, verb, args.domain, path, headers, body);
}

module.exports = Request;
