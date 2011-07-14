package org.macademia
import java.net.URL

/**
 * Authors: Nathaniel Miller and Alex Schneeman
 */
class InstitutionService {

    static transactional = true

    def save(Institution institution) {
        if (institution.memberships == null) {
            institution.memberships = [] as Set
        }
        Utils.safeSave(institution, true)
    }

    def get(long id) {
        return Institution.get(id)
    }

    public Institution findByEmailDomain(String domain) {
        return Institution.findByEmailDomain(domain)
    }

    public List<Institution> findAll() {
        return Institution.findAll()
    }

    public Set<Long> getFilteredIds(String institutions) {
        List<String> collegesAsStrings = institutions.tokenize("c_")
        Set<Long> collegeIds = new HashSet<Long>()
        for(String college: collegesAsStrings){
            Long id = college.toLong()
            collegeIds.add(id)
        }
        return collegeIds
    }

    public String normalizeWebUrl(String webUrl){
        def scheme = "http:"
        def tokens = webUrl.split("\\/\\/", 2)
        if (tokens.length == 2) {
            if (["http:", "https:"].contains(tokens[0])) {
                scheme = tokens[0]
            }
            webUrl = tokens[1]
        }
        // Normalized form should be subdomain.institutionName.topLevelDomainName
        def urlComponents = webUrl.split("\\.")
        if (urlComponents.size() < 2){
            log.error("too few dots in url ${webUrl}")
            return null
        } else if (urlComponents.size() == 2){
            def tld = urlComponents[1]
            if (tld.size() > 3 && !tld.contains("/")) {
                log.error("invalid tld in url ${webUrl}")
                return null
            }
            webUrl = "www." + webUrl
        }
        try {
            URL url= new URL(scheme + "//" + webUrl.trim())
            return url.getHost().toLowerCase()
        } catch (MalformedURLException e) {
            log.error("invalid url ${webUrl}")
            return null
        }
    }
}
