package org.macademia.nbrviz

/**
 * Created by IntelliJ IDEA.
 * User: research
 * Date: 7/25/11
 * Time: 5:37 PM
 * To change this template use File | Settings | File Templates.
 */
class PseudonymService {

    /* uses a pairing function to assign a unique number to any given pair of subject id (token) and user id
     * see(http://szudzik.com/ElegantPairing.pdf)
     * with 2000 first names and 3001 last names, there are approx 6 million possible combinations
     * this code (and number of names) should prevent repeats for up to approx 2449 sids and approx 2449 uids
     * at least one of the name files (in our case last names) must be prime
     */

    def maleFirsts = new File("db/dist.male.first.top").readLines() as ArrayList
    def femaleFirsts = new File ("db/dist.female.first.top").readLines() as ArrayList
    def allLasts = new File ("db/dist.all.last.top").readLines() as ArrayList
    def malePicList = new File ("db/malepiclist").readLines() as ArrayList
    def femalePicList = new File ("db/femalepiclist").readLines() as ArrayList
    def malePicLocation = "db/malepics/"
    def femalePicLocation = "db/femalepics/"

    public Long pair(Long x, Long y){
        if (x < y){
            return ((y*y)+x)
        } else{
            return ((x*x)+x+y)
        }
    }

    public List<Long> unpair(Long z){
        double zf = Math.floor(Math.sqrt((double) pid))
        double zf2 =z1*z1
        if ((z -zf2) < zf){
            return [(long) z-zf2, (long) zf]
        } else {
            return [(long) zf, (long) (z-zf2-zf)]
        }
    }

    public String generatePseudonym(Long pid){
        String lastName = allLasts.get((int) (pid *37 ) %3001)
        String firstName
        if (pid & 1){
            firstName = maleFirsts.get((int) (((pid%2000)-1)/2))
        } else {
            firstName = femaleFirsts.get((int) ((pid%2000)/2))
        }
        return "$firstName $lastName"
    }

    public Long getRealID(Long pid){
        return unpair(pid).get(1)
    }

    public Map getFakeData(Long sid, Long uid){
        def fakeData = [:]
        fakeData['id']=pair(sid, uid)
        fakeData['name']=generatePseudonym((long) fakeData.id)
        fakeData['pic']=generateFakePicture(fakeData.id)
        return fakeData
    }

    public String generateFakePicture(long pid){
        String picName
        if (pid & 1){
            picName=malePicList.get(((int) ((pid-1)/2))%malePicList.size())
            return "$malePicLocation$picName"
        } else {
            picName=femalePicList.get(((int) (pid/2))%femalePicList.size())
            return "$femalePicLocation$picName"
        }

    }
}
