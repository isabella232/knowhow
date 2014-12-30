(function () {

    // 1: router implementation with functions for adding new routes and handling them

    var router = {
        // stores all routes
        routes: [],
        // add a route. A route consists of the route regexp, a callback and optional scope
        add   : function (route, callback, scope) {
            this.routes.push({
                route   : route,
                callback: callback,
                scope   : scope
            });
        },
        // handle route. This should be called when the url changes.
        // Optional doPush argument dictates whether the history stack should add an entry.
        handle: function (path, doPush) {
            var len = this.routes.length,
                routeObj,
                scope,
                i;
            // search through all routes for a match
            for (i = 0; i < len; i += 1) {
                routeObj = this.routes[i];
                if (path.match(routeObj.route)) {
                    if (routeObj.scope) {
                        scope = routeObj.scope;
                    } else {
                        scope = window;
                    }
                    if (doPush) {
                        history.pushState({}, null, path);
                    }
                    // match was found, so call the handler function for this new url
                    routeObj.callback.apply(scope, [path]);
                    return true;
                }
            }
            return false;
        }
    };

    // 2: three different ways the url can change, handle all of them

    // when back button is pressed catch the event and handle the url change
    window.addEventListener('popstate', function () {
        router.handle(window.location.href);
    });

    // on load, handle url
    function onLoad() {
        router.handle(window.location.href);
    }

    window.onload = onLoad;

    // intercept all click events in the document, and if the router contains
    // a function to handle the new url, make sure to call preventDefault.
    document.addEventListener('click', function (e) {
        if (e.target.href && router.handle(e.target.href, true)) {
            e.preventDefault();
        }
    });

    // 3: our client code which hides/shows elements based on the current route
    var pages = {},
        // our route regular expression which is passed to router.add
        routeRegexp = /\?book=([0-9])/,
        // a template fragment for generating each page
        tpl = Handlebars.compile(document.getElementById('tpl').innerHTML),
        // for our book content
        masterDiv = document.createElement('div');

    masterDiv.className = 'book-content';

    // we call this to make sure no book pages are being displayed
    function hidePages() {
        var page;
        for (page in pages) {
            pages[page].style.display = 'none';
        }
    }

    // handle page is the callback which is called when a url matching
    // our route regular expression (see routeRegexp) is present.
    function handlePage(path) {
        // extract page number from url
        var pageNum = path.match(routeRegexp)[1],
            req;
        // hide all pages
        hidePages();
        if (pages[pageNum]) {
            // show page depending on page number present in url
            pages[pageNum].style.display = 'inline-block';
        } else {
            // if the page is not in the pages cache, fetch it from server
            // and add to cache, and display it.
            req = new XMLHttpRequest();
            req.open('get', 'book' + pageNum + '.json', true);
            req.send();
            req.onload = function () {
                var data = JSON.parse(this.responseText),
                    div = masterDiv.cloneNode(false);
                div.innerHTML = tpl(data);
                document.querySelector('#app-content').appendChild(div);
                pages[pageNum] = div;
            };
        }
    }

    // here is where we add out route regular expression / callback function
    // combination to the router.
    router.add(routeRegexp, handlePage);
})();