package org.macademia

import gnu.trove.list.TIntList
import gnu.trove.list.array.TIntArrayList
import gnu.trove.map.TIntFloatMap
import gnu.trove.set.TIntSet
import gnu.trove.set.hash.TIntHashSet
import groovyx.gpars.GParsPool
import org.sr.ClusterMapBuilder
import org.sr.InterestModel
import org.sr.UserModel
import org.wikapidia.conf.Configurator
import org.wikapidia.core.cmd.Env
import org.wikapidia.core.cmd.EnvBuilder
import org.wikapidia.core.dao.LocalPageDao
import org.wikapidia.core.lang.Language
import org.wikapidia.core.lang.LocalId
import org.wikapidia.core.lang.LocalString
import org.wikapidia.core.model.LocalPage
import org.wikapidia.sr.MonolingualSRMetric
import org.wikapidia.sr.SRBuilder
import org.wikapidia.sr.disambig.Disambiguator
import org.wikapidia.sr.vector.VectorBasedMonoSRMetric
import org.wikapidia.utils.WpIOUtils

class WikAPIdiaService {
    Env env;
    Configurator configurator
    VectorBasedMonoSRMetric metric
    Language lang = Language.getByLangCode("simple");
    int [] conceptSpace
    InterestModel interests
    UserModel users
    ClusterMapBuilder clusterer

    def init() {
        this.env = new EnvBuilder().setConfigFile("grails-app/conf/macademia-wikapidia.conf").build();
        this.configurator = env.configurator;
        this.metric = configurator.get(MonolingualSRMetric.class, "macademia", "language", lang.langCode) as VectorBasedMonoSRMetric

        TIntList conceptList = new TIntArrayList();
        getConceptPath().eachLine { conceptList.add(it as int)}
        conceptSpace = conceptList.toArray()
        interests = new InterestModel(new File("fastSr"))
        users = new UserModel(interests, new File("fastSr"))
        clusterer = new ClusterMapBuilder(interests, users)

        println("adding users")
        Person.list().each({
            Person p ->
                users.addUser(p.id, p.interests*.id)
        })
        users.rebuildModel()
        println("finished adding users")
    }

    /**
     * This cannot be run while Macademia is running or this will fail!
     */
    def buildSr() {
        this.env = new EnvBuilder().setConfigFile("grails-app/conf/macademia-wikapidia.conf").build();
        this.configurator = this.env.configurator;
        buildConcepts()
        SRBuilder builder = new SRBuilder(this.env, "macademia")
        builder.setDeleteExistingData(false)
        builder.setSkipBuiltMetrics(true)
        builder.setValidMostSimilarIds(calculateValidMostSimilarIds())
        builder.build()
    }

    def calculateValidMostSimilarIds() {
        TIntSet valid = new TIntHashSet()
        Interest.all*.id.each { Long it ->  valid.add((int)it); }
        return valid
    }

    File getConceptPath() {
        return new File(env.configuration.get().getString("sr.concepts.macademia"), lang.langCode + ".txt")
    }

    def buildConcepts() {
        for (Interest i : Interest.all) {
            resolveToPage(i)
        }

        Map<Integer, Integer> counts = new HashMap<Integer, Integer>()
        for (Person p : Person.list()) {
            for (Interest i : p.interests) {
                if (i.articleId != null) {
                    counts[i.articleId as Integer] = counts.get(i.articleId as Integer, 0) + 1
                }
            }
        }

        getConceptPath().getParentFile().mkdirs()
        FileWriter writer = new FileWriter(getConceptPath())
        TIntList conceptList = new TIntArrayList()
        for (int pageId : counts.keySet()) {
            if (counts[pageId] >= 2) {
                conceptList.add(pageId)
                writer.write(pageId + "\n")
            }
        }
        writer.close()

        this.conceptSpace = conceptList.toArray()

        log.info("Created concept space with " + conceptSpace.size() + " ids")
    }


    def buildInterests() {
        GParsPool.withPool {
            Interest.all*.id.eachParallel { Long id ->
                Interest.withNewSession {
                    Interest i = Interest.get(id)
                    try {
                        resolveToPage(i)
                        updateSrVector(i)
                    } catch (Exception e) {
                        log.warn("processing of interest ${i} failed:", e)
                    }
                }
            }
        }
    }

    def buildSRCache() {
        interests = new InterestModel()
        for (Interest i : Interest.list()) {
            addInterest(i)
        }
        interests.rebuildModel()
        Person.list().each({
            Person p ->
                p.interests*.id.each( {
                    interests.incrementCount(it)
                })
        })

        interests.write(new File("fastSr"))
    }

    def resolveToPage(Interest i) {
        Disambiguator dab = env.getConfigurator().get(Disambiguator.class)
        LocalPageDao lpDao = env.getConfigurator().get(LocalPageDao.class)

        Set<LocalString> context = new HashSet<LocalString>()
        for (Person p : i.people) {
            for (Interest i2 : p.interests) {
                context.add(new LocalString(lang, i2.text))
            }
        }

        LocalId pageIdDumb = dab.disambiguateTop(new LocalString(lang, i.text), null)
        LocalId pageId = dab.disambiguateTop(new LocalString(lang, i.text), context)
        if (pageId != pageIdDumb) {
            LocalPage page1 = lpDao.getById(lang, pageIdDumb.id)
            LocalPage page2 = lpDao.getById(lang, pageId.id)
            log.warn("for interest ${i.text} disagreement between ${page1?.title} and ${page2?.title}")
        }

        i.articleId = null
        i.articleName = null
        if (pageId != null) {
            LocalPage page = lpDao.getById(lang, pageId.id)
            if (page != null) {
                i.articleId = pageId.id
                i.articleName = page.title.canonicalTitle
                log.warn("resolved ${i.text} to ${i.articleName}")
            }
        }
        i.save(flush : true)
    }

    def updateSrVector(Interest i) {
        TIntFloatMap vector = metric.getPhraseVector(i.text)
        if (vector == null) {
            i.vector = null
        } else {
            float [] denseVector = new float[conceptSpace.length];
            for (int j = 0; j < conceptSpace.length; j++) {
                int conceptId = conceptSpace[j];
                if (vector.containsKey(conceptId)) {
                    denseVector[j] = vector.get(conceptId)
                }
            }
            i.vector = WpIOUtils.objectToBytes(denseVector)
        }
        i.save(flush:true)
    }

    def addInterest(Interest i) {
        if (i.vector != null) {
            try {
//                System.err.println("vector is " + (float [])WpIOUtils.bytesToObject(i.vector));
                interests.addItemVector(i.id, (float [])WpIOUtils.bytesToObject(i.vector))
            } catch (StreamCorruptedException e) {
                log.warn("Invalid vector for interest ${i}" )
            }
        }
    }

    SimilarInterestList getRelatedInterests(Long id, int maxResults) {
        return interests.mostSimilarItems(id, maxResults)
    }

    float[][] cosimilarity(int [] interestIds) {
        float [][] result = new float[interestIds.length][interestIds.length]
        for (int i = 0; i < result.length; i++) {
            for (int j = 0; j < result[i].length; j++) {
                result[i][j] = interests.similarity(interestIds[i], interestIds[j])
            }
        }
        System.out.println("result is " + result);
        return result
    }

    float[][] cosimilarity(int [] rowInterestIds, int [] colInterestIds) {
        float [][] result = new float[rowInterestIds.length][colInterestIds.length]
        for (int i = 0; i < result.length; i++) {
            for (int j = 0; j < result[i].length; j++) {
                result[i][j] = interests.similarity(rowInterestIds[i], colInterestIds[j])
            }
        }
        return result
    }
}