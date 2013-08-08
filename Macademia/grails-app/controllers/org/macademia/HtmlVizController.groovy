package org.macademia

import grails.converters.JSON
import org.macademia.nbrviz.InterestGraph
import org.macademia.nbrviz.PersonGraph

class HtmlVizController {

    def personService
    def similarity2Service
    def json2Service
    def interestService

    def index() {
    }

    def interestViz(){
        render(view:'interestViz')
    }

    def personViz(){

        def id = params.nodeId;
        print(id);
        def rootId = id.substring(2) as Long;
        print(rootId);
        def rootClass = id.substring(0,1) == "p" ? "person" : "interest";
        print(rootClass);

        def data = []

        if(rootClass.equals("interest")){

            Map<Long, Double> parentWeights = [:]
            if (params.parentIds && params.parentWeights) {
                List<Integer> parentIds = params.parentIds.split("_").collect({ it.toLong() })
                List<Integer> weights = params.parentWeights.split("_").collect({ it.toInteger() })
                for (int i = 0; i < parentIds.size(); i++) {
                    parentWeights[parentIds[i]] = weights[i] / 5.0
                }
            }

            InterestGraph graph = similarity2Service.calculateInterestNeighbors(
                    rootId, 20, 4, parentWeights)
            data = json2Service.buildInterestCentricGraph(
                    graph,
                    params.subToken ? params.subToken.toLong() : 1)

        } else {
            Map<Long, Double> parentWeights = [:]
            if (params.parentIds && params.parentWeights) {
                List<Integer> parentIds = params.parentIds.split("_").collect({ it.toLong() })
                List<Integer> weights = params.parentWeights.split("_").collect({ it.toInteger() })
                for (int i = 0; i < parentIds.size(); i++) {
                    parentWeights[parentIds[i]] = weights[i] / 5.0
                }
            }
            parentWeights[rootId] = 1.0

            PersonGraph graph = similarity2Service.calculatePersonNeighbors(
                    rootId, 5, 3, parentWeights)
            data = json2Service.buildPersonCentricGraph(
                    graph,
                    params.subToken ? params.subToken.toLong() : 1)
        }


        double maxRel = 0; //highest # of any person to any hub
        double maxRelOverall = 0; //highest # of any overall relevance of any person
        Map dataSet = (Map)data.get("people");
        Map person;
        Map relevance;
        for(Long personID : dataSet.keySet()){
//            if(personID == rootId){
            person =  dataSet.get(personID);
            relevance = person.get("relevance");
            for(String key : relevance.keySet()){
                if(key.equals('overall')){
                    if(relevance.get(key) > maxRelOverall){ maxRelOverall = relevance.get(key) };
                }
                else {
                    if(relevance.get(Long.parseLong(key,10)) > maxRel){ maxRel = relevance.get(Long.parseLong(key,10)) };
                }
            }
            System.out.println(personID + ": " + maxRelOverall + " - " + maxRel);
//            }
        }
        Map formattedData = new HashMap();
        Map barPercents;
        for(Long personID : dataSet.keySet()){
            barPercents = new HashMap();
            person =  dataSet.get(personID);
            relevance = person.get("relevance");
            barPercents.put("overall", 100*(relevance.get("overall")/maxRelOverall));
            for(String key : relevance.keySet()){
                if(!key.equals("-1") && !key.equals("overall")){
                    barPercents.put(key,100*(relevance.get(Long.parseLong(key,10))/maxRel));
                }
            }
//            print( 'barPercents')
//            print( barPercents )
            formattedData.put(personID,barPercents);
            barPercents=null;
        }

        data["formattedData"] = formattedData;
//        c.out.println(formattedData);
        render(view : 'personViz', model: data)
    }
}
