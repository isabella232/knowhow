(function () {

    // 1: router implementation with functions for adding new routes and handling them
    var router = {
        routes: [],
        add   : function (route, callback, scope) {
            this.routes.push({
                route   : route,
                callback: callback,
                scope   : scope
            });
        },
        handle: function (path, doPush) {
            var len = this.routes.length,
                routeObj,
                scope,
                i;
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
                    routeObj.callback.apply(scope, [path]);
                    return true;
                }
            }
            return false;
        }
    };

    // 2: three different ways the url can change, handle all of them
    window.addEventListener('popstate', function () {
        router.handle(window.location.href);
    });

    window.onload = function () {
        router.handle(window.location.href);
    };

    document.addEventListener('click', function (e) {
        if (e.target.href && router.handle(e.target.href, true)) {
            e.preventDefault();
        }
    });

    // 3: our client code which hides/shows elements based on the current route
    var pages = {},
        routeRegexp = /\?book=([0-9])/,
        tpl = Handlebars.compile(document.getElementById('tpl').innerHTML);

    function hidePages() {
        var page;
        for (page in pages) {
            pages[page].style.display = 'none';
        }
    }

    function handlePage(path) {
        var pageNum = path.match(routeRegexp)[1],
            req;
        hidePages();
        if (pages[pageNum]) {
            pages[pageNum].style.display = 'inline-block';
        } else {
            req = new XMLHttpRequest();
            req.open('get', 'book' + pageNum + '.json', true);
            req.send();
            req.onload = function () {
                var data = JSON.parse(this.responseText),
                    div = document.createElement('div');
                div.id = 'book-content';
                div.innerHTML = tpl(data);
                document.querySelector('#app-content').appendChild(div);
                pages[pageNum] = div;
            };
        }
    }

    router.add(routeRegexp, handlePage);
})();