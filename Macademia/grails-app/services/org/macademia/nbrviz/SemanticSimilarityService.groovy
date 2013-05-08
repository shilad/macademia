package org.macademia.nbrviz

import org.codehaus.groovy.grails.commons.ConfigurationHolder

import edu.macalester.wpsemsim.sim.utils.KnownPhraseSimilarity

import org.macademia.SimilarInterestList
import edu.macalester.wpsemsim.utils.DocScore
import edu.macalester.wpsemsim.utils.DocScoreList
import org.macademia.SimilarInterest
import gnu.trove.set.hash.TIntHashSet

class SemanticSimilarityService {
    KnownPhraseSimilarity metric = new KnownPhraseSimilarity(
            new File((String)ConfigurationHolder.config.macademia.similarityDir)
    )

    SimilarInterestList mostSimilar(int interestId, int maxResults, int [] validIds = null) {
        TIntHashSet validIdSet = (validIds == null) ? null : new TIntHashSet(validIds)
        DocScoreList top = metric.mostSimilar(interestId, maxResults, validIdSet)
        List<SimilarInterest> sil = []
        for (DocScore ds : top) {
            sil.add(new SimilarInterest(ds.id, ds.score))
        }
        return new SimilarInterestList(sil)
    }

    double similarity(int interestId1, int interestId2) {
        return metric.similarity(interestId1, interestId2)
    }

    float[][] cosimilarity(int [] interestIds) {
        return metric.cosimilarity(interestIds)
    }
}
