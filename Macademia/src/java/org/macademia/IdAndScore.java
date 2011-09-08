package org.macademia;

//public class IdAndScore<K extends Comparable> implements Comparable<IdAndScore<K>> {
public class IdAndScore implements Comparable {
    public Comparable id;
    public Comparable id2;
    public Double score;

    public IdAndScore(Comparable id, Comparable id2, Double score) {
        this.id = id;
        this.id2 = id2;
        this.score = score;
    }

    public IdAndScore(Comparable id, Double score) {
        this.id = id;
        this.id2 = null;
        this.score = score;
    }

    public int compareTo(Object rhs) {
        IdAndScore that = (IdAndScore) rhs;
        int r = -1 * this.score.compareTo(that.score);
        if (r == 0) {
            r = ((Comparable)this.id).compareTo(that.id);
        }
        return r;
    }

    public String toString() {
        return ("<id=" + id + ", score=" + score + ">");
    }
}
