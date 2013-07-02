/**
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
    alert(MH.parseUrl(History.getHash()).name);

    return MH.parseUrl(History.getHash()).name;


};

/*
 * Sets the parameter to the specified value.
 */
MH.setTemp = function(name, value) {
    temp.name=value;
    //temp.data=parseUrl(value);
};

/*
 *
 *
 */
MH.getOld = function() {
    return History.getStateByIndex(History.getCurrentIndex()-1);

};

/*
 * Triggers a call to the currently installed handler.
 */
MH.update = function() {

    History.pushState([],'','http://localhost:8080/Macademia/all/person/test/#/?test=test&test2=test2');
};
 //http://localhost:8080/Macademia/all/person/test/#/?test=test&test2=test2
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
}
