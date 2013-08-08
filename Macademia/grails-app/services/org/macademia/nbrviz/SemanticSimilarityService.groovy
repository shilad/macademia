package org.macademia.nbrviz

import org.codehaus.groovy.grails.commons.ConfigurationHolder

import edu.macalester.wpsemsim.sim.utils.KnownPhraseSimilarity

import org.macademia.SimilarInterestList
import edu.macalester.wpsemsim.utils.DocScore
import edu.macalester.wpsemsim.utils.DocScoreList
import org.macademia.SimilarInterest
import gnu.trove.set.hash.TIntHashSet
import org.wikapidia.sr.LocalSRMetric

class SemanticSimilarityService {
    public static final double MIN_MOST_SIMILAR_SIM = 0.5

    def interestService
    def wikAPIdiaService

    SimilarInterestList mostSimilar(int interestId, int maxResults=500, int [] validIds = null) {
        TIntHashSet validIdSet = (validIds == null) ? null : new TIntHashSet(validIds)
        SimilarInterestList res = wikAPIdiaService.getRelatedInterests(interestId, maxResults)
        res.setCount(interestService.getInterestCount(interestId as long))
        return res
    }

    double similarity(int interestId1, int interestId2) {
        if (interestId1 == interestId2) {
            return 1.0
        } else {
            return wikAPIdiaService.similarity(interestId1, interestId2)
        }
    }

    float[][] cosimilarity(int [] interestIds) {
        float [][] M = wikAPIdiaService.cosimilarity(interestIds)
        for (int i : 0..interestIds.length-1) {
            M[i][i] = 1.0f
        }
        return M
    }

    float[][] cosimilarity(int [] rowInterestIds, int [] colInterestIds) {
        float [][] M = wikAPIdiaService.cosimilarity(rowInterestIds, colInterestIds)
        for (int i : rowInterestIds.length - 1) {
            int j = colInterestIds.findIndexOf {it == rowInterestIds[i]}
            if (j >= 0) {
                M[i][j] = 1.0f
            }
        }
        return M
    }
}
