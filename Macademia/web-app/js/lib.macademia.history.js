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
 * Returns the parameter with the specified key.
 * The value of the parameter comes from the current
 * url on the page(History.getState().hash())
 *
 * If the key does not exist, return the whole map of
 * parameters encoded in the current url.
 */
MH.get = function(key) {
    var map=MH.parseUrl(History.getState().hash);
    if (key) {
        return map[key];
    } else {
        return map;
    }
};

/*
 * Sets one temp parameter to the specified value.
 * Notice that we delete the old value first if the
 * key exists.
 */
MH.setTempValue = function(name, value) {
    if(temp[name]){
        delete temp[name];
    }
    temp[name]=value;

};

/*
 * Gets one temp parameter to the specific value.
 */
MH.getTempValue= function(name){
    return temp[name];
};

/*
 * Setter for the temp map
 */
MH.setTemp = function(map) {
    temp=map;
};

/*
 * Getter for the temp map
 */
MH.getTemp= function(){
    return temp;
};

/*
 *  Gets the previous state
 *  if the key exists,
 *  return the value according to the key
 *  if the key does not exist,
 *  return the map containing all the values
 */
MH.getOld = function(key) {

        var old = MH.parseUrl(History.getStateByIndex(History.getCurrentIndex()-1).hash);
        if (key) {
            return old[key];
        } else {
            return old;
        }
};

/*
 * Triggers a call to the currently installed handler.
 * fn will be called whenever history state changes.
 * History can be changed by the program calling MH.update()
 * or the user pressing back / forward in the browser, for example.
 */
MH.onUpdate = function(fn) {
    var f = function(e) {
//        console.log(e);
//        console.log("Getting State");
//        console.log("Getting Old");
//        console.log(MH.getOld());

        var targetMap=MH.get();
//        console.log(History.getState());
//        console.log(targetMap);
        for(var key in targetMap){
            MH.setTempValue(key,targetMap[key]);
        }

//        console.log("Temp");
//        console.log(temp);

        if(fn){

//           console.log('onupdate!');
//           console.log(History.getState());
            fn.call(this);
        }

//        console.log(temp);
    };

    History.Adapter.bind(window,'statechange',f);
//    History.Adapter.bind(window,'anchorchange',f);

};

/**
 * Installs event handlers for the anchor that merge
 * URL encoded parameters in the anchor text into the
 * current state when the text is clicked.
 *
 */
MH.bindAnchors = function(anchors) {
//    History.Adapter.bind(anchors,"click",function(e){
//        temp = MH.parseUrl(e.target.hash);
//        e.preventDefault();
//        MH.update();
//    });
    $(anchors).live("click",function(e){
//        console.log(temp);
        e.preventDefault();
        var targetMap=MH.parseUrl(e.target.hash);
        var types = ['searchBox','interestId','personId','requestId'];
        for(var i=0;i<types.length;i++){
            delete temp[types[i]];
        }
        for(var key in targetMap){
            MH.setTempValue(key,targetMap[key]);
        }

//        console.log(temp);


        MH.update();
         //after update before these logs the states become correct... FIND WHERE
//        console.log(History.getState());
//        console.log(MH.getOld());


    });
};

/*
 * Push the changes in temp to the history stack
 * using History.push method
 */
MH.update = function(){
//    console.log('pushing state ' + MH.unparseUrl(temp));  //correct
    var urlhash = MH.unparseUrl(temp);
//    console.log(urlhash);
    History.pushState(null,null,urlhash);

};

/*
 * Return a hash string based on the map
 * For example:
 * map test1:test1 will be returned as
 * ?test1=test1
 */
MH.unparseUrl= function(map){
//    console.log("unparse map");              //correct
//    console.log(map);                        //correct
    var s="?"+decodeURIComponent($.param(map));
//    console.log("Unparsed string");          //correct
//    console.log(s);                          //correct

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
        query  = hashUrl.substring(hashUrl.lastIndexOf("?")+1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
    delete urlParams._suid; //remove the suid. Otherwise, there will be a problem.
    //console.log(urlParams);
    return urlParams;
};
