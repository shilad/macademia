package org.macademia.sr;

import org.junit.Test;
import org.sr.VectorUtils;

import static org.junit.Assert.assertEquals;

/**
 * @author Shilad Sen
 */
public class TestVectorUtils {
    @Test
    public void testUnitize() {
        float v[] = new float[] { 3.0f, 4.0f, 1.0f };
        double length = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        VectorUtils.makeUnitVector(v);
        assertEquals(v[0], 3.0f / length, 0.001);
        assertEquals(v[1], 4.0f / length, 0.001);
        assertEquals(v[2], 1.0f / length, 0.001);
    }
    @Test
    public void testDot() {
        float v1[] = new float[] { 3.0f, 4.0f, 1.0f };
        float v2[] = new float[] { 1.0f, 2.0f, -1.0f };
        assertEquals(3.0f + 8.0f - 1.0f, VectorUtils.dot(v1, v2), 0.001);
    }

    @Test
    public void testGetMaxIndex() {
        float v1[] = new float[] { 3.0f, 4.0f, 1.0f };
        float v2[] = new float[] { 1.0f, 2.0f, 3.0f };
        assertEquals(1, VectorUtils.maxIndex(v1));
        assertEquals(2, VectorUtils.maxIndex(v2));

        int n = 100000;
        float v3[] = new float[] { 1.0f, 0.5f, 1.0f };
        int counts[] = new int[3];
        for (int i = 0; i < n; i++) {
            counts[VectorUtils.maxIndex(v3)]++;
        }

        assertEquals(0, counts[1]);
        assertEquals(n, counts[0] + counts[2]);
        assertEquals(0.5, 1.0 * counts[0] / n, 0.05);
        assertEquals(0.5, 1.0 * counts[2] / n, 0.05);
    }
}
