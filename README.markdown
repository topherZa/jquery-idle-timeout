# jQuery Idle Timeout

Reason for Fork: 
I changed the code from a object literal declaration to a Modular format to make it easier to expose a resume method that I could call on ajaxSuccess/ajaxComplete. I prefer the modular pattern just in general. Only once I was done did I think of forking the project in the hope that my change could help someone else.

See the original [Mint.com example](http://www.erichynds.com/examples/jquery-idle-timeout/example-mint.htm), or a [demo](http://www.erichynds.com/examples/jquery-idle-timeout/example-dialog.htm) using jQuery UI's dialog widget.

This script allows you to detect when a user becomes idle (detection provided by Paul Irish's idletimer plugin) and notify the user his/her session
is about to expire.  Similar to the technique seen on Mint.com.  Polling requests are automatically sent to the server at a configurable
interval, maintaining the users session while s/he is using your application for long periods of time.

![Example](http://www.erichynds.com/examples/jquery-idle-timeout/screenshot.gif)
