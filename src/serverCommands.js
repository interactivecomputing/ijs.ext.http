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
// serverCommands.js
// Implements commands to control the HTTP server offered by the extension.
//

var util = require('util');
var server = require('./server');

// Implements the %server command
// This command can be used to control the server associated with the shell.
function serverCommand(shell, args, data, evaluationId) {
  var command = args[0];

  try {
    if (command == 'start') {
      server.start(args.port)
    }
    else if (command == 'stop') {
      server.stop();
    }
  }
  catch (e) {
    throw shell.createError(e.message);
  }
}
serverCommand.options = function(parser) {
  parser.command('start')
        .help('Starts the web server')
        .option('port', {
          abbr: 'p',
          full: 'port',
          metavar: 'number',
          type: 'number',
          required: true,
          help: 'the port on which the server should listen'
        });
  parser.command('stop');

  return parser;
}

// Implements the %%server.static command
// This command can be used to add or remove static content served by the server.
function staticCommand(shell, args, data, evaluationId) {
  if (args['0'] == 'add') {
    if (args.data) {
      data = shell.state[args.data];
      if (!data) {
        throw shell.createError('The specified variable "%s" was not found.', args.data);
      }
    }

    if (!data) {
      throw shell.createError('No data specified was specified for the content to add.');
    }

    var url = server.addContent(args.name, data, args.mime);
    var markup = util.format('<a href="%s" target="_blank">%s</a>', url, args.name);

    return shell.runtime.data.html(markup);
  }
  else {
    server.removeContent(args.name);
    return undefined;
  }
}
staticCommand.options = function(parser) {
  parser.option('name', {
          abbr: 'n',
          full: 'name',
          metavar: 'id',
          type: 'string',
          required: true,
          help: 'The id to use to create a URL to the content'
        })
  parser.command('add')
        .help('Adds static content to the server')
        .option('mime', {
          abbr: 'm',
          full: 'mime',
          metavar: 'type',
          type: 'string',
          required: true,
          help: 'The mime type to associate with the content'
        })
        .option('data', {
          abbr: 'd',
          full: 'data',
          metavar: 'variable',
          type: 'string',
          help: 'The variable containing the content'
        });
  parser.command('remove')
        .help('Removes static content to the server');

  return parser;
}

// Implements the %%server.route command
// This command can be used to add or remove route handlers used by the server.
function routeCommand(shell, args, data, evaluationId) {
  var methods = args.methods;
  if (typeof methods == 'string') {
    methods = [ methods ]
  };

  if (args['0'] == 'add') {
    if (args.handler) {
      var fn = shell.state[args.handler];
      if (!fn || (typeof fn != 'function')) {
        throw shell.createError('The specified name "%s" could not be found or is not a function.',
                                args.handler);
      }

      server.addRoute(args.path, methods, fn);
      return undefined;
    }
    else {
      var code = '(function() { return function(request, response) { ' + data + ' } })();';

      return shell.evaluate(code, evaluationId).then(function(fn) {
        server.addRoute(args.path, methods, fn);
      });
    }
  }
  else {
    server.removeRoute(args.path, methods);
    return undefined;
  }
}
routeCommand.options = function(parser) {
  parser.option('path', {
          position: 1,
          help: 'the path pattern'
        })
        .option('methods', {
          abbr: 'm',
          full: 'method',
          metavar: 'method',
          list: true,
          choices: ['GET', 'POST', 'PUT', 'DELETE'],
          'default': 'GET',
          help: 'the HTTP method (GET, POST, PUT, DELETE)'
        });

  parser.command('add')
        .help('adds a route')
        .option('handler', {
          abbr: 'h',
          full: 'handler',
          metavar: 'name',
          help: 'the name of a function to use as the handler'
        });

  parser.command('remove');

  return parser;
}


module.exports = {
  server: serverCommand,
  serverStatic: staticCommand,
  serverRoute: routeCommand
};
