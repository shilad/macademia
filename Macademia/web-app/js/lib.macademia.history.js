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
    if(history.getState().data!=undefined){
        return history.getState().data.name;
    }
    else{
        //var url=history.getState().url;
        var currentHash=history.getHash();
        alert(currentHash.name);
    }

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
    return history.getStateByIndex(history.getCurrentIndex()-1);

};

/*
 * Triggers a call to the currently installed handler.
 */
MH.update = function() {
};


