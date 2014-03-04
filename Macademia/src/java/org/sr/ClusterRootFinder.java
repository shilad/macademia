package org.sr;

import org.wikapidia.sr.SRResultList;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author Shilad Sen
 */
public class ClusterRootFinder {
    private final UserModel users;
    private final InterestModel items;

    public ClusterRootFinder(InterestModel items, UserModel users) {
        this.items = items;
        this.users = users;
    }

    public List<Integer> findRoots(List<Integer> candidates, SRResultList neighbors, int numRoots) {
        double bestUserSim[] = new double[neighbors.numDocs()];
        Arrays.fill(bestUserSim, -1.0);
        List<Integer> roots = new ArrayList<Integer>();
        while (roots.size() < numRoots) {
            int bestCandidate = -1;
            double bestChange = Double.NEGATIVE_INFINITY;
            for (int c : candidates) {
                if (roots.contains(c))  continue;
                float v1[] = items.getVector(c);
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

            float v1[] = items.getVector(bestCandidate);
            for (int i = 0; i < neighbors.numDocs(); i++) {
                float v2[] = users.getVector(neighbors.getId(i));
                double sim = users.similarity(v1, v2);
                bestUserSim[i] = Math.max(bestUserSim[i], sim);
            }
        }
        return roots;
    }
}
