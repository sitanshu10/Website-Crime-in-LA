var oracledb = require("oracledb");
var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
// app.set('view engine', 'ejs');
router.use(bodyParser.urlencoded({ extended: true }));
var area;
var crime;
var one = [];
var two = [];

router.get("/", function(req, res) {
  res.render("../views/see.ejs", {one: [], two: []});
});

router.post("/", async function(req, res) {
  settonull();
  handleaction(req, res);
  await new Promise(resolve => setTimeout(resolve, 22000));
  console.log(one);
  console.log(two);
  res.render("../views/see.ejs", {
    area: area,
    crime: crime,
    one: one,
    two: two
  });
});

function settonull() {
  one = [];
  two = [];
}
//handleOperation start
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
      }
      callback(request, response, connection);
    }
  );
} //handleOperation end

//handleaction start
function handleaction(req, res) {
  area = req.body.area;
  crime = req.body.crime;

  handleOperation(
    req,
    res,
    async function(request, response, connection) {

        mainQueryM =`SELECT AVG (Difference) AS Average
                     FROM (SELECT r1.Dr_Number, (r1.Reported_Date - r2.Occurred_Date) AS Difference
                           FROM (SELECT Dummy.Dr_Number, Dates.DateDate AS Reported_Date
                                 FROM Dummy, Dates
                                 WHERE Dummy.Date_Reported_Id = Dates.Date_Id) r1,
                                              (SELECT Dummy.Dr_Number, Dates.DateDate AS Occurred_Date
                                               FROM Dummy, Dates
                                               WHERE Dummy.Date_Occurred_Id = Dates.Date_Id) r2
                    WHERE r1.Dr_Number = r2.Dr_Number) r3, Dummy, Victims, Areas, Crime_Codes
                    WHERE r3.Dr_Number = Dummy.Dr_Number
                    AND Dummy.Victim_Id = Victims.Victim_Id
                    AND Victims.Victim_Sex = 'M'`;

        mainQueryF =`SELECT AVG (Difference) AS Average
                     FROM (SELECT r1.Dr_Number, (r1.Reported_Date - r2.Occurred_Date) AS Difference
                           FROM (SELECT Dummy.Dr_Number, Dates.DateDate AS Reported_Date
                                 FROM Dummy, Dates
                                 WHERE Dummy.Date_Reported_Id = Dates.Date_Id) r1,
                                              (SELECT Dummy.Dr_Number, Dates.DateDate AS Occurred_Date
                                               FROM Dummy, Dates
                                               WHERE Dummy.Date_Occurred_Id = Dates.Date_Id) r2
                    WHERE r1.Dr_Number = r2.Dr_Number) r3, Dummy, Victims, Areas, Crime_Codes
                    WHERE r3.Dr_Number = Dummy.Dr_Number
                    AND Dummy.Victim_Id = Victims.Victim_Id
                    AND Victims.Victim_Sex = 'F'`;

        semiQuery = `AND Dummy.Area_Id = Areas.Area_Id
                     AND Areas.Area_Name = '` + area + `'
                     AND Dummy.Crime_Code = Crime_Codes.Crime_Code
                     AND Crime_Codes.Crime_Code_Description LIKE '%` + crime +
                     `%'`;

        mainQueryM += semiQuery;
        mainQueryF += semiQuery;

        var age = [0,18,19,25,26,34,35,54,55,64,65,100];
        for(var i = 0;i < 11;i = i+2){
            var ageQuery = `AND Victims.Victim_Age >= `+ age[i] + ` AND Victims.Victim_Age <= ` + age[i+1];
            await new Promise(resolve => setTimeout(resolve, 3000));
            connection.execute( mainQueryM + ageQuery, {},
              function(err, result1) {
                  if (err) {
                    console.log(err);
                  } else {
                      one.push(result1.rows);
                      console.log(i);

                    }
                  }
            );
            connection.execute( mainQueryF + ageQuery, {},
              function(err, result2) {
                  if (err) {
                    console.log(err);
                  } else {
                     two.push(result2.rows);
                    }
                  }
            );
        }

        //console.log(mainQueryF);
        //console.log(mainQueryM);

    }
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

// app.listen(3002, function () {
//     console.log('server started on port 3002');
// });
