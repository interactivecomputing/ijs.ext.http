# ijs.ext.http
IJavaScript extension for creating and invoking HTTP APIs

## Usage

These are the steps to follow in a notebook.

Step 1 - Loading the extension

    %extension http

Step 2 - Making verbatim HTTP requests

    %request
    GET http://www.example.com

The general format is:

    %request
    HTTP_Verb URL
    Optional Headers (Header: Value)

    Optional Body

Step 3 - Alternatively issue curl-like commands

    %url --method=GET --url=http://www.example.com

You can see all the parameters to optionally pass in query string, headers and
request body, as well as select the response display mode, via the command help.

    %url --help

