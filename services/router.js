const express = require('express');
const router = new express.Router();
var oracledb = require('oracledb');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var arr = [];
var area;
var crime;
var starttime;
var endtime;

router.get("/",function (req, res){
    return res.render('../views/crimeData.ejs', {arr: [], data: []});

})

router.post("/",function get(req, res) {
  area = req.body.area;
  crime = req.body.crime;
  starttime = req.body.starttime;
  endtime = req.body.endtime;
  console.log(area);
  mainQuery =  `SELECT DISTINCT Locations.Location
                FROM Locations, Dummy, Areas, Crime_Codes, Times
                WHERE Locations.Location_Id = Dummy.Location_Id
                AND Dummy.Area_Id = Areas.Area_Id
                AND Areas.Area_Name = '`+ area +`'
                AND Dummy.Crime_Code = Crime_Codes.Crime_Code
                AND Crime_Codes.Crime_Code_Description LIKE '%` + crime + `%'
                AND Dummy.Time_Id = Times.Time_Id
                AND Times.TimeTime > ` + starttime + `
                AND Locations.Location <> '(0, 0)'
                AND Times.TimeTime < ` + endtime;
  oracledb.getConnection(
    {
      user: process.env.DB_USER || "dkakwani",
      password: process.env.DB_PASSWORD || "Decay2435",
      connectString:
        "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    },
    function(err, connection) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(mainQuery);
      connection.execute(
        mainQuery,
        [],async function(err,result){
          if(err){
            console.log(err);
            return;
          } else{
            arr = result.rows;
            //console.log(arr);
            var temp2 = [];
            for(var i = 0;i < arr.length;i++){

              var temp = arr[i][0].split(",");

              temp[0] = temp[0].substring(1);
              temp[1] = temp[1].substring(0,temp[1].length-1);
              var temp3 = [];
              temp3.push(Number(temp[0]));
              temp3.push(Number(temp[1]));
              temp2.push(temp3);

            }

            await new Promise(resolve => setTimeout(resolve,5000));
            res.render('../views/crimeData.ejs', {arr: temp2, data: []});
          }
        }
      );
    }
  );

});




module.exports = router;
