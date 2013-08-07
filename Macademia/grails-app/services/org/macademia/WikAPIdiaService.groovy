package org.macademia

import org.semtag.dao.TagAppDao
import org.semtag.model.Tag
import org.semtag.sim.ConceptSimilarity
import org.semtag.sim.ItemSimilarity
import org.semtag.sim.SimilarResult
import org.semtag.sim.SimilarResultList
import org.semtag.sim.TagAppSimilarity
import org.wikapidia.conf.Configuration
import org.wikapidia.conf.Configurator
import org.wikapidia.core.dao.LocalPageDao

class WikAPIdiaService {
    Configurator configurator
    LocalPageDao localPageDao
    TagAppDao tagAppDao
    ItemSimilarity itemSimilarity
    TagAppSimilarity tagAppSimilarity

    Map<String, Long> tagToId = [:]
    Map<Long, String> idToTag = [:]

    def init() {
        Configuration conf = new Configuration(new File("grails-app/conf/semtag.conf"))
        this.configurator = new Configurator(conf)
        localPageDao = configurator.get(LocalPageDao.class)
        tagAppDao = configurator.get(TagAppDao.class)
        itemSimilarity = configurator.get(ItemSimilarity.class)
        tagAppSimilarity = configurator.get(TagAppSimilarity.class)

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

    SimilarInterestList getRelatedInterests(Long id, int maxResults) {
        String tag = getInterestForId(id)
        if (tag == null) {
            log.warn("unresolveable interest id: $interestId")
            return new SimilarInterestList()
        }
        SimilarResultList tags = tagAppSimilarity.mostSimilar(new Tag(tag), maxResults)
        List<SimilarInterest> result = []
        for (SimilarResult sr : tags) {
            Long interestId = getIdForInterest(sr.stringId)
            if (interestId == null) {
                log.warn("unresolveable interest string: ${sr.stringId}")
            } else {
                result.add(new SimilarInterest(interestId, sr.value))
            }
        }
        return new SimilarInterestList(result)
    }

    double similarity(Long id1, Long id2) {

    }
}