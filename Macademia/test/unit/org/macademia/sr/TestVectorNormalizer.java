package org.macademia.sr;

import org.apache.commons.io.FileUtils;
import org.junit.Test;
import org.sr.VectorNormalizer;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.*;

/**
 * @author Shilad Sen
 */
public class TestVectorNormalizer {
    private List<float[]> matrix = Arrays.asList(
            new float[] { 3, 4, 5 },
            new float[] { 6, 9, 11 },
            new float[] { 1, 0, 2 }
    );

    /**
     * Calcualted using python program at bottom
     */
    private List<float[]> normalized = Arrays.asList(
            new float[] {0.16950562419084886f, 0.66330590193712f, -0.7288985689539075f},
            new float[] {-0.7930902021140368f, 0.4505440177948971f, -0.40990001139295873f},
            new float[] {0.4918799071537795f, -0.6156611269350656f, 0.6156423748568924f}
    );

    @Test
    public void testIdentityNormalizer() {
        VectorNormalizer vn = new VectorNormalizer();
        float [] v = Arrays.copyOf(matrix.get(0), 3);
        vn.normalize(v);
        assertArrayEquals(matrix.get(0), v, 0.0001f);
    }

    @Test
    public void testTraining() {
        VectorNormalizer vn = new VectorNormalizer(matrix);
        for (int i = 0; i < matrix.size(); i++) {
            float [] v = Arrays.copyOf(matrix.get(i), 3);
            vn.normalize(v);
            assertArrayEquals(normalized.get(i), v, 0.0001f);
        }
    }

    @Test
    public void testWriteRead() throws IOException {
        File tmp = File.createTempFile("matrix", "normalizer");
        tmp.delete();
        tmp.mkdir();
        VectorNormalizer vn = new VectorNormalizer(matrix);
        vn.write(tmp);
        FileUtils.forceDeleteOnExit(tmp);
        vn = new VectorNormalizer(tmp);
        FileUtils.forceDelete(tmp);
        for (int i = 0; i < matrix.size(); i++) {
            float [] v = Arrays.copyOf(matrix.get(i), 3);
            vn.normalize(v);
            assertArrayEquals(normalized.get(i), v, 0.0001f);
        }
    }

    /**
     * Python program to generate normalized matrix.
     *

M = [
    [ 3.0, 4.0, 5.0 ],
    [ 6.0, 9.0, 11.0 ],
    [ 1.0, 0.0, 2.0 ]
]

dot = lambda X, Y: sum([x * y for (x, y) in zip(X, Y)])
norm2 = lambda X: dot(X, X) ** 0.5

UNIT = [
    [ x / norm2(X) for x in X]
    for X in M
]
print('unit is', UNIT)

MEANS = [ 1.0 * sum(v) / len(v) for v in zip(*UNIT) ]
DEVS = []
for (i, v) in enumerate(zip(*UNIT)):
    deltas = [x - MEANS[i] for x in v]
    DEVS.append(( dot(deltas, deltas) / len(v)) ** 0.5)

NORM = []

for V in UNIT:
    V = [ (x - MEANS[i]) / DEVS[i] for (i, x) in enumerate(V) ]
    V = [x / norm2(V) for x in V]
    print(V)

     */

}
