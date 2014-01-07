package org.macademia

import org.semtag.dao.DaoException
import org.semtag.dao.DaoFilter
import org.semtag.dao.SaveHandler
import org.semtag.dao.TagAppDao
import org.semtag.mapper.ConceptMapper
import org.semtag.model.Item
import org.semtag.model.Tag
import org.semtag.model.TagApp
import org.semtag.model.TagAppGroup
import org.semtag.model.User
import org.semtag.sim.ItemSimilar
import org.semtag.sim.SimilarResult
import org.semtag.sim.SimilarResultList
import org.semtag.sim.TagAppSimilar
import org.wikapidia.conf.Configurator
import org.wikapidia.core.cmd.Env
import org.wikapidia.core.cmd.EnvBuilder
import org.wikapidia.core.dao.LocalPageDao

import java.sql.Timestamp

class WikAPIdiaService {
    Env env;
    Configurator configurator
    LocalPageDao localPageDao
    ConceptMapper conceptMapper
    TagAppDao tagAppDao
    ItemSimilar itemSimilarity
    TagAppSimilar tagAppSimilarity
    SaveHandler handler

    Map<String, Long> tagToId = [:]
    Map<Long, String> idToTag = [:]

    def init() {
        env = new EnvBuilder().setConfigFile("grails-app/conf/semtag.conf").build();
        this.configurator = env.configurator;
        localPageDao = configurator.get(LocalPageDao.class)
        tagAppDao = configurator.get(TagAppDao.class)
        itemSimilarity = configurator.get(ItemSimilar.class)
        tagAppSimilarity = configurator.get(TagAppSimilar.class)
        conceptMapper = configurator.get(ConceptMapper.class)
        handler = configurator.get(SaveHandler.class)

        load()

        for (Interest i : Interest.list()) {
            addInterest(i)
        }
    }

    def load() {
        handler.clear()
        handler.beginLoad()
        for (Person p : Person.list()) {
            for (Interest i : p.interests) {
                Tag tag = new Tag(i.text);
                if (tag.isValid()) {
                    TagApp tagApp = conceptMapper.map(
                            new User(p.id.toString()),
                            tag,
                            new Item(p.id.toString()),
                            new Timestamp(System.currentTimeMillis()));
                    try {
                        handler.save(tagApp);
                    } catch (DaoException e) {
                        log.fatal("save of tag app for ${p.email}, ${i.text} failed: ", e)
                    }
                }
            }
        }
        handler.endLoad()
    }

    def addInterest(Interest i) {
        tagToId[i.text] = i.id
        idToTag[i.id] = i.text
    }

    def getIdForInterest(String interest) {
        return tagToId[interest]
    }

    def getInterestForId(Long id) {
        return idToTag[id]
    }

    Map<String, Double> getConcepts(String text) {

    }

    SimilarInterestList getRelatedInterests(Long id, int maxResults) {
        String tag = getInterestForId(id)
        if (tag == null) {
            log.warn("unresolveable interest id: $tag")
            return new SimilarInterestList()
        }
        SimilarResultList tags = tagAppSimilarity.mostSimilar(getTagAppForId(id), maxResults)
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
        TagApp app1 = getTagAppForId(id1)
        TagApp app2 = getTagAppForId(id2)
        if (app1 == null || app2 == null) {
            return 0.0
        }
        return tagAppSimilarity.similarity(app1, app2)
    }

    TagApp getTagAppForId(Long id) {
        String tag1 = getInterestForId(id)
        if (tag1 == null) {
            log.warn("unresolveable interest id: $id")
            return null
        }
        TagAppGroup group1 = tagAppDao.getGroup(new DaoFilter().setTag(new Tag(tag1)))
        if (group1.size() == 0) {
            log.warn("no tag apps for tag: $tag1")
            return null
        }
        return group1.iterator().next()
    }

    float[][] cosimilarity(int [] interestIds) {
        TagApp[] apps = new TagApp[interestIds.length]
        for (int i = 0; i < interestIds.length; i++) {
            apps[i] = getTagAppForId(interestIds[i])
        }
        double [][] cosim = tagAppSimilarity.cosimilarity(apps)
        float [][] result = new float[apps.length][apps.length]
        for (int i = 0; i < cosim.length; i++) {
            for (int j = 0; j < cosim[i].length; j++) {
                result[i][j] = cosim[i][j] as float
            }
        }
        return result
    }

    float[][] cosimilarity(int [] rowInterestIds, int [] colInterestIds) {
        TagApp[] rowApps = new TagApp[rowInterestIds.length]
        for (int i = 0; i < rowInterestIds.length; i++) {
            rowApps[i] = getTagAppForId(rowInterestIds[i])
        }
        TagApp[] colApps = new TagApp[colInterestIds.length]
        for (int i = 0; i < colInterestIds.length; i++) {
            colApps[i] = getTagAppForId(colInterestIds[i])
        }
        double [][] cosim = tagAppSimilarity.cosimilarity(rowApps, colApps)
        float [][] result = new float[rowApps.length][colApps.length]
        for (int i = 0; i < cosim.length; i++) {
            for (int j = 0; j < cosim[i].length; j++) {
                result[i][j] = cosim[i][j] as float
            }
        }
        return result
    }
}