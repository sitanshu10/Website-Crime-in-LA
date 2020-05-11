var express = require('express');
var oracledb = require('oracledb');
//const path = require("path");
var router = express.Router();
//var ejs = require('ejs');
const bodyParser = require("body-parser");
var chart = require("chart.js")

router.use(bodyParser.urlencoded({ extended: true }));

var data1 = [];
var data2 = [];

router.get("/", function(request, res, next) {
  res.render('../views/compareForm.ejs',{data1: [], data2: [], gtype: "",startage2: "",
            endage2: "", starttime2: "", endtime2: "", area2: ""});
});

/* GET users listing. */
router.post("/", async function(request, res) {

  var compareBasedOn = request.body.basedon;
  var starttime = request.body.starttime;
  var endtime = request.body.endtime;
  var areaName = request.body.area;
  var startage = request.body.startage;
  var endage = request.body.endage;
  var timeQuery;
  var areaQuery;
  var ageQuery;
  var finaldata1 = [];
  var finaldata2 = [];
  console.log(compareBasedOn);
  console.log(starttime);
  console.log(endtime);
  console.log(startage);
  console.log(endage);
  console.log(areaName);


  oracledb.getConnection(
    {
      user          : "dkakwani",
      password      : "Decay2435",
      connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))"
    },
    async function(err, connection)
    {
      if (err) { console.error(err); return; }

      const mainQuery = `SELECT DISTINCT TO_CHAR(Dates.DateDate, 'YY') AS Year, COUNT(*) AS No_Of_Crimes
                          FROM Dummy, Dates, Times, Victims, Areas
                          WHERE Dummy.Date_Occurred_Id = Dates.Date_Id
                          AND Dummy.Time_Id = Times.Time_Id
                          AND Times.TimeTime > ` + starttime + `
                          AND Times.TimeTime < ` + endtime + `
                          AND Dummy.Victim_Id = Victims.Victim_Id
                          AND Victims.Victim_Age > ` + startage + `
                          AND Victims.Victim_Age < ` + endage + `
                          AND Dummy.Area_Id = Areas.Area_Id
                          AND Areas.Area_Name = '` + areaName + `'
                          GROUP BY TO_CHAR(Dates.DateDate, 'YY')
                          ORDER BY TO_CHAR(Dates.DateDate, 'YY')`;

      if(compareBasedOn == 'time') {
         timeQuery = `SELECT DISTINCT TO_CHAR(Dates.DateDate, 'YY') AS Year, COUNT(*) AS No_Of_Crimes
                            FROM Dummy, Dates, Victims, Areas
                            WHERE Dummy.Date_Occurred_Id = Dates.Date_Id
                            AND Dummy.Victim_Id = Victims.Victim_Id
                            AND Victims.Victim_Age > ` + startage + `
                            AND Victims.Victim_Age < ` + endage + `
                            AND Dummy.Area_Id = Areas.Area_Id
                            AND Areas.Area_Name = '` + areaName + `'
                            GROUP BY TO_CHAR(Dates.DateDate, 'YY')
                            ORDER BY TO_CHAR(Dates.DateDate, 'YY')`;

      }

      else if(compareBasedOn == 'area') {
        areaQuery = `SELECT DISTINCT TO_CHAR(Dates.DateDate, 'YY') AS Year, COUNT(*) AS No_Of_Crimes
                            FROM Dummy, Dates, Times, Victims
                            WHERE Dummy.Date_Occurred_Id = Dates.Date_Id
                            AND Dummy.Time_Id = Times.Time_Id
                            AND Times.TimeTime > ` + starttime + `
                            AND Times.TimeTime < ` + endtime + `
                            AND Dummy.Victim_Id = Victims.Victim_Id
                            AND Victims.Victim_Age > ` + startage + `
                            AND Victims.Victim_Age < ` + endage + `
                            GROUP BY TO_CHAR(Dates.DateDate, 'YY')
                            ORDER BY TO_CHAR(Dates.DateDate, 'YY')`;

      }

      else if(compareBasedOn == 'age') {
         ageQuery = `SELECT DISTINCT TO_CHAR(Dates.DateDate, 'YY') AS Year, COUNT(*) AS No_Of_Crimes
                            FROM Dummy, Dates, Times, Areas
                            WHERE Dummy.Date_Occurred_Id = Dates.Date_Id
                            AND Dummy.Time_Id = Times.Time_Id
                            AND Times.TimeTime > ` + starttime + `
                            AND Times.TimeTime < ` + endtime + `
                            AND Dummy.Area_Id = Areas.Area_Id
                            AND Areas.Area_Name = '` + areaName + `'
                            GROUP BY TO_CHAR(Dates.DateDate, 'YY')
                            ORDER BY TO_CHAR(Dates.DateDate, 'YY')`;
      }
      console.log(ageQuery);
      console.log(timeQuery);
      console.log(areaQuery);

      if(compareBasedOn == 'time'){

          connection.execute(
            timeQuery, [],
          function(err, result)
          {
            if (err) { console.error(err); return; }
            data1 = result.rows;
          });
          connection.execute(
            mainQuery, [],
          function(err, result)
          {
            if (err) { console.error(err); return; }
            data2 = result.rows;
          });
          await new Promise(resolve => setTimeout(resolve,4000));
          for(var i = 0;i < data1.length;i++){
            finaldata1[i] = data1[i][1];
            finaldata2[i] = data2[i][1];
          }
          console.log(finaldata1);
          console.log(finaldata2);
          res.render('../views/compareForm.ejs', {data1: finaldata1, data2: finaldata2, gtype: 'Time',
                    startage2: startage, endage2: endage, starttime2: starttime, endtime2: endtime, area2: areaName});

      } else if(compareBasedOn == 'area'){
        connection.execute(
          areaQuery, [],
        function(err, result)
        {
          if (err) { console.error(err); return; }
          data1 = result.rows;
        });
        connection.execute(
          mainQuery, [],
        function(err, result)
        {
          if (err) { console.error(err); return; }
          data2 = result.rows;
        });
        await new Promise(resolve => setTimeout(resolve,4000));
        for(var i = 0;i < data1.length;i++){
          finaldata1[i] = data1[i][1];
          finaldata2[i] = data2[i][1];
        }
        console.log(finaldata1);
        console.log(finaldata2);
        res.render('../views/compareForm.ejs', {data1: finaldata1, data2: finaldata2, gtype: 'Area',
                  startage2: startage, endage2: endage, starttime2: starttime, endtime2: endtime, area2: areaName});
        } else if(compareBasedOn == 'age'){
        connection.execute(
          ageQuery, [],
        function(err, result)
        {
          if (err) { console.error(err); return; }
          data1 = result.rows;
        });
        connection.execute(
          mainQuery, [],
        function(err, result)
        {
          if (err) { console.error(err); return; }
          data2 = result.rows;
        });
        await new Promise(resolve => setTimeout(resolve,4000));
        for(var i = 0;i < data1.length;i++){
          finaldata1[i] = data1[i][1];
          finaldata2[i] = data2[i][1];
        }
        console.log(finaldata1);
        console.log(finaldata2);
        res.render('../views/compareForm.ejs', {data1: finaldata1, data2: finaldata2, gtype: 'Age',
                  startage2: startage, endage2: endage, starttime2: starttime, endtime2: endtime, area2: areaName});
      }



  });
});
function doRelease(connection) {
  connection.release(function(err) {
    if (err) {
      console.error(err.message);
    }
  });
}

module.exports = router;
