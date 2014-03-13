package org.sr;

import gnu.trove.list.TIntList;
import gnu.trove.list.array.TIntArrayList;
import gnu.trove.map.TLongObjectMap;
import gnu.trove.map.hash.TLongObjectHashMap;
import gnu.trove.set.TIntSet;
import gnu.trove.set.TLongSet;
import gnu.trove.set.hash.TIntHashSet;
import gnu.trove.set.hash.TLongHashSet;
import org.macademia.SimilarInterest;
import org.macademia.graph.ClusterMap;
import org.macademia.graph.NodeType;
import org.wikapidia.sr.SRResultList;

import java.util.*;

/**
 * @author Shilad Sen
 */
public class ClusterMapBuilder {
    private final UserModel users;
    private final InterestModel interests;
    private int numClusters = 3;
    private int childrenPerCluster = 7;

    public ClusterMapBuilder(InterestModel interests, UserModel users) {
        this.interests = interests;
        this.users = users;
    }

    /**
     * Attempts to find a set of roots that best span the neighborhood.
     * @param candidates
     * @param neighbors
     * @return
     */
    private TIntList spanNeighborhood(TIntList candidates, SRResultList neighbors, int numInterests) {
        double bestUserSim[] = new double[neighbors.numDocs()];
        Arrays.fill(bestUserSim, -1.0);
        TIntList roots = new TIntArrayList();
        while (roots.size() < numInterests) {
            int bestCandidate = -1;
            double bestChange = Double.NEGATIVE_INFINITY;
            for (int c : candidates.toArray()) {
                if (roots.contains(c))  continue;
                float v1[] = interests.getVector(c);
                if (v1 == null) continue;
                double change = 0.0;
                for (int i = 0; i < neighbors.numDocs(); i++) {
                    float v2[] = users.getVector(neighbors.getId(i));
                    double sim = users.similarity(v1, v2);
                    if (sim > bestUserSim[i]) {
                        change += sim - bestUserSim[i];
                    }

                }
                if (change > bestChange) {
                    bestChange = change;
                    bestCandidate = c;
                }
            }
            if (bestCandidate < 0 || bestChange == 0.0) {
                break;
            }
            System.out.println("selected " + bestCandidate + " with " + bestChange);
            roots.add(bestCandidate);

            float v1[] = interests.getVector(bestCandidate);
            for (int i = 0; i < neighbors.numDocs(); i++) {
                float v2[] = users.getVector(neighbors.getId(i));
                double sim = users.similarity(v1, v2);
                bestUserSim[i] = Math.max(bestUserSim[i], sim);
            }
        }
        return roots;
    }

    /**
     * Returns the cluster map for a person-centric graph.
     *
     * @param personId
     * @param interestIds - The person's interests
     * @return
     */
    public ClusterMap getPersonClusterMap(long personId, TIntList interestIds) {
        float vector[] = users.getVector(personId);
        if (vector == null) {
            throw new IllegalArgumentException("Unknown person: " + personId);
        }
        ClusterMap cmap = new ClusterMap(NodeType.PERSON, personId);
        return getClusterMap(vector, cmap, interestIds);
    }

    /**
     * Returns the cluster map for an interest-centric graph.
     *
     * @param interestId
     * @return
     */
    public ClusterMap getInterestClusterMap(long interestId) {
        float vector[] = interests.getVector(interestId);
        if (vector == null) {
            throw new IllegalArgumentException("Unknown interest: " + interestId);
        }
        TIntList candidates = new TIntArrayList();
        for (SimilarInterest i : interests.mostSimilarItems(interestId, 200)) {
            candidates.add((int) i.getInterestId());
        }
        ClusterMap cmap = new ClusterMap(NodeType.INTEREST, interestId);
        return getClusterMap(vector, cmap, candidates);
    }

    /**
     * Given a query vector and a list of possible cluster roots, calculate the cluster map.
     *
     * @param queryVector
     * @param cmap
     * @param rootCandidates
     * @return
     */
    private ClusterMap getClusterMap(float[] queryVector, ClusterMap cmap, TIntList rootCandidates) {
        // Calculate the cluster roots
        SRResultList neighbors = users.mostSimilarUsers(queryVector, 200);
        TIntList clusterRoots = spanNeighborhood(rootCandidates, neighbors, numClusters);
        for (int id : clusterRoots.toArray()) {
            cmap.addClusterRoot(id);
        }

        // Get similar lists for each cluster root, merge them into a single set
        TLongSet mostSimilar = new TLongHashSet();
        for (long rootId : cmap.getClusterRootIds().toArray()) {
            for (SimilarInterest i : interests.mostSimilarItems(rootId, 50)) {
                mostSimilar.add(i.getInterestId());
            }
        }

        // Calculate the cosimilarity matrix between similar interests (rows) and roots (cols)
        long rows[] = mostSimilar.toArray();
        long cols[] = cmap.getClusterRootIds().toArray();
        float cosim[][] = interests.cosimilarity(rows, cols);


        // merge them to find closest root for each related root
        TLongObjectMap<TIntSet> closest = new TLongObjectHashMap<TIntSet>();
        for (long l : cols) { closest.put(l, new TIntHashSet()); }
        for (int i = 0; i < rows.length; i++) {
            int j = VectorUtils.maxIndex(cosim[i]);
            closest.get(cols[j]).add((int) rows[i]);
        }

        // Pick the members for each cluster root
        for (long rootId : cols) {
            float rootv[] = interests.getVector(rootId);
            neighbors = users.mostSimilarUsers(rootv, 50);
            TIntList members = spanNeighborhood(
                    new TIntArrayList(closest.get(rootId).toArray()),
                    neighbors, childrenPerCluster);
            for (long childId : members.toArray()) {
                cmap.addClusterMember(rootId, childId);
            }
        }

        return cmap;
    }

    private double popularityBonus(int id) {
        return Math.log(1 + Math.log(4 + interests.getCount(id)));
    }

    private TIntList pickClusterChildren(int rootId, TIntList candidates, int numChildren) {
        double bestSim[] = new double[candidates.size()];
        Arrays.fill(bestSim, -1.0);

        TIntList children = new TIntArrayList();
        while (children.size() < numChildren) {
            int bestCandidate = -1;
            double bestChange = Double.NEGATIVE_INFINITY;
            for (int c : candidates.toArray()) {
                if (children.contains(c))  continue;
                float v1[] = interests.getVector(c);
                if (v1 == null) continue;
                double change = 0.0;
                for (int i = 0; i < candidates.size(); i++) {
                    double sim = interests.similarity(c, candidates.get(i));
                    if (sim > bestSim[i]) {
                        change += sim - bestSim[i];
                    }
                }
                if (change > bestChange) {
                    bestChange = change;
                    bestCandidate = c;
                }
            }
            if (bestCandidate < 0 || bestChange == 0.0) {
                break;
            }
//            System.out.println("selected " + bestCandidate + " with " + bestChange);
            children.add(bestCandidate);

            for (int i = 0; i < candidates.size(); i++) {
                double sim = interests.similarity(bestCandidate, candidates.get(i));
                if (sim > bestSim[i]) {
                    bestSim[i] = sim;
                }
            }
        }
        return children;
    }
}
