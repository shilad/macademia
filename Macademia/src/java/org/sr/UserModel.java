package org.sr;

import gnu.trove.list.TFloatList;
import gnu.trove.list.TLongList;
import gnu.trove.list.array.TFloatArrayList;
import gnu.trove.list.array.TLongArrayList;
import gnu.trove.map.TLongIntMap;
import gnu.trove.map.hash.TLongIntHashMap;
import org.macademia.SimilarInterest;
import org.macademia.SimilarInterestList;
import org.wikapidia.sr.SRResult;
import org.wikapidia.sr.SRResultList;
import org.wikapidia.sr.normalize.Normalizer;
import org.wikapidia.sr.normalize.PercentileNormalizer;
import org.wikapidia.sr.utils.Leaderboard;
import org.wikapidia.utils.MathUtils;
import org.wikapidia.utils.ParallelForEach;
import org.wikapidia.utils.Procedure;
import org.wikapidia.utils.WpIOUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.logging.Logger;

/**
 *
 * Provides fast access to the basic underlying semantic similarity algorithms
 *
 * @author Shilad Sen
 */
public class UserModel {
    private static final Logger LOG = Logger.getLogger(UserModel.class.getName());
    private final ItemModel item;

    /**
     * Normalizer for similarity score for users
     */
    private Normalizer userNormalizer = null;

    /**
     * Vectors for each user.
     */
    Map<Long, float[]> userVectors = new HashMap<Long, float[]>();

    /**
     * Creates a new SR calculator
     */
    public UserModel(ItemModel item, File dir) throws IOException {
        this.item = item;
        read(dir);
    }

    /**
     * Reads all data from a particular directory.
     * @param dir
     * @return
     * @throws java.io.IOException
     */
    public boolean read(File dir) throws IOException {
        if (!dir.isDirectory()) {
            LOG.warning("directory " + dir + " does not exist");
            return false;
        }
        LOG.warning("reading user model from " + dir);
        return true;
    }

    /**
     * Writes the current state to a directory.
     * @param dir
     * @throws java.io.IOException
     */
    public void write(File dir) throws IOException {
        LOG.warning("writing superfast sr to " + dir);
        dir.mkdirs();
    }

    /**
     * Adds a user to the internal representation of the
     * @param id
     * @param interestIds
     */
    public void addUser(Long id, Collection<Long> interestIds) {
        int numKnownInterests = 0;
        float vector[] = new float[item.getNumCols()];
        for (Long iid : interestIds) {
            float itemv[] = item.getVector(iid);
            if (itemv != null) {
                numKnownInterests++;
                for (int i = 0; i < itemv.length; i++) {
                    vector[i] += itemv[i];
                }
            }
        }
        if (numKnownInterests > 0) {
            VectorUtils.makeUnitVector(vector);
            userVectors.put(id, vector);
        }
    }

    public float[] getUserVector(Long id) {
        return userVectors.get(id);
    }

    public SRResultList mostSimilarUsers(Long userId, int numResults) {
        float [] target = getUserVector(userId);
        if (target == null) {
            return null;
        }
        return mostSimilarUsers(target, numResults);
    }

    public SRResultList mostSimilarUsers(float vector[], int numResults) {
        Leaderboard leaderboard = new Leaderboard(numResults);
        for (Map.Entry<Long, float[]> entry : userVectors.entrySet()) {
            double sim = normalizeUser(VectorUtils.dot(vector, entry.getValue()));
            leaderboard.tallyScore(entry.getKey().intValue(), sim);
        }
        SRResultList results = leaderboard.getTop();
        results.sortDescending();
        return results;
    }

    private double normalizeUser(double x) {
        if (userNormalizer == null) {
            return x;
        } else if (MathUtils.isReal(x)) {
            return Math.pow(userNormalizer.normalize(x), 3);
        } else {
            return 0.0;
        }
    }

    private void normalizeVectors(Collection<float []> vectors) {
        if (vectors.size() == 0) {
            return;
        }
        int numCols = item.getNumCols();

        // row makeUnitVector
        for (float v[] : vectors) {
            VectorUtils.makeUnitVector(v);
        }

        // mean adjust
        double colMeans[] = new double[numCols];
        for (float v[] : vectors) {
            for (int i = 0; i < numCols; i++) {
                colMeans[i] += v[i];
            }
        }
        for (int i = 0; i < numCols; i++) {
            colMeans[i] /= vectors.size();
        }
        for (float v[] : vectors) {
            for (int i = 0; i < numCols; i++) {
                v[i] -= colMeans[i];
            }
        }

        // z-score adjust
        double colDevs[] = new double[numCols];
        for (float v[] : vectors) {
            for (int i = 0; i < numCols; i++) {
                colDevs[i] += v[i] * v[i];
            }
        }
        for (int i = 0; i < numCols; i++) {
            colDevs[i] = Math.sqrt(colDevs[i] / vectors.size());
        }
        for (float v[] : vectors) {
            for (int i = 0; i < numCols; i++) {
                v[i] /= colDevs[i];
            }
        }

        // row makeUnitVector once more
        for (float v[] : vectors) {
            VectorUtils.makeUnitVector(v);
        }
    }

    public List<Integer> findRoots(List<Integer> candidates, SRResultList users, int numRoots) {
        double bestUserSim[] = new double[users.numDocs()];
        Arrays.fill(bestUserSim, -1.0);
        List<Integer> roots = new ArrayList<Integer>();
        while (roots.size() < numRoots) {
            int bestCandidate = -1;
            double bestChange = Double.NEGATIVE_INFINITY;
            for (int c : candidates) {
                if (roots.contains(c))  continue;
                float v1[] = item.getVector(c);
                if (v1 == null) continue;
                double change = 0.0;
                for (int i = 0; i < users.numDocs(); i++) {
                    float v2[] = getUserVector((long) users.getId(i));
                    double sim = normalizeUser(VectorUtils.dot(v1, v2));
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

            float v1[] = item.getVector(bestCandidate);
            for (int i = 0; i < users.numDocs(); i++) {
                float v2[] = getUserVector((long)users.getId(i));
                double sim = normalizeUser(VectorUtils.dot(v1, v2));
                bestUserSim[i] = Math.max(bestUserSim[i], sim);
            }
        }
        return roots;
    }

    public void normalizeUsers() {
        LOG.info("normalizing users");
        normalizeVectors(userVectors.values());
        Normalizer n = new PercentileNormalizer();

        LOG.info("calculating user normalizer");
        Random random = new Random();
        List<float[]> vectors = new ArrayList<float[]>(userVectors.values());
        for (int i = 0; i < 10000; i++) {
            float v1[] = vectors.get(random.nextInt(vectors.size()));
            float v2[] = vectors.get(random.nextInt(vectors.size()));
            n.observe(VectorUtils.dot(v1, v2));
        }
        n.observationsFinished();
        userNormalizer = n;
        LOG.info("finished calculating user normalizer: " + n.dump());
    }
}
