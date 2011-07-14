package org.macademia;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
public class TimingAnalysis {
    HashMap<String, Long> calls = new HashMap<String, Long>();
    HashMap<String, Long> totalTime = new HashMap<String, Long>();
    List<String> labelOrder = new ArrayList<String>();
    Long lastTime;
    String prefix;

    public TimingAnalysis(String prefix) {
        this.prefix = prefix;
        startTime();
    }

    public TimingAnalysis() {
        this(null);
    }

    public void startTime() {
        lastTime = System.currentTimeMillis();
    }

    public String recordTime(String label) {
        Long currentTime = System.currentTimeMillis();
        Long callTime = currentTime - lastTime;
        if (calls.containsKey(label)) {
            calls.put(label, calls.get(label) + 1);
            totalTime.put(label, totalTime.get(label) + callTime);
        } else {
            calls.put(label, (long)1);
            totalTime.put(label,callTime);
            labelOrder.add(label);
        }
        lastTime = currentTime;
        return label + " took " + callTime + " milliseconds.";

    }

    public void analyze() {
        for (String label : labelOrder) {
            if (prefix != null) {
                System.out.print(prefix + ": ");
            }
            System.out.println(label + " took an average of " + ((totalTime.get(label)*1.0)/calls.get(label)) +
                    " milliseconds over " + calls.get(label) + " calls and " + totalTime.get(label) +
                    " total milliseconds.");
        }
    }
}
