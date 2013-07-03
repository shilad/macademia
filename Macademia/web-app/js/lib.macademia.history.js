/**
 *
 * Created by Jesse & ken
 *
 * Flow:
 * 0. Event happens.
 * 1. Library takes snapshot of parameter state.
 * 2. Program queries old parameter state, updates new (sandbox) state, ?queries new state as well?
 * 3. Program calls update().
 * 4. Programs can query current parameter state ?and last state?.
 *
 * e.g:
 *
 * 1. User clicks link.
 * 2. Program event handler prepares new destination:
 *          know our current state - get('root') => returns 11, current root
 *          look at where the link is pointing and set the link to temp - setTemp('root', 342) => sets new root
 *          get('root') => returns 11
 *          getTemp('root') => returns 342
 * 3. Event handler calls update(). State pushed onto browser history.
 *          get pushState()
 *
 *
 * 4. On change handler is invoked.
 * 5. Handler calls:
 *          get('root') => 342
 *          getOld('root') => 11
 *          getTemp('root') => 342
 *
 *
 *
 */

var macademia = macademia || {};

var MH = macademia.history = {};


var temp = {};
/*
 * Returns the parameter with the specified name.
 */
MH.get = function(name) {

    return MH.parseUrl(History.getHash())[name];


};

/*
 * Sets the parameter to the specified value.
 */
MH.setTempValue = function(name, value) {
    temp[name]=value;

};

/*
 *  Gets the state back i indices
 *
 */
MH.getOld = function(i) {
    return History.getStateByIndex(History.getCurrentIndex()-i);

};

(function ($) {
/*
 * Triggers a call to the currently installed handler.
 */
    $.fn.onUpdate = function(fn) {
    var f = function(e) {
        if(fn){
            fn.call(this);
        }
        temp = MH.parseUrl(e.target.hash);
        e.preventDefault();
        MH.update();
    };

    if ($(this).is('a')) {
        History.Adapter.bind($(this),'click',f);
    }

};
})(jQuery);

/*
 * Push the changes in temp to the history stack
 */
MH.update = function(){
    History.pushState(temp,'',MH.unparseUrl(temp));
};

/*
 * Return a hash string based on the map
 * For example:
 * map test1:test1 will be returned as
 * ?test1=test1
 */
MH.unparseUrl= function(map){
    var s="?";
    for(var key in map){
        s+=key+"="+map[key]+"&";
    }
    return s.substring(0,s.length-1);
};

/*
 * parse the hash in the url into map
 *
 */
MH.parseUrl= function(hashUrl){
    var temp=hashUrl;
    var start = temp.indexOf('?');
    temp=temp.substring(start+1);
    var hash=temp.split('&');
    var hashMap={};
    var kv={};
    for(var i =0;i<hash.length;i++){
        kv=hash[i].split('=');
        hashMap[kv[0]]=kv[1];
    }
    return hashMap;
};

//$("a").MH.onUpdate(function(){
//
//});