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
// index.js
// The ijs extension implementation.
//

var requestCommands = require('./requestCommands'),
    serverCommands = require('./serverCommands');

function initialize(shell, callback) {
  shell.registerCommand('request', requestCommands.request);
  shell.registerCommand('url', requestCommands.url);

  shell.registerCommand('server', serverCommands.server);
  shell.registerCommand('server.static', serverCommands.serverStatic);
  shell.registerCommand('server.route', serverCommands.serverRoute);

  process.nextTick(function() {
    callback(null, null);
  });
}

module.exports = {
  initialize: initialize
};
