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

//  I am not sure whether I should use the current one or temp
//  I think we should use temp
    return MH.parseUrl(History.getHash())[name];
//    return temp[name];


};

/*
 * Sets the parameter to the specified value.
 */
MH.setTempValue = function(name, value) {

    temp[name]=value;

};
MH.setTemp = function(map) {
    temp=map;
};
MH.getTemp= function(){
    return temp;
};
MH.getTempValue= function(name){
    return temp[name];
};
/*
 *  Gets the state back i indices
 *
 */
MH.getOld = function(i) {
    return History.getStateByIndex(History.getCurrentIndex()-i);

};

/*
 * Triggers a call to the currently installed handler.
 * fn will be called whenever history state changes.
 * History can be changed by the program calling MH.update()
 * or the user pressing back / forward in the browser, for example.
 */
MH.onUpdate = function(fn) {
    var f = function(e) {
        console.log(e);
//        MH.init();
        if(fn){
            fn.call(this);
        }
    };

    History.Adapter.bind(window,'statechange',f);
//    History.Adapter.bind(window,'anchorchange',f);

};

/**
 * Installs event handlers for the anchor that merge
 * URL encoded parameters in the anchor text into the
 * current state when the text is clicked.
 *
 * @param anchors
 */
MH.bindAnchors = function(anchors) {
//    History.Adapter.bind(anchors,"click",function(e){
//        temp = MH.parseUrl(e.target.hash);
//        e.preventDefault();
//        MH.update();
//    });
    $(document).on("click",$(anchors),function(e){
        console.log(temp);
        e.preventDefault();
        temp = MH.parseUrl(e.target.hash);
        MH.update();



    });
};

/*
 * Push the changes in temp to the history stack
 */
MH.update = function(){
    History.pushState(temp,'',MH.unparseUrl(temp));
//    MH.setTemp(MH.parseUrl(History.getHash()));
};

/*
 * Return a hash string based on the map
 * For example:
 * map test1:test1 will be returned as
 * ?test1=test1
 */
MH.unparseUrl= function(map){
    var s="?"+decodeURIComponent($.param(map));
    return s;
};

/*
 * parse the hash in the url into map
 *
 */
MH.parseUrl= function(hashUrl){
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = hashUrl.substring(hashUrl.indexOf("?")+1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
    //console.log(urlParams);
    return urlParams;
};

MH.init = function(){
    MH.setTemp({
    nodeId:'p_1',
    navVisibility:'true',
    navFunction:'search',
    institutions:'all',
    searchBox:null,
    interestId:null,
    personId:null,
    requestId:null,
    searchPage:null,
    density:null
});

};