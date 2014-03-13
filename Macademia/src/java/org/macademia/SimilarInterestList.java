package org.macademia;

import gnu.trove.list.TIntList;

import java.util.*;

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */

public class SimilarInterestList implements Iterable<SimilarInterest> {
    // overridden in Config.groovy
    public static int MAX_SIMILAR_INTERESTS = 5000;

    private int count;  // how many times the interest is used. A hack to have it in here!
    private String flags = "";
    private ArrayList<SimilarInterest> list;

    public SimilarInterestList(){
        list=new ArrayList<SimilarInterest>();
    }

    public SimilarInterestList(ArrayList<SimilarInterest> list) {
        this.flags = flags;
        this.list = (list != null) ? list : new ArrayList<SimilarInterest>();
    }

    public SimilarInterestList(String fromDB) {
        list = new ArrayList<SimilarInterest>();
        if (fromDB != null) {
            for (String sim : fromDB.split("\\|")) {
                sim = sim.replace("\"","");
                String[] info = sim.split(",");
                if(info.length==2){
                    add(new SimilarInterest(Long.parseLong(info[0]), Double.parseDouble(info[1])));
                }
                if (list.size() >= MAX_SIMILAR_INTERESTS) {
                    break;
                }
            }
        } else {
            list = new ArrayList<SimilarInterest>();
        }
    }

    public SimilarInterestList(String fromDB, Set<Long> interestFilter) {
        list = new ArrayList<SimilarInterest>();
        if (fromDB != null) {
            for (String sim : fromDB.split("\\|")) {
                sim = sim.replace("\"","");
                String[] info = sim.split(",");
                if(info.length==2){
                    long id = Long.parseLong(info[0]);
                    if (interestFilter.contains(id)) {
                        add(new SimilarInterest(id, Double.parseDouble(info[1])));
                    }
                }
            }
        }
    }

    public void merge(SimilarInterestList toMerge) {
        merge(toMerge.list);
    }

    public void merge(List<SimilarInterest> toMerge) {
        Collections.sort(toMerge);
        Set<Long> toMergeIds = new HashSet<Long>();
        for (SimilarInterest si : toMerge) {
            toMergeIds.add(si.interestId);
        }
        ArrayList<SimilarInterest> merged = new ArrayList<SimilarInterest>();
        int i = 0;  // index into toMerge
        int j = 0; // index into current
        while (i < toMerge.size() && j < list.size()) {
            SimilarInterest sii = toMerge.get(i);
            SimilarInterest sij = list.get(j);
            if (sii.similarity > sij.similarity) { // take tomerge
                merged.add(sii);
                i++;
            } else { // take current
                if (!toMergeIds.contains(sij.interestId)) {
                    merged.add(sij);
                }
                j++;
            }
        }
        
        while (i < toMerge.size()) {
            merged.add(toMerge.get(i++));
        }
        while (j < list.size()) {
            if (!toMergeIds.contains(list.get(j).interestId)) {
                merged.add(list.get(j));
            }
            j++;
        }
        this.list = merged;
    }

    public void add(SimilarInterest toAdd) {
        int ind = findIndexOf(toAdd);
        if (ind > -1) {
            SimilarInterest check = list.remove(ind);
        }
        for (int i = 0; i < list.size(); i++) {
            if (toAdd.similarity > list.get(i).similarity) {
                list.add(i, toAdd);
                return;
            }
        }
        list.add(toAdd);
    }

    public void add(String toAdd){
        if (toAdd.length() > 0) {
            for(String interests : toAdd.split("\\|")){
                String[] sim=interests.split(",");
                add(new SimilarInterest(Long.parseLong(sim[0]), Double.parseDouble(sim[1])));
            }
        }
    }

    public boolean contains(SimilarInterest check) {
        return list.contains(check);
    }

    public int findIndexOf(SimilarInterest sim) {
        for (int i = 0; i < list.size(); i++) {
            if (sim.equals(list.get(i))) {
                return i;
            }
        }
        return -1;
    }
    
    public double getSimilarityOfId(long id) {
        for (SimilarInterest si : list) {
            if (si.interestId == id) {
                return si.similarity;
            }
        }
        return 0.0;
    }

    public SimilarInterest get(int i) {
        return list.get(i);
    }

    public ListIterator listIterator() {
        return list.listIterator();  //To change body of implemented methods use File | Settings | File Templates.
    }

    public ListIterator listIterator(int index) {
        return list.listIterator(index);  //To change body of implemented methods use File | Settings | File Templates.
    }
    public SimilarInterestList getSublistTo(int i) {
        SimilarInterestList sil = new SimilarInterestList(new ArrayList<SimilarInterest>(list.subList(0, i)));
        sil.setFlags(this.getFlags());
        return sil;
    }

    public void setFlags(String flags) {
        this.flags = flags;
    }

    public void remove(SimilarInterest remove) {
        int index = list.lastIndexOf(remove);
        if (index > -1) {
            list.remove(index);
        }
    }

    public List<SimilarInterest> getList() {
        return this.list;
    }

    public SimilarInterest removeLowest() {
        return list.remove(list.size() - 1);
    }

    public String toString() {
        String res = "";
        for (SimilarInterest sim : list) {
            res = res + sim.interestId + "," + sim.similarity + "|";
        }
        return res;
    }

    public void dedupe(Set<Long> validIds) {
        Set<Long> found = new HashSet<Long>();
        ArrayList<SimilarInterest> newList = new ArrayList<SimilarInterest>();
        for (SimilarInterest si : list) {
            if (!found.contains(si.interestId) && validIds.contains(si.interestId)) {
                found.add(si.interestId);
                newList.add(si);
            }
        }
        list = newList;
    }

    public int size(){
        return list.size();
    }

    public boolean isEmpty() {
        return list.isEmpty();
    }

    private static final double sigmoid(double x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }

    public void normalize() {
        if (!list.isEmpty()) {
            for (SimilarInterest si : list) {
                // TODO: do something reasonable here.
                si.similarity = sigmoid((si.similarity - 0.15) * 4);
            }
            double biggest = list.get(0).similarity;
            double secondBiggest = biggest;
            for (SimilarInterest si : list) {
                if (si.similarity < biggest) {
                    secondBiggest = si.similarity;
                    break;
                }
            }
            if (biggest != secondBiggest) {
                double k = 0.8 / secondBiggest;
                k = 0.5 * k + 0.5 * 1.0;
                for (SimilarInterest si : list) {
                    si.similarity = Math.min(1.0, k * si.similarity);
                }
            }
        }
    }

    public Iterator<SimilarInterest> iterator() {
        return list.iterator();
    }
    
    public String getFlags() {
        return this.flags;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
