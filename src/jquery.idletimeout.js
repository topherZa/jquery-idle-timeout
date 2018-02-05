/*
 * jQuery Idle Timeout 1.2
 * Copyright (c) 2011 Eric Hynds
 *
 * http://www.erichynds.com/jquery/a-new-and-improved-jquery-idle-timeout-plugin/
 *
 * Depends:
 *  - jQuery 1.4.2+
 *  - jQuery Idle Timer (by Paul Irish, http://paulirish.com/2009/jquery-idletimer-plugin/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
*/

var IdleTimeout = (function ($, win) {
    var warning, resume, countdownOpen, failedRequests, title, counter, timer, countdown;
    var init = function (element, _resume, _options) {
        resume = _resume;
        var elem;

        warning = elem = $(element);
        resume = $(resume);
        options = _options;
        countdownOpen = false;
        failedRequests = options.failedRequests;
        _startTimer();
        title = document.title;

        // expose obj to data cache so peeps can call internal methods
        // $.data(elem[0], 'idletimeout', this);

        // start the idle timer
        $.idleTimer(options.idleAfter * 1000);

        // once the user becomes idle
        $(document).bind("idle.idleTimer", function () {

            // if the user is idle and a countdown isn't already running
            if ($.data(document, 'idleTimer') === 'idle' && !countdownOpen) {
                _stopTimer();
                countdownOpen = true;
                _idle();
            }
        });

        // bind continue link
        resume.bind("click", function (e) {
            e.preventDefault();
            IdleTimeout.Resume();
        });
    };


    var _idle = function () {
        //var options = options,
        if (warning[0] !== undefined)
            warning = warning[0];
        counter = options.warningLength;

        // fire the onIdle function
        options.onIdle.call(warning);

        // set inital value in the countdown placeholder
        options.onCountdown.call(warning, counter);

        // create a timer that runs every second
        countdown = win.setInterval(function () {
            if (--counter === 0) {
                window.clearInterval(countdown);
                options.onTimeout.call(warning);
            } else {
                options.onCountdown.call(warning, counter);
                document.title = options.titleMessage.replace('%s', counter) + title;
            }
        }, 1000);
    };

    var _startTimer = function () {

        timer = win.setTimeout(function () {
            _keepAlive();
        }, options.pollingInterval * 1000);
    };

    var _stopTimer = function () {
        // reset the failed requests counter
        failedRequests = options.failedRequests;
        win.clearTimeout(timer);
    };

    var _keepAlive = function (recurse) {

        //Reset the title to what it was.
        document.title = title;

        // assume a startTimer/keepAlive loop unless told otherwise
        if (typeof recurse === "undefined") {
            recurse = true;
        }

        // if too many requests failed, abort
        if (!failedRequests) {
            _stopTimer();
            options.onAbort.call(warning[0]);
            return;
        }

        $.ajax({
            timeout: options.AJAXTimeout,
            url: options.keepAliveURL,
            error: function () {
                failedRequests--;
            },
            success: function (response) {
                if ($.trim(response) !== options.serverResponseEquals) {
                    failedRequests--;
                }
            },
            complete: function () {
                if (recurse) {
                    _startTimer();
                }
            }
        });
    };
    var _resume = function () {
        if (options !== undefined) {
            win.clearInterval(countdown); // stop the countdown
            countdownOpen = false; // stop countdown
            _startTimer(); // start up the timer again
            _keepAlive(false); // ping server
            options.onResume.call(warning); // call the resume callback
        }
    };


    var _init = function (element, resume, _options) {
        init(element, resume, $.extend(options, _options));

    };


    // options
    var options = {
        // number of seconds after user is idle to show the warning
        warningLength: 10,

        // url to call to keep the session alive while the user is active
        keepAliveURL: "",

        // the response from keepAliveURL must equal this text:
        serverResponseEquals: "OK",

        // user is considered idle after this many seconds.  10 minutes default
        idleAfter: 600,

        // a polling request will be sent to the server every X seconds
        pollingInterval: 60,

        // number of failed polling requests until we abort this script
        failedRequests: 5,

        // the $.ajax timeout in MILLISECONDS!
        AJAXTimeout: 250,

        // %s will be replaced by the counter value
        titleMessage: 'Warning: %s seconds until log out | ',

		/*
			Callbacks
			"this" refers to the element found by the first selector passed to $.idleTimeout.
		*/
        // callback to fire when the session times out
        onTimeout: $.noop,

        // fires when the user becomes idle
        onIdle: $.noop,

        // fires during each second of warningLength
        onCountdown: $.noop,

        // fires when the user resumes the session
        onResume: $.noop,

        // callback to fire when the script is aborted due to too many failed requests
        onAbort: $.noop
    };
    return {
        Init: _init,
        Resume: _resume
    }
})(jQuery, window);