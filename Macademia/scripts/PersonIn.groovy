import org.macademia.*

PersonService personService = ctx.getBean("personService")

BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))
String inputLine

while ((inputLine = reader.readLine()) != null) {
    String[] vals = inputLine.split(",")
    Person p = Person.get(Long.parseLong(vals[0]))
    Institution inst = Institution.get(Long.parseLong(vals[1]))
    personService.save(p, [inst])
}