package org.macademia;

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */

public class SimilarInterest implements Comparable {
    public long interestId;
    public double similarity;

    public SimilarInterest(long interestId, double similarity){
        this.interestId = interestId;
        this.similarity = similarity;
    }

    public boolean equals(Object o){
        if (o instanceof SimilarInterest) {
            if (interestId == ((SimilarInterest)o).interestId) {
                return true;
            }
        }
        return false;
    }

    public int hashCode(){
        return (int) (interestId + (101 * similarity));
    }

    public int compareTo(Object other){
        if ((other instanceof SimilarInterest)) {
            SimilarInterest o=(SimilarInterest) other;
            return (-1* Double.compare(similarity, (o.similarity)));
        }
        return -1;
    }

    public long getInterestId() {
        return this.interestId;
    }

    public String toString() {
        String res = "";
        res = res + interestId + "," + similarity + "|";
        return res;
    }
}

