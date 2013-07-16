<%@ page contentType="text/html;charset=UTF-8" %>
<html>
  <head>
    <title>Raphael Play</title>
    <r:script library="jquery" plugin="jquery"/>
    <r:script src="nbrviz/raphael-min.js"/>
    <r:script src="nbrviz/shared.js"/>
    <r:script src="nbrviz/sphere.js"/>
    <r:script src="nbrviz/person.js"/>
    <r:script src="nbrviz/interest.js"/>
    <style type="text/css">
      #holder {
        width: 1173px;
        border: 1px solid #aaa;
      }
    </style>

  </head>
  <body>
    <div id="holder"></div>

  <r:script>
    macademia.nbrviz.initPaper("holder", 1173, 800);

    var interestCluster1 = new InterestCluster({
        relatedInterests: [
            {name:"German"},
            {name:'natural language processing'},
            {name:'Japanese linguistics'},
            {name:'Hungarian language'},
            {name:'linguistics'},
            {name:'latin'}
        ],
        color: -1
    });

    var interestCluster2 = new InterestCluster({
        relatedInterests: [
            {name:'pragmatics'},
            {name:'German language'},
            {name:'wine chemistry'},
            {name:'figurative language'},
            {name:'Romance languages'},
            {name:'historical languages'},
            {name:'Nahuatl'}
        ],
        color: 0.7,
        name: 'tagging'
    });

    interestCluster1.setPosition(300, 300);
    interestCluster2.setPosition(600, 300);

  </r:script>

  </body>
</html>
