package org.sr;

/**
 * @author Shilad Sen
 */
public class VectorUtils {
    /**
     * Returns the dot product of two vectors.
     * @param v1
     * @param v2
     * @return
     */
    public static double dot(float v1[], float v2[]) {
        if (v1.length != v2.length) {
            throw new IllegalArgumentException();
        }
        double dot = 0.0;
        for (int i = 0; i < v1.length; i++) {
            dot += v1[i] * v2[i];
        }
        return dot;
    }

    /**
     * Converts the passed in vector to a unit vector.
     * @param vector
     */
    public static void makeUnitVector(float vector[]) {
        double len = 0.0;
        for (int i = 0; i < vector.length; i++) {
            len += vector[i] * vector[i];
        }
        len = Math.sqrt(len);
        if (len > 0) {
            for (int i = 0; i < vector.length; i++) {
                vector[i] /= len;
            }
        }
    }
}
