package org.macademia

/**
 * A research interest denoted by a text field
 */
class Interest implements Comparable {
    String text
    String normalizedText
    Date lastAnalyzed
    String articleName
    Long articleId


    static constraints = {
        normalizedText(unique: true)
        lastAnalyzed(nullable : true)
        articleName(nullable : true)
        articleId(nullable : true)
        requests(nullable: true)
        people(nullable: true)
    }

    static belongsTo = [Person, CollaboratorRequest]
    static hasMany = [
            people: Person,
            requests: CollaboratorRequest
    ]

    static mapping = {
        documents column : 'interest_id'
    }

    static def normalize = {text ->
        return (text.toLowerCase() =~ /[^a-zA-Z0-9]+/).replaceAll("")
    }

    public Interest() {}

    public Interest(String text) {
        this.text = text
        this.normalizedText = normalize(text)
    }

    public int hashCode() {
        return normalizedText.hashCode()
    }

    public int compareTo(Object other) {
        if (other instanceof Interest) {
            return normalizedText.compareTo(other.normalizedText)
        } else {
            throw new RuntimeException("Attempted to compare an Interest to a nonInterest object")
        }
    }

    public boolean equals(Object other) {
        if (other instanceof Interest) {
            return (compareTo(other) == 0)
        }
        return false
    }

    public String toString() {
        return "<$text>"
    }

    public void setText(String text) {
        this.text = text
        this.normalizedText = normalize(text)
    }

}

