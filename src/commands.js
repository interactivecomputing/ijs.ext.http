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
// commands.js
// The commands implemented by the HTTP extension.
//

var request = require('./request');


// Implements the %%request command, that can be used to issue an HTTP request
function requestCommand(shell, args, data, evaluationId) {
  data = data || '';
  data = data.trim();

  if (!data) {
    throw shell.createError('Missing request data.');
  }

  return request.parse(shell, args, data).execute();
}
requestCommand.options = function(parser) {
  return parser
    .help('Issues the specified HTTP request and displays the resulting response.');
}


// Implements the %%url command, that can be used to issue an HTTP request
function urlCommand(shell, args, data, evaluationId) {
  return request.create(shell, args, data).execute();
}
urlCommand.options = function(parser) {
  return parser
    .help('Issues the specified HTTP request and displays the resulting response.')
    .option('method', {
      position: 0,
      required: true,
      help: 'the HTTP method to use (eg. GET, POST, etc.)'
    })
    .option('url', {
      position: 1,
      required: true,
      help: 'the URL to request'
    })
    .option('query', {
      full: 'query',
      metavar: 'variable',
      type: 'string',
      help: 'the name of the variable containing query data'
    })
    .option('headers', {
      full: 'headers',
      metavar: 'variable',
      type: 'string',
      help: 'the name of the variable containing headers'
    })
    .option('data', {
      full: 'data',
      metavar: 'variable',
      type: 'string',
      help: 'the name of the variable containing request content'
    });
}


module.exports = {
  request: requestCommand,
  url: urlCommand
};

