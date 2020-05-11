const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const bodyParser = require("body-parser");
var oracledb = require("oracledb");
const exphbs = require("express-handlebars");

router.use(bodyParser.urlencoded({ extended: true }));

var startdate, enddate, starttime, endtime;
var first = [];

// Register Handlebars view engine

//  app.use("/", router);
// app.listen(process.env.port || 3000);
router.get("/", function(request, res, next) {
  // console.log("Hello world");
  res.render("tempdisplay.handlebars", {
   first: []
 });

  // res.sendFile(path.join(__dirname + "/view.html"));

  //__dirname : It will resolve to your project folder.
});

router.post("/", async function(req, res) {
  settonull();
  handleaction(req, res);
  console.log(starttime);
  await new Promise(resolve => setTimeout(resolve, 4000));
  // console.log(one);
  res.render("tempdisplay.handlebars", {
    first: first[0],
    startdate: startdate,
    enddate: enddate,
    starttime: starttime,
    endtime: endtime
  });

});
function settonull() {
  first = [];
}
function handleOperation(request, response, callback) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  response.setHeader("Access-Control-Allow-Credentials", true);

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
      }
      callback(request, response, connection);
    }
  );
} //handleOperation end

function handleaction(req, res) {
  startdate = req.body.startdate;
  starttime = req.body.starttime
  enddate = req.body.enddate;
  endtime = req.body.endtime;
  handleOperation(
    req,
    res,
    function(request, response, connection) {
        //    selectStatement= "select  EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED) ), count(*) from incident where incident.dr_no IN  ( SELECT reports.dr_no FROM location,reports where location.coordinates=reports.coordinates  and reports.crime_code IN  ( SELECT crime_code FROM crime WHERE  description LIKE '%'||:c||'%' ) and location.area_id= (SELECT area_id from area where area_name=:a)  ) group by  EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED)) ORDER BY EXTRACT(YEAR FROM TO_DATE(DATE_OCCURRED))" ;
        selectStatement = `SELECT Areas.Area_Name AS Area, COUNT(*) AS No_Of_Crimes ` +
                          `FROM Dummy, Areas, Dates, Times ` +
                          `WHERE Dummy.Area_Id = Areas.Area_Id AND Dummy.Time_Id = Times.Time_Id ` +
                          `AND Times.TimeTime > ` + starttime +
                          ` AND Times.TimeTime < ` + endtime +
                          ` AND Dummy.Date_Occurred_Id = Dates.Date_Id ` +
                          `AND Dates.DateDate > TO_DATE('` + startdate + `') ` +
                          `AND Dates.DateDate < TO_DATE('` + enddate + `') ` +
                          `GROUP BY Areas.Area_Name ` +
                          `ORDER BY Areas.Area_Name`;
        connection.execute( selectStatement, {},
          function(err, result){
            if(err){
              console.log(err);
            }else{
              var ans = result.rows;
              console.log(result.rows);
              var tempArr = [];
              tempArr.fill(0);
              for(var i = 0;i < ans.length;i++){
                tempArr[i] = ans[i][1];
              }
              first.push(tempArr);
              console.log(first);
            }
          }



           );

      //  console.log(selectStatement);

        // console.log(one);
    } //function
  );
}
function doRelease(connection) {
  connection.release(function(err) {
    if (err) {
      console.error(err.message);
    }
  });
}

module.exports = router;
