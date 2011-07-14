package org.macademia

import grails.converters.JSON

/**
 * Useful for faking services that require a good bit of time in grails
 */
class DiskMap {
    File file = null
    Map<String, Object> cache = [:]

    public DiskMap(File f) {
        if (!f.exists()) {
            f.write("") // touch the file
        }
        file = f
        file.eachLine {
            def pair = JSON.parse(it)
            cache[pair[0]] = pair[1]
        }
    }

    public boolean contains(Object key) {
        return cache.containsKey(key)
    }
    
    public Object get(Object key) {
        return cache.get(key)
    }

    public void put(Object key, Object value) {
        cache[key] = value
        String json = ([key, value] as JSON)
        json.replace('\n', ' ')
        json.replace('\r', ' ')
        file.append(json + "\n")
    }
}
