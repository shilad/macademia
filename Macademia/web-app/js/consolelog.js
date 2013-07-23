/*
 * Makes sure that console.log will not generate an error on any browser.
 */
console = console || {};

if (!console.log) { console.log = function() {} }
