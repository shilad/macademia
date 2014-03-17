package org.sr;

import org.wikapidia.utils.WpIOUtils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.logging.Logger;

/**
 * Z-score normalizes vectors. More specifically:
 *
 * For each vector v:
 * 1. Converts v to a unit vector.
 * 2. For each column c of v, subtracts off the mean of c across all unitized vectors.
 * 3. For each column c of v, divides by the standard deviation of c across all unitized vectors.
 * 4. Converts v to a unit vector again.
 *
 * @author Shilad Sen
 */
public class VectorNormalizer {
    private static final Logger LOG = Logger.getLogger(VectorNormalizer.class.getName());
    /**
     * Means for each column;
     */
    private final double means[];

    /**
     * Standard deviations for each column;
     */
    private final double devs[];

    /**
     * Creates a new vector normalizer that is the identity normalizer (i.e. it does nothing).
     */
    public VectorNormalizer() {
        means = null;
        devs = null;
    }

    /**
     * Creates a new vector normalizer that has been previously written to the specified directory.
     * @param dir
     * @throws IOException
     */
    public VectorNormalizer(File dir) throws IOException {
        if (dir.isDirectory() && new File(dir, "means").isFile() && new File(dir, "devs").isFile()) {
            means = (double[]) WpIOUtils.readObjectFromFile(new File(dir, "means"));
            devs = (double[]) WpIOUtils.readObjectFromFile(new File(dir, "devs"));
        } else {
            LOG.warning("directory " + dir.getAbsolutePath() + " does not contain a vector normalizer");
            means = null;
            devs = null;
        }
    }

    /**
     * Trains a new vector normalizer from some example vectors.
     * Note that these input vectors are not touched.
     */
    public VectorNormalizer(Collection<float []> vectorCollection) {
        List<float[]> vectors = new ArrayList<float []>(vectorCollection);
        if (vectorCollection.isEmpty()) {
            throw new IllegalArgumentException();
        }
        float unitv[] = new float[vectors.get(0).length];   // reused unit vector
        means = new double[unitv.length];
        devs = new double[unitv.length];

        // Calculate the means
        for (float[] v : vectors) {
            System.arraycopy(v, 0, unitv, 0, unitv.length);
            VectorUtils.makeUnitVector(unitv);
            for (int i = 0; i < unitv.length; i++) {
                means[i] += unitv[i];
            }
        }
        for (int i = 0; i < means.length; i++) {
            means[i] /= vectors.size();
        }

        // Calculate the deviations
        for (float[] v : vectors) {
            System.arraycopy(v, 0, unitv, 0, unitv.length);
            VectorUtils.makeUnitVector(unitv);
            for (int i = 0; i < unitv.length; i++) {
                devs[i] += (unitv[i] - means[i]) * (unitv[i] - means[i]);
            }
        }
        for (int i = 0; i < means.length; i++) {
            devs[i] = Math.sqrt(devs[i] / vectors.size());
        }
    }

    /**
     * Z-score normalizes the vector in place.
     * @param vector
     */
    public void normalize(float vector[]) {
        if (means == null) {
            return;
        }
        if (vector.length != means.length) {
            throw new IllegalArgumentException("means and vector have different lengths");
        }
        if (vector.length != devs.length) {
            throw new IllegalArgumentException("devs and vector have different lengths");
        }
        VectorUtils.makeUnitVector(vector);
        for (int i = 0; i < vector.length; i++) {
            if (devs[i] == 0) {
                vector[i] = 0.0f;       // TODO: what should we do here?
            } else {
                vector[i] = (float) ((vector[i] - means[i]) / devs[i]);
            }
        }
        VectorUtils.makeUnitVector(vector);
    }

    /**
     * Writes the normalizer to the specified directory, creates it the directory if it doesn't already exist.
     * @param dir
     * @throws IOException
     */
    public void write(File dir) throws IOException {
        LOG.info("writing vector normalizer to " + dir.getAbsolutePath());
        if (!dir.isDirectory()) {
            dir.mkdirs();
        }
        WpIOUtils.writeObjectToFile(new File(dir, "means"), means);
        WpIOUtils.writeObjectToFile(new File(dir, "devs"), devs);
    }
}
