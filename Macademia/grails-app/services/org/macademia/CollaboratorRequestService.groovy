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
        Utils.safeSave(cr)
        databaseService.addCollaboratorRequest(cr)
    }

    public void cleanupCollaboratorRequests(){
        Set<Long> validIds = new HashSet<Long>(CollaboratorRequest.list().collect({it.id}))
        databaseService.cleanupCollaboratorRequests(validIds)
    }

    public List<CollaboratorRequest> findAllByCreator(Person creator) {
        return CollaboratorRequest.findAllByCreator(creator)
    }

    public void delete(CollaboratorRequest cr) {
        List deleteInterests = databaseService.removeCollaboratorRequest(cr)
        autocompleteService.removeRequest(cr)
        for (interest in deleteInterests) {
            interestService.delete(cr.creator, interest)
        }
        cr.delete()
    }

    public void delete(Long crId) {
        delete(CollaboratorRequest.get(crId))
    }
}
