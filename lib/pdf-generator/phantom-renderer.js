/*globals phantom, window*/
"use strict";
var page = require('webpage').create(),
    system = require('system'),
    address, output, size, pagePrepare,
    iterateElems = function (selectors, handler) {
        selectors.forEach(function (selector) {
            try {
                var elems = document.querySelectorAll(selector);
                for (var i = 0; i < elems.length; i++) {
                    handler(elems[i], selector);
                }
            } catch (e) {
                console.error(e);
            }
        });
    },
    hide = function (selectors, iterateElems) {
        iterateElems(selectors, function (element) {
            element.style.display = 'none';
        });
    },
    style = function (selectorsMap, iterateElems) {
        var selectors = Object.keys(selectorsMap);
        iterateElems(selectors, function (element, selector) {
            var style = selectorsMap[selector],
                keys = Object.keys(style);
            keys.forEach(function (key) {
                element.style[key] = style[key];
            });
        });
    };

address = system.args[1];
output = system.args[2];
page.viewportSize = {width: 1024, height: 768};
size = system.args[3].split('*');
page.paperSize = {width: size[0], height: size[1], margin: {top: '15px', bottom: '15px'}};

pagePrepare = system.args[4] && JSON.parse(system.args[4]);

log('open ' + address);
page.open(address, function (status) {
    if (status !== 'success') {
        log('opening failed');
        console.log('Unable to load the address!');
        phantom.exit(1);
    } else {
        page.onConsoleMessage = function(msg) {
            console.log(msg);
        };
        log('loaded');
        if (pagePrepare) {

            if (pagePrepare.hide) {
                log('hide some elements');
                page.evaluate(hide, pagePrepare.hide, iterateElems);
            }
            if (pagePrepare.style) {
                log('style some elements');
                page.evaluate(style, pagePrepare.style, iterateElems);
            }

        }

        window.setTimeout(function () {
            log('render to PDF');
            page.render(output);
            log('done');
            phantom.exit();
        }, 200);
    }
});

function log (message) {
    console.log('PhantomJS: ' + message);
}