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
public class ItemModel {
    private static final Logger LOG = Logger.getLogger(ItemModel.class.getName());

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
     * Normalizer for similarity score for items
     */
    private Normalizer normalizer = null;


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
    public ItemModel() {
        buildCosimilarity = false;
    }

    /**
     * Creates a new SR calculator and reads from a particular directory.
     */
    public ItemModel(File dir) throws IOException {
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
        File pathVectors = new File(dir, "itemVectors");
        File pathCosim = new File(dir, "cosim");
        File pathNormalizer = new File(dir, "itemNormalizer");
        if (pathCosim.isFile() && pathIndexToId.isFile() && pathIdToIndex.isFile() && pathVectors.isFile() && pathNormalizer.exists()) {
            idToIndex = (TLongIntMap) WpIOUtils.readObjectFromFile(pathIdToIndex);
            indexToId = (TLongList) WpIOUtils.readObjectFromFile(pathIndexToId);
            cosim = (List<float[]>) WpIOUtils.readObjectFromFile(pathCosim);
            vectors = (List<float[]>) WpIOUtils.readObjectFromFile(pathVectors);
            normalizer = (Normalizer) WpIOUtils.readObjectFromFile(pathNormalizer);
            if (!vectors.isEmpty()) {
                numCols = vectors.get(0).length;
            }
            return true;
        } else {
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
        WpIOUtils.writeObjectToFile(new File(dir, "itemVectors"), vectors);
        WpIOUtils.writeObjectToFile(new File(dir, "cosim"), cosim);
        WpIOUtils.writeObjectToFile(new File(dir, "itemNormalizer"), normalizer);
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
            return itemSimilarity(v1, v2);
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

    private double itemSimilarity(float vector1[], float vector2[]) {
        if (vector1.length != vector2.length) {
            throw new IllegalArgumentException();
        }
        return normalize(VectorUtils.dot(vector1, vector2));
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
                double sim = itemSimilarity(vector1, vectors.get(i));
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
            sims[i] = (v2 == null) ? 0.0f : (float) itemSimilarity(v1, v2);
        }
        synchronized (cosim) {
            while (cosim.size() <= index) {
                cosim.add(null);
            }
            cosim.set(index, sims);
        }

    }

    private double normalize(double x) {
        if (normalizer == null) {
            return x;
        } else if (MathUtils.isReal(x)) {
            return Math.pow(normalizer.normalize(x), 3);
        } else {
            return 0.0;
        }
    }

    public void summarize() {
        if (vectors.isEmpty()) {
            System.err.println("no itemVectors in fast sr cache");
            return;
        }

        int maxSampleSize = 10000;
        TFloatList sample = new TFloatArrayList();
        System.err.println("summarizing vector statistics...");
        for (float v[] : vectors) {
            for (float x : v) {
                if (Math.random() <= 1.0 * maxSampleSize / (numCols * vectors.size())) {
                    sample.add(x);
                }
            }
        }
        sample.sort();
        System.err.println("\tbased on sample of " + sample.size());
        for (int i = 0; i <= 20; i++) {
            int index = (int) Math.floor(i / 20.0 * (sample.size() - 1));
            System.err.println("\t" + i * (100/20) + "% value = " + sample.get(index));
        }
        System.err.println();
    }

    public void normalizeCosimilarities() {
        this.normalizer = null;
        Normalizer normalizer = new PercentileNormalizer();
        Random rand = new Random();
        for (int i = 0; i < 50000; i++) {
            float[] row = cosim.get(rand.nextInt(cosim.size()));
            if (row != null && row.length > 0) {
                double sim = row[rand.nextInt(row.length)];
                if (MathUtils.isReal(sim)) {
                    normalizer.observe(sim);
                }
            }
        }
        normalizer.observationsFinished();
        LOG.info("itemNormalizer is " + normalizer.dump());
        this.normalizer = normalizer;

        for (float v [] : cosim) {
            for (int i = 0; i < v.length; i++) {
                v[i] = (float) normalize(v[i]);
            }
        }
    }


    private void normalizeVectors(Collection<float []> vectors) {
        if (vectors.size() == 0) {
            return;
        }

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

    public void buildCache() {
        if (vectors.isEmpty()) {
            System.err.println("Cannot finalize itemVectors: There are none.");
            return;
        }
        buildCosimilarity = false;
        LOG.info("normalizing itemVectors");
        normalizeVectors(vectors);

        this.normalizer = null;
        cosim = new ArrayList<float[]>();

        LOG.info("building cosimilarities");
        ParallelForEach.range(0, indexToId.size(), new Procedure<Integer>() {
            @Override
            public void call(Integer index) throws Exception {
                cacheItemCosimilarities(indexToId.get(index));
            }
        });

        LOG.info("normalizing cosimilarities");
        normalizeCosimilarities();

        buildCosimilarity = true;
    }

    public int getNumCols() {
        return numCols;
    }
}
