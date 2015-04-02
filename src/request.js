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
    qs = require('querystring'),
    url = require('url');

function Request(shell, transport, requestOptions, body, outputMode) {
  this.shell = shell;
  this.transport = transport;
  this.requestOptions = requestOptions;
  this.body = body;
  this.outputMode = outputMode;
}

Request.prototype.execute = function() {
  var self = this;
  var ijsrt = self.shell.state._;

  return ijsrt.async(function(deferred) {
    var request = self.transport.request(self.requestOptions, function(response) {
      var status = 'HTTP ' + response.statusCode + ' ' + (response.statusMessage || '');
      var statusDisplayed = false;

      if ((self.outputMode == 'all') || (self.outputMode == 'status') ||
          (self.outputMode == 'metadata')) {
        statusDisplayed = true;
        if ((response.statusCode >= 200) && (response.statusCode < 400)) {
          console.log(status);
        }
        else {
          console.error(status);
        }
        console.log();
      }
      if ((self.outputMode == 'all') || (self.outputMode == 'headers') ||
          (self.outputMode == 'metadata')) {
        for (var header in response.headers) {
          console.log(header + ': ' + response.headers[header]);
        }
        console.log();
      }

      if (response.statusCode != 200) {
        deferred.reject(statusDisplayed ? undefined : status);
        return;
      }

      if ((self.outputMode == 'all') || (self.outputMode == 'body')) {
        var buffers = [];
        var totalLength = 0;

        response.on('data', function(buffer) {
          buffers.push(buffer);
          totalLength += buffer.length;
        });
        response.on('end', function() {
          var content = Buffer.concat(buffers, totalLength);

          var contentType = response.headers['content-type'];
          var mimeType = contentType.split(';')[0];

          if ((contentType.indexOf('utf-8') > 0) ||
              (contentType.indexOf('text/') == 0) ||
              (mimeType == 'application/json')) {
            content = content.toString('utf8');

            if (mimeType == 'application/json') {
              content = JSON.parse(content);
            }
          }
          else {
            content.mime = mimeType;
          }

          deferred.resolve(content);
        });
      }
      else {
        deferred.resolve(undefined);
      }
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

Request.create = function(shell, args, data) {
  var requestOptions = {
    method: args.method.toUpperCase()
  };

  var urlData = url.parse(args.url, /* parseQuery */ true);

  if (args.query) {
    var queryData = shell.state[args.query];
    if (queryData) {
      for (var n in queryData) {
        urlData.query[n] = queryData[n];
      }
    }
  }
  var query = qs.stringify(urlData.query);

  if (args.headers) {
    requestOptions.headers = shell.state[args.headers];
  }

  if (args.data) {
    data = shell.state[args.data];
  }

  requestOptions.hostname = urlData.hostname;
  requestOptions.port = urlData.port;

  requestOptions.path = urlData.pathname;
  if (query) {
    requestOptions.path = requestOptions.path + '?' + query;
  }

  var transport = urlData.protocol == 'http:' ? http : https;
  return new Request(shell, transport, requestOptions, data, args.response || 'all');
}

Request.parse = function(shell, args, data) {
  var transport = http;
  var requestOptions = {
    headers: {}
  };
  var body;

  data = data.split('\n');

  // Determine verb and url from the first line
  var firstLine = data[0].split(' ');
  if (firstLine.length == 2) {
    requestOptions.method = firstLine[0].toUpperCase();

    var urlData = url.parse(firstLine[1]);
    if (urlData.protocol == 'https:') {
      transport = https;
    }

    requestOptions.hostname = urlData.hostname;
    requestOptions.port = urlData.port;
    requestOptions.path = urlData.path;
  }
  else {
    throw shell.createError('Invalid request. Missing verb and/or URL to request.');
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
    requestOptions.headers[nameValue[0].trim()] = nameValue[1].trim();
  }

  // Extract the body of the request
  if ((i + 1) < data.length) {
    body = data.slice(i + 1).join('\n');
    requestOptions.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
  }

  return new Request(shell, transport, requestOptions, body, args.response || 'all');
}

module.exports = Request;
