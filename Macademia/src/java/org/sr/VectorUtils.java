package org.sr;

import gnu.trove.list.TIntList;
import gnu.trove.list.array.TIntArrayList;

import java.util.Random;

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

    /**
     * Returns the index with the maximum value. If two values are equal, randomly choose.
     * @param vector
     * @return
     */
    public static int maxIndex(float vector[]) {
        if (vector.length == 0) {
            throw new IllegalArgumentException();
        }
        TIntList maxIndexes = new TIntArrayList();
        float maxValue = Float.NEGATIVE_INFINITY;
        for (int i = 0; i < vector.length; i++) {
            if (vector[i] == maxValue) {
                maxIndexes.add(i);
                maxValue = vector[i];
            } else if (vector[i] > maxValue) {
                maxIndexes.clear();
                maxIndexes.add(i);
                maxValue = vector[i];
            }
        }
        if (maxIndexes.isEmpty()) {
            throw new IllegalStateException();
        } else if (maxIndexes.size() == 1) {
            return maxIndexes.get(0);
        } else {
            Random random = new Random();
            return maxIndexes.get(random.nextInt(maxIndexes.size()));
        }
    }
}
