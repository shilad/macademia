package org.macademia

class SearchService {
    boolean transactional = true
    def personMax = 10
    def interestMax = 20
    def requestMax = 3

    Collection<Person> searchPeople(String query, int offset, int max) {
        return Person.search("+(fullName:${query} OR email:${query} OR department:${query}) +invisible:false", [reload: true, offset:offset, max:max]).results
    }

    Collection<Interest> searchInterests(String query, int offset, int max) {
        return Interest.search(query, [reload: true, offset:offset, max:max]).results

    }

    Collection<CollaboratorRequest> searchCollaboratorRequests(String query, int offset, int max) {
        return CollaboratorRequest.search(query, [reload: true, offset:offset, max:max]).results
    }

    Collection<Institution> searchInstitutions(String query) {
        return Institution.search(query, [reload: true], ).results
    }

    int numPersonResults(String query) {
        return Person.search(query, [reload: true]).total
    }

    int numRequestResults(String query) {
        return CollaboratorRequest.search(query, [reload: true]).total
    }

    int numInterestResults(String query) {
        return Interest.search(query, [reload: true]).total
    }

    Collection<Person> filterSearchPeople(String query, int offset, int max, int pTotal, Set<Long> institutions){
        Collection<Person> allPeople = searchPeople(query, 0, pTotal)
        return filterPeopleByInstitution(allPeople, institutions, offset, max)
    }

    Collection<Interest> filterSearchInterests(String query, int offset, int max, int iTotal, Set<Long> institutions){
        Collection<Interest> allInterests = searchInterests(query, 0, iTotal)
        return filterInterestsByInstitution(allInterests, institutions, offset, max)
    }

    Collection<CollaboratorRequest> filterSearchCollaboratorRequests(String query, int offset, int rTotal, int max, Set<Long> institutions){
        Collection<CollaboratorRequest> allRequests = searchCollaboratorRequests(query, 0, rTotal)
        return filterRequestsByInstitution(allRequests, institutions, offset, max)
    }

    Collection<Person> filterPeopleByInstitution(Collection<Person> pResults, Set<Long> institutionFilter, int offset, int max) {
        Collection<Person> filteredPeople = new ArrayList<Person>()
        int index = 0
        for(Person p: pResults){
            if(p.memberOfAny(institutionFilter)){
                if(index >= offset){
                    filteredPeople.add(p)
                }
                index ++
            }
            if(index >= (offset + max)){
                break;
            }
        }
        return filteredPeople
    }

    Collection<Interest> filterInterestsByInstitution(Collection<Interest> iResults, Set<Long> institutionFilter, int offset, int max) {
        Collection<Interest> filteredInterests = new ArrayList<Interest>()
        int index = 0
        for(Interest i: iResults){
            for(Person p: i.people){
                if(p.memberOfAny(institutionFilter)){
                    if (index >= offset){
                        filteredInterests.add(i)
                    }
                    index ++
                    break
                }
            }
            if(index >= (offset + max)){
                break;
            }
        }
        return filteredInterests
    }

    Collection<CollaboratorRequest> filterRequestsByInstitution(Collection<CollaboratorRequest> rResults, Set<Long> institutionFilter, int offset, int max) {
        Collection<CollaboratorRequest> filteredRequests = new ArrayList<CollaboratorRequest>()
        int index = 0
        for(CollaboratorRequest r: rResults){
            if(r.creator.memberOfAny(institutionFilter)){
                if (index >= offset){
                    filteredRequests.add(r)
                }
                index ++
            }
            if(index >= (offset + max)){
                break;
            }
        }
        return filteredRequests
    }
}