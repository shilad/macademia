package org.macademia;

import org.codehaus.groovy.grails.commons.ConfigurationHolder;

import java.util.*;
import java.util.regex.*;

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */

public class SimilarInterestList {
    // overridden in Config.groovy
    public static int MAX_SIMILAR_INTERESTS = 2000;

    ArrayList<SimilarInterest> list;

    public SimilarInterestList(){
        list=new ArrayList<SimilarInterest>();
    }

    public SimilarInterestList(ArrayList<SimilarInterest> list) {
        this.list = list;
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

    public SimilarInterestList(String fromDB, Set<Long> institutionInterests) {
        list = new ArrayList<SimilarInterest>();
        if (fromDB != null) {
            for (String sim : fromDB.split("\\|")) {
                sim = sim.replace("\"","");
                String[] info = sim.split(",");
                if(info.length==2){
                    long id = Long.parseLong(info[0]);
                    if (institutionInterests.contains(id)) {
                        add(new SimilarInterest(id, Double.parseDouble(info[1])));
                    }
                }
            }
        }
    }

    public void add(SimilarInterestList toAdd) {
        for (SimilarInterest s : toAdd.list) {
            add(s);
        }
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
        return new SimilarInterestList(new ArrayList<SimilarInterest>(list.subList(0, i)));
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

    public Iterator iterator() {
        return list.iterator();  //To change body of implemented methods use File | Settings | File Templates.
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
}
