package org.macademia

class JsonObject {

    long pid //id of the person
    long id
    String first
    String second
    String sharedInterest
    Map<Long, JsonObject> adjacencies = [:]

    static constraints = {
        id(unique: true)

    }

    /*
      json representation of object gets returned by toString.  
     */

    public String toString() {
        //println("id:'$id' pid:'$pid' first:'$first' second:'$second' sharedInterest: '$sharedInterest'")
        String json = '"id":"' + id + '","name":"' + second + '","adjacencies":['
        for (each in adjacencies) {
            json + '"{nodeTo":"' + it.id + '","data":{"sharedInterest":"' + it.sharedInterest + '}"}'
        }
        println(json)
        return (json)
    }
}
