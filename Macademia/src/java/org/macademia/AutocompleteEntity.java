package org.macademia;

/**
 * A named entity for the autocompleter.
 * @author Shilad
 */
public class AutocompleteEntity {
    private long id;
    private String name;
    private Class klass;
    private String other;

    public AutocompleteEntity(long id, String name, Class klass) {
        this.id = id;
        this.name = name;
        this.klass = klass;
        this.other = "";
    }

    public AutocompleteEntity(long id, String name, Class klass, String other) {
        this.id = id;
        this.name = name;
        this.klass = klass;
        this.other = other;
    }

    public String getName() {
        return name;
    }

    public String getOther() {
        return other;
    }

    public long getId() {
        return id;
    }

    public Class getKlass() {
        return klass;
    }

    public void setOther(String other) {
        this.other = other;
    }

    @Override
    public String toString() {
        return name;
    }
         
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AutocompleteEntity that = (AutocompleteEntity) o;

        if (id != that.id) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return (int) (id ^ (id >>> 32));
    }
}
