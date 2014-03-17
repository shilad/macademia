package org.sr;

import gnu.trove.list.TFloatList;
import gnu.trove.list.TLongList;
import gnu.trove.list.array.TFloatArrayList;
import gnu.trove.list.array.TLongArrayList;
import gnu.trove.map.TIntIntMap;
import gnu.trove.map.TIntObjectMap;
import gnu.trove.map.TLongIntMap;
import gnu.trove.map.hash.TIntIntHashMap;
import gnu.trove.map.hash.TIntObjectHashMap;
import gnu.trove.map.hash.TLongIntHashMap;
import org.macademia.SimilarInterest;
import org.macademia.SimilarInterestList;
import org.wikapidia.sr.SRResult;
import org.wikapidia.sr.SRResultList;
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
public class InterestModel {
    private static final Logger LOG = Logger.getLogger(InterestModel.class.getName());

    /**
     * Number of columns in vector representation of users / interests
     */
    private int numCols = 0;

    /**
     * Mappings to / from sparse interest ids to dense indexes
     */
    private TLongIntMap idToIndex = new TLongIntHashMap();
    private TLongList indexToId = new TLongArrayList();

    /**
     * Number of times each interest is used.
     */
    private TIntIntMap counts = new TIntIntHashMap();

    /**
     * Normalizer for similarity score for items
     */
    private SimilarityScorer scorer = null;
    private VectorNormalizer normalizer = null;


    /**
     * Vectors for each interest
     */
    private List<float[]> vectors = new ArrayList<float[]>();

    /**
     * Cosimilarity matrix
     */
    private List<float[]> cosim = null;

    private boolean buildCosimilarity = true;

    /**
     * Creates a new SR calculator
     */
    public InterestModel() {
        buildCosimilarity = false;
    }

    /**
     * Creates a new SR calculator and reads from a particular directory.
     */
    public InterestModel(File dir) throws IOException {
        read(dir);
    }

    /**
     * Reads all data from a particular directory.
     * @param dir
     * @return
     * @throws IOException
     */
    public boolean read(File dir) throws IOException {
        if (!dir.isDirectory()) {
            LOG.warning("directory " + dir + " does not exist");
            return false;
        }
        LOG.warning("reading superfast sr from " + dir);
        File pathIdToIndex = new File(dir, "idToIndex");
        File pathIndexToId = new File(dir, "indexToId");
        File pathVectors = new File(dir, "interestVectors");
        File pathCosim = new File(dir, "cosim");
        File pathNormalizer = new File(dir, "interestNormalizer");
        File pathScorer = new File(dir, "interestScorer");
        File pathCounts = new File(dir, "interestCounts");
        if (pathCosim.isFile() && pathIndexToId.isFile() && pathIdToIndex.isFile() && pathVectors.exists() && pathNormalizer.exists() && pathCounts.isFile()) {
            idToIndex = (TLongIntMap) WpIOUtils.readObjectFromFile(pathIdToIndex);
            indexToId = (TLongList) WpIOUtils.readObjectFromFile(pathIndexToId);
            cosim = (List<float[]>) WpIOUtils.readObjectFromFile(pathCosim);
            vectors = (List<float[]>) WpIOUtils.readObjectFromFile(pathVectors);
            normalizer = new VectorNormalizer(pathNormalizer);
            scorer = new SimilarityScorer(pathScorer);
            counts = (TIntIntMap) WpIOUtils.readObjectFromFile(pathCounts);
            if (!vectors.isEmpty()) {
                numCols = vectors.get(0).length;
            }
            return true;
        } else {
            LOG.warning("no valid interest model in " + dir);
            return false;
        }
    }

    /**
     * Writes the current state to a directory.
     * @param dir
     * @throws IOException
     */
    public void write(File dir) throws IOException {
        LOG.warning("writing superfast sr to " + dir);
        dir.mkdirs();
        WpIOUtils.writeObjectToFile(new File(dir, "idToIndex"), idToIndex);
        WpIOUtils.writeObjectToFile(new File(dir, "indexToId"), indexToId);
        WpIOUtils.writeObjectToFile(new File(dir, "interestVectors"), vectors);
        WpIOUtils.writeObjectToFile(new File(dir, "cosim"), cosim);
        WpIOUtils.writeObjectToFile(new File(dir, "interestCounts"), counts);
        scorer.write(new File(dir, "interestScorer"));
        normalizer.write(new File(dir, "interestNormalizer"));
    }

    /**
     *
     * @param id
     * @param vector
     */
    public void addItemVector(Long id, float vector[]) {
        if (numCols == 0) {
            numCols = vector.length;
        }
        if (vector.length != numCols) {
            throw new IllegalArgumentException();
        }
        for (int i = 0; i < vector.length; i++) {
            if (Float.isInfinite(vector[i]) || Float.isNaN(vector[i])) {
                vector[i] = 0.0f;
            }
        }
        int index = 0;
        synchronized (idToIndex) {
            if (indexToId.size() != idToIndex.size() || indexToId.size() != vectors.size()) {
                throw new IllegalStateException();
            }
            if (idToIndex.containsKey(id)) {
                index = idToIndex.get(id);
            } else {
                index = indexToId.size();
                idToIndex.put(id, index);
                indexToId.add(id);
            }
            if (index < vectors.size()) {
                vectors.set(index, vector);
            } else if (index == vectors.size()) {
                vectors.add(vector);
            } else {
                throw new IllegalStateException();
            }
        }
        if (buildCosimilarity) {
            cacheItemCosimilarities(id);
        }
    }

    /**
     * Computes the cosiimilarity matrix for the given rows and columns.
     * @param rowIds
     * @param colIds
     * @return
     */
    public float[][] cosimilarity(long rowIds[], long colIds[]) {
        float [][] result = new float[rowIds.length][colIds.length];
        for (int i = 0; i < rowIds.length; i++) {
            for (int j = 0; j < colIds.length; j++) {
                result[i][j] = (float) similarity(rowIds[i], colIds[j]);
            }
        }
        return result;
    }

    /**
     * Computes the cosiimilarity matrix for the given rows and columns.
     * @param rowIds
     * @param colIds
     * @return
     */
    public float[][] cosimilarity(int rowIds[], int colIds[]) {
        float [][] result = new float[rowIds.length][colIds.length];
        for (int i = 0; i < rowIds.length; i++) {
            for (int j = 0; j < colIds.length; j++) {
                result[i][j] = (float) similarity(rowIds[i], colIds[j]);
            }
        }
        return result;
    }

    public double similarity(int id1, int id2) {
        return similarity((long)id1, (long)id2);
    }

    public double similarity(Long id1, Long id2) {
        if (!idToIndex.containsKey(id1) || !idToIndex.containsKey(id2)) {
            return 0.0;
        }
        int index1 = idToIndex.get(id1);
        int index2 = idToIndex.get(id2);

        if (cosim != null && index1 < cosim.size() && cosim.get(index1) != null && cosim.get(index1).length > index2) {
            return cosim.get(index1)[index2];
        }
        if (cosim!= null && index2 < cosim.size() && cosim.get(index2) != null && cosim.get(index2).length > index1) {
            return cosim.get(index2)[index1];
        }

        float v1[] = vectors.get(index1);
        float v2[] = vectors.get(index2);
        if (v1 == null || v2 == null) {
            return 0.0;
        } else {
            return scorer.similarity(v1, v2);
        }
    }

    public float[] getVector(int id) {
        return getVector((long)id);
    }

    public float[] getVector(Long id) {
        if (idToIndex.containsKey(id)) {
            return vectors.get(idToIndex.get(id));
        } else {
            return null;
        }
    }

    public SimilarInterestList mostSimilarItems(Long interestId, int numResults) {
        if (!idToIndex.containsKey(interestId)) {
            return new SimilarInterestList();
        }
        int index = idToIndex.get(interestId);

        Leaderboard leaderboard = new Leaderboard(numResults);
        if (cosim != null && cosim.get(index) != null) {
            float[] sims = cosim.get(index);
            for (int i = 0; i < sims.length; i++) {
                leaderboard.tallyScore((int) indexToId.get(i), sims[i]);
            }
        } else if (vectors.get(index) != null) {
            float vector1[] = vectors.get(index);
            for (int i = 0; i < vectors.size(); i++) {
                int id2 = (int)indexToId.get(i);
                double sim = scorer.similarity(vector1, vectors.get(i));
                leaderboard.tallyScore(id2, sim);
            }
        }
        SRResultList results = leaderboard.getTop();
        results.sortDescending();
        ArrayList<SimilarInterest> sil = new ArrayList<SimilarInterest>();
        for (SRResult r : results) {
            sil.add(new SimilarInterest(r.getId(), r.getScore()));
        }
        return new SimilarInterestList(sil);
    }

    private void cacheItemCosimilarities(Long id) {
        if (!idToIndex.containsKey(id)) {
            throw new IllegalStateException();
        }
        int index = idToIndex.get(id);
        float v1[] = vectors.get(index);
        if (v1 == null) {
            throw new IllegalStateException();
        }
        float sims[] = new float[vectors.size()];
        for (int i = 0; i < vectors.size(); i++) {
            float v2[] = vectors.get(i);
            sims[i] = (v2 == null) ? 0.0f : (float) scorer.similarity(v1, v2);
        }
        synchronized (cosim) {
            while (cosim.size() <= index) {
                cosim.add(null);
            }
            cosim.set(index, sims);
        }

    }

    public void rebuildModel() {
        if (vectors.isEmpty()) {
            System.err.println("Cannot finalize interestVectors: There are none.");
            return;
        }
        LOG.info("normalizing interestVectors");
        normalizer = new VectorNormalizer(vectors);
        for (float [] v : vectors) {
            normalizer.normalize(v);
//            System.err.println("normalized to " + Arrays.toString(v));
        }

        LOG.info("building similarity scorer");
        this.scorer = new SimilarityScorer(vectors);

        LOG.info("building cosimilarities");
        cosim = new ArrayList<float[]>();
        ParallelForEach.range(0, indexToId.size(), new Procedure<Integer>() {
            @Override
            public void call(Integer index) throws Exception {
            cacheItemCosimilarities(indexToId.get(index));
            }
        });
    }

    public void incrementCount(long id) {
        incrementCount((int)id);
    }
    public void incrementCount(int id) {
        synchronized (counts) {
            counts.adjustOrPutValue(id, 1, 1);
        }
    }

    public int getCount(int id) {
        synchronized (counts) {
            return counts.containsKey(id) ? counts.get(id) : 0;
        }
    }

    public int getNumCols() {
        return numCols;
    }
}
