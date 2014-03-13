package org.macademia

import com.mongodb.*
import org.apache.log4j.Logger
import org.macademia.graph.EntityNamer

import javax.servlet.http.HttpServletRequest

class EntityNamerService implements EntityNamer {
    @Override
    String getInterestName(Long id) {
        return Interest.get(id).text
    }

    @Override
    String getPersonName(Long id) {
        return Person.get(id).fullName
    }
}
