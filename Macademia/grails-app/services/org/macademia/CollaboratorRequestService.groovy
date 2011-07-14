package org.macademia

class CollaboratorRequestService {

    def interestService
    def databaseService
    def autocompleteService

    static transactional = true

    def findByInterest(Interest i) {
        return i.requests
    }

    def get(long id) {
        return CollaboratorRequest.get(id)
    }
    
    public void save(CollaboratorRequest cr) {
        //Maps wrong interest to right interest
        Map<Interest,Interest> remove = new HashMap<Interest,Interest>()
        for(Interest interest in cr.keywords){
            def res = interestService.findByText(interest.text)
            if (res == null) {
                interestService.save(interest)
            } else if (res != null && interest.id == null) {
                remove.put(interest,res)

            }
        }
        for (Interest interest in remove.keySet()) {
            cr.removeFromKeywords(interest)
            cr.addToKeywords(remove.get(interest))
        }
        Utils.safeSave(cr)
        databaseService.addCollaboratorRequest(cr)
    }

    public void cleanupCollaboratorRequests(){
        Set<Long> validIds = new HashSet<Long>(CollaboratorRequest.list().collect({it.id}))
        databaseService.cleanupCollaboratorRequests(validIds)
    }

    public List<CollaboratorRequest> findAllByCreator(Person creator){
        return CollaboratorRequest.findAllByCreator(creator)
    }

    public void delete(CollaboratorRequest cr){
      // still need to delete lone interests
         autocompleteService.removeRequest(cr)
         cr.delete()
         List deleteInterests = databaseService.removeCollaboratorRequest(cr)
         for (interest in deleteInterests){
          autocompleteService.removeInterest(interest)
          Interest.get(interest).delete()
        }
    }

    public void delete(Long crId){
      delete(CollaboratorRequest.get(crId))
    }
}
