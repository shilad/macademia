import org.macademia.*


for (Person p : Person.list()) {
    println "${p.id},${p.institution.id}"
}