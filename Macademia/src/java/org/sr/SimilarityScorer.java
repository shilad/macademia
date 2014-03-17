package org.sr;

import org.wikapidia.sr.normalize.IdentityNormalizer;
import org.wikapidia.sr.normalize.Normalizer;
import org.wikapidia.sr.normalize.PercentileNormalizer;
import org.wikapidia.utils.WpIOUtils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Random;
import java.util.logging.Logger;

/**
 * Converts cosimilarity scores into a reasonable distribution.
 *
 * @author Shilad Sen
 */
public class SimilarityScorer {
    private static final int NUM_SAMPLES = 10000;   // number of samples to take

    private static final Logger LOG = Logger.getLogger(SimilarityScorer.class.getName());

    private double exponent = 3.0;
    private final Normalizer normalizer;

    /**
     * Constructs a new similarity scorer with a normalizer trained on the give vector samples.
     * @param sample
     */
    public SimilarityScorer(Collection<float []> sample) {
        if (sample.size() < 2) {
            throw new IllegalArgumentException();
        }
        List<float []> vectors = new ArrayList<float []>(sample);
        Random rand = new Random();
        normalizer = new PercentileNormalizer();
        for (int i = 0; i < NUM_SAMPLES; i++) {
            float v1[] = vectors.get(rand.nextInt(vectors.size()));
            float v2[] = vectors.get(rand.nextInt(vectors.size()));
            System.err.println("observing " + VectorUtils.dot(v1, v2));
            normalizer.observe(VectorUtils.dot(v1, v2));
        }
        normalizer.observationsFinished();
        LOG.info("trained normalizer: " + normalizer.dump());
    }

    /**
     * Constructs a new similarity scorer that has been written to a directory.
     * If the directory does not exist, uses an identity normalizer.
     * @param dir
     * @throws IOException
     */
    public SimilarityScorer(File dir) throws IOException {
        if (dir.isDirectory() && new File(dir, "normalizer").isFile()) {
            normalizer = (Normalizer) WpIOUtils.readObjectFromFile(new File(dir, "normalizer"));
        } else {
            throw new IllegalArgumentException("directory " + dir.getAbsolutePath() + " does not contain a similarity scorer");
        }
    }

    public SimilarityScorer() {
        normalizer = new IdentityNormalizer();
    }

    public void write(File dir) throws IOException {
        LOG.info("writing similarity scorer to " + dir.getAbsolutePath());
        if (!dir.isDirectory()) {
            dir.mkdirs();
        }
        WpIOUtils.writeObjectToFile(new File(dir, "normalizer"), normalizer);
    }

    /**
     * Normalizes a raw similarity score
     * @param x
     * @return
     */
    private double normalize(double x) {
        return Math.pow(normalizer.normalize(x), exponent);
    }

    public double similarity(float [] vector1, float [] vector2) {
        return normalize(VectorUtils.dot(vector1, vector2));
    }

    public double getExponent() {
        return exponent;
    }

    public void setExponent(double exponent) {
        this.exponent = exponent;
    }
}
