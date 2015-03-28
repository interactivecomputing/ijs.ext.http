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
    throw shell.createError('Missing request data.', 'abc');
  }

  return request.parse(shell, args, data).execute();
}
requestCommand.options = function(parser) {
  return parser
    .help('Issues an HTTP request to the specified domain.')
    .option('domain', {
      abbr: 'd',
      full: 'domain',
      metavar: 'host',
      type: 'string',
      required: true,
      help: 'the server to issue a request to.'
    });
}


module.exports = {
  request: requestCommand
};

