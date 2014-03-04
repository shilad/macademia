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
}
