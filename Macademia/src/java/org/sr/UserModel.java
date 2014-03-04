package org.sr;

import org.wikapidia.sr.SRResultList;
import org.wikapidia.sr.utils.Leaderboard;
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

    private final InterestModel interests;

    /**
     * Normalizer for similarity score for items
     */
    private SimilarityScorer scorer = null;
    private VectorNormalizer normalizer = null;

    /**
     * Vectors for each user.
     */
    Map<Long, float[]> vectors = new HashMap<Long, float[]>();

    /**
     * Creates a new SR calculator
     */
    public UserModel(InterestModel interests, File dir) throws IOException {
        this.interests = interests;
        read(dir);
    }

    /**
     * Reads all data from a particular directory.
     * @param dir
     * @return
     * @throws java.io.IOException
     */
    public boolean read(File dir) throws IOException {
        File pathVectors = new File(dir, "userVectors");
        File pathNormalizer = new File(dir, "userNormalizer");
        File pathScorer = new File(dir, "scorer");

        if (dir.isDirectory() && pathVectors.isFile() && pathNormalizer.exists() && pathScorer.exists()) {
            LOG.warning("reading user model from " + dir);
            vectors = (Map<Long, float[]>) WpIOUtils.readObjectFromFile(pathVectors);
            normalizer = new VectorNormalizer(pathNormalizer);
            scorer = new SimilarityScorer(pathScorer);
            return true;
        }  else {
            LOG.warning("directory " + dir + " does not exist");
            return false;
        }
    }

    /**
     * Writes the current state to a directory.
     * @param dir
     * @throws java.io.IOException
     */
    public void write(File dir) throws IOException {
        LOG.warning("writing superfast sr to " + dir);
        dir.mkdirs();
        WpIOUtils.writeObjectToFile(new File(dir, "userVectors"), vectors);
        scorer.write(new File(dir, "scorer"));
        normalizer.write(new File(dir, "userNormalizer"));
    }

    /**
     * Adds a user to the internal representation of the
     * @param id
     * @param interestIds
     */
    public void addUser(Long id, Collection<Long> interestIds) {
        int numKnownInterests = 0;
        float vector[] = new float[interests.getNumCols()];
        for (Long iid : interestIds) {
            float interestv[] = interests.getVector(iid);
            if (interestv != null) {
                numKnownInterests++;
                for (int i = 0; i < interestv.length; i++) {
                    vector[i] += interestv[i];
                }
            }
        }
        if (numKnownInterests > 0) {
            VectorUtils.makeUnitVector(vector);
            vectors.put(id, vector);
        }
    }
    /**
     * Returns the feature vector associated with a particular user.
     * @param id
     * @return
     */
    public float[] getVector(int id) {
        return getVector((long) id);
    }

    /**
     * Returns the feature vector associated with a particular user.
     * @param id
     * @return
     */
    public float[] getVector(Long id) {
        return vectors.get(id);
    }

    public SRResultList mostSimilarUsers(Long userId, int numResults) {
        float [] target = getVector(userId);
        if (target == null) {
            return null;
        }
        return mostSimilarUsers(target, numResults);
    }

    public SRResultList mostSimilarUsers(float vector[], int numResults) {
        Leaderboard leaderboard = new Leaderboard(numResults);
        for (Map.Entry<Long, float[]> entry : vectors.entrySet()) {
            double sim = scorer.similarity(vector, entry.getValue());
            leaderboard.tallyScore(entry.getKey().intValue(), sim);
        }
        SRResultList results = leaderboard.getTop();
        results.sortDescending();
        return results;
    }

    public void rebuildModel() {
        if (vectors.isEmpty()) {
            System.err.println("Cannot finalize user vectors: There are none.");
            return;
        }
        LOG.info("normalizing user vectors");
        normalizer = new VectorNormalizer(vectors.values());
        for (float [] v : vectors.values()) {
            normalizer.normalize(v);
        }

        LOG.info("building user similarity scorer");
        this.scorer = new SimilarityScorer(vectors.values());
    }

    /**
     * Returns the similarity between two user vectors.
     * @param user1
     * @param user2
     * @return
     */
    public double similarity(float user1[], float user2[]) {
        return scorer.similarity(user1, user2);
    }
}
