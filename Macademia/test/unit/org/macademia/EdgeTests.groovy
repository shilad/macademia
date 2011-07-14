package org.macademia

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
import grails.test.*

class EdgeTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testEquals(){
      Person p1=new Person(fullName:"foo" , email:"bar", department:"goo", id : 1)
      Person p2=new Person(fullName:"bar" , email:"foo", department:"goo", id : 2)
      Interest i1=new Interest(text : "foo", id : 3)
      Interest i2=new Interest(text : "bar", id : 4)
      Interest i3=new Interest(text : "goo", id : 5)
      Interest i4=new Interest(text : "foo", id : 3)
      CollaboratorRequest cr = new CollaboratorRequest(title: "ladf", id : 6)
      CollaboratorRequest cr2 = new CollaboratorRequest(title: "kajfd", id : 7)
      Edge e1=new Edge(person:p1, interest:i1)
      Edge e2=new Edge(person:p1, interest:i2)
      Edge e3=new Edge(person:p1, interest:i4)
      Edge e4=new Edge(person:p2, interest:i1)
      Edge e5=new Edge(person:p1, interest:i1, relatedInterest:i2)
      Edge e6=new Edge(person:p1, interest:i1, relatedInterest:i3)
      Edge e7=new Edge(person:p1, interest:i1, relatedInterest:i4)
      Edge e8=new Edge(person:p1, interest:i4, relatedInterest:i1)
      Edge e9=new Edge(person:p1, interest:i3, relatedInterest:i1)
      Edge e10=new Edge(person:p1, interest:i4, relatedInterest:i3)
      Edge e11=new Edge(person:p2, interest:i1, relatedInterest:i2)
      Edge e12=new Edge(person:p2, interest:i4, relatedInterest:i2)
      Edge e13=new Edge(interest:i1, relatedInterest:i1)
      Edge e14=new Edge(interest:i1, relatedInterest:i2)
      Edge e15=new Edge(interest:i3, relatedInterest:i2)
      Edge e16=new Edge(interest:i1, relatedInterest:i4)
      Edge e17 = new Edge (interest: i2, relatedInterest: i1)
      Edge e18 = new Edge(interest: i1, request: cr)
      assertFalse(e18 == new Edge(interest: i1, request: cr2))
      assertFalse(e18 == new Edge(interest: i2, request: cr))
      assertEquals(e18, new Edge(interest: i1, request: cr))
      assertEquals(e1,e3)
      assertFalse(e1==e4)
      assertFalse(e2==e4)
      assertFalse(e1==e5)
      assertFalse(e1==e11)
      assertFalse(e9==e5)
      assertEquals(e10,e6)
      assertEquals(e13,e16)
      assertEquals(e14, e17)
      assertFalse(e14== e16)
      assertTrue(e11== e12)
      assertFalse(e14== e15)
      assertFalse(e13== e15)
      assertFalse(e5== e11)
      assertEquals(e7, e8)

    }

    void testHashCode(){
      Person p1=new Person(fullName:"foo" , email:"bar", department:"goo", id : 1)
      Person p2=new Person(fullName:"bar" , email:"foo", department:"goo", id : 2)
      Interest i1=new Interest(text : "foo", id : 3)
      Interest i2=new Interest(text : "bar", id : 4)
      Interest i3=new Interest(text : "goo", id : 5)
      Interest i4=new Interest(text : "foo", id : 3)
      Edge e1=new Edge(person:p1, interest:i1)
      Edge e2=new Edge(person:p1, interest:i2)
      Edge e3=new Edge(person:p1, interest:i4)
      Edge e4=new Edge(person:p2, interest:i1)
      Edge e5=new Edge(person:p1, interest:i1, relatedInterest:i2)
      Edge e6=new Edge(person:p1, interest:i1, relatedInterest:i3)
      Edge e7=new Edge(person:p1, interest:i1, relatedInterest:i4)
      Edge e8=new Edge(person:p1, interest:i4, relatedInterest:i1)
      Edge e9=new Edge(person:p1, interest:i3, relatedInterest:i1)
      Edge e10=new Edge(person:p1, interest:i4, relatedInterest:i3)
      Edge e11=new Edge(person:p2, interest:i1, relatedInterest:i2)
      Edge e12=new Edge(person:p2, interest:i4, relatedInterest:i2)
      Edge e13=new Edge(interest:i1, relatedInterest:i1)
      Edge e14=new Edge(interest:i1, relatedInterest:i2)
      Edge e15=new Edge(interest:i3, relatedInterest:i2)
      Edge e16=new Edge(interest:i1, relatedInterest:i4)
      Edge e17 = new Edge (interest: i2, relatedInterest: i1)
      assertEquals(e1.hashCode(),e3.hashCode())
      assertFalse(e1.hashCode()==e4.hashCode())
      assertFalse(e2.hashCode()==e4.hashCode())
      assertFalse(e1.hashCode()==e5.hashCode())
      assertFalse(e1.hashCode()==e11.hashCode())
      assertFalse(e9.hashCode()==e5.hashCode())
      assertEquals(e10.hashCode(),e6.hashCode())
      assertEquals(e13.hashCode(),e16.hashCode())
      assertEquals(e14.hashCode(), e17.hashCode())
      assertFalse(e14.hashCode()== e16.hashCode())
      assertTrue(e11.hashCode()== e12.hashCode())
      assertFalse(e14.hashCode()== e15.hashCode())
      assertFalse(e13.hashCode()== e15.hashCode())
      assertFalse(e5.hashCode()== e11.hashCode())
      assertEquals(e7.hashCode(), e8.hashCode())

    }
}
