'use strict';

import React from 'react';

/**
 * Helper function for window.requestAnimationFrame. Falls back to browser-prefixed versions if default not available, or falls back to setTimeout with 0ms delay if no requestAnimationFrame available at all.
 *
 * @param {function} cb - Callback method.
 * @returns {undefined|string} Undefined or timeout ID if falling back to setTimeout.
 */
export function requestAnimationFrame(cb){
    if (/*!isServerSide() && */typeof window !== 'undefined'){
        if (typeof window.requestAnimationFrame !== 'undefined')        return window.requestAnimationFrame(cb);
        if (typeof window.webkitRequestAnimationFrame !== 'undefined')  return window.webkitRequestAnimationFrame(cb);
        if (typeof window.mozRequestAnimationFrame !== 'undefined')     return window.mozRequestAnimationFrame(cb);
    }
    return setTimeout(cb, 0); // Mock it for old browsers and server-side.
}

export function cancelAnimationFrame(identifier){
    if (/*!isServerSide() && */typeof window !== 'undefined'){
        if (typeof window.cancelAnimationFrame !== 'undefined')        return window.cancelAnimationFrame(identifier);
        if (typeof window.webkitCancelAnimationFrame !== 'undefined')  return window.webkitCancelAnimationFrame(identifier);
        if (typeof window.mozCancelAnimationFrame !== 'undefined')     return window.mozCancelAnimationFrame(identifier);
    }
    return clearTimeout(identifier); // Mock it for old browsers and server-side.
}

