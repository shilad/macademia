package org.macademia

import org.semtag.dao.TagAppDao
import org.semtag.sim.ConceptSimilarity
import org.semtag.sim.ItemSimilarity
import org.wikapidia.conf.Configuration
import org.wikapidia.conf.Configurator
import org.wikapidia.core.dao.LocalPageDao

class WikAPIdiaService {
    Configurator configurator
    LocalPageDao localPageDao
    TagAppDao tagAppDao
    ItemSimilarity itemSimilarity
    ConceptSimilarity conceptSimilarity

    Map<String, Long> tagToId = [:]
    Map<Long, String> idToTag = [:]

    def init() {
        Configuration conf = new Configuration(new File("grails-app/conf/semtag.conf"))
        this.configurator = new Configurator(conf)
        localPageDao = configurator.get(LocalPageDao.class)
        tagAppDao = configurator.get(TagAppDao.class)
        itemSimilarity = configurator.get(ItemSimilarity.class)
        conceptSimilarity = configurator.get(ConceptSimilarity.class)

        for (Interest i : Interest.list()) {
            addInterest(i)
        }
    }

    def addInterest(Interest i) {
        tagToId[i.normalizedText] = i.id
        idToTag[i.id] = i.normalizedText
    }

    def getIdForInterest(String interest) {
        return tagToId[Interest.normalize(interest)]
    }

    def getInterestForId(Long id) {
        return idToTag[id]
    }
    def serviceMethod() {
    }
}
