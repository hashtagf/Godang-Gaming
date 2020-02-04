const express = require("express");
const app = express();
var mysql = require("mysql");
const cors = require("cors");
var request = require("request");
const jwt = require("jsonwebtoken");
var axios = require("axios");
const fs = require("fs");
var https = require("http");

const logger = require("morgan");
const bodyParser = require("body-parser");
var redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;
// var privateKey = fs.readFileSync('SSL/private.key').toString()
// var certificate = fs.readFileSync('SSL/certificate.pem').toString()
// var ca = fs.readFileSync('SSL/ca_bundle.pem').toString()
// var options = {
//   key: privateKey,
//   cert: certificate,
//   ca: ca
// }

// var server = https.createServer(options, app)
var server = https.createServer(app);
var io = require("socket.io")(server);
// app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301))
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.set("view engine", "html");

var serviceSQL = [];

// var connection = mysql.createConnection({
//   host: "abatopup.c0skt7cppmab.ap-southeast-1.rds.amazonaws.com",
//   user: "abaoffice_user",
//   password: "@Aa112233/*",
//   database: "abaoffice_db"
// });

connection.query("SET @@session.time_zone = 'Asia/Bangkok'");
connection.connect(function(err) {
  if (err) console.log(err);
  console.log("Connected! ");
});

// connection.query(
//   "SELECT * FROM t_database_config WHERE status = 1",
//   (error, results) => {
//     if (error) console.log(error);
//     results.forEach(val => {
//       serviceSQL[val.service] = mysql.createConnection({
//         host: val.db_host,
//         user: val.db_username,
//         password: val.db_password,
//         database: val.db_database
//       });
//       serviceSQL[val.service].query("SET @@session.time_zone = 'Asia/Bangkok'");
//     });
//   }
// );

// Socket io
io.on("connection", function(socket) {
  console.log("a user connected ", socket.id);
});

server.listen(5000, () => {
  console.log("Start server at port " + 5000 + " >> localhost:" + 5000);
});

app.use(cors());
app.use(async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET");
    return res.status(200).json({});
  }

  if (
    req.path == "/api" ||
    req.path == "/api/login" ||
    (req.path.match("/api/register") && req.method == "GET") ||
    req.path.match("/socket.io")
  ) {
    req.user = {
      username: "guest"
    };
  } else {
    let token = "";

    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];

      jwt.verify(token, "@ABAOFFICEkey*", (err, payload) => {
        if (payload) {
          req.user = payload.user[0];
          console.log("name : ", req.user.name);
        } else {
          process.exit();
          next();
          return res.json({
            code: "ERROR_AUTH",
            msg: "ERROR_AUTH"
          });
        }
      });
    } else {
      process.exit();
      next();
      return res.json({
        code: "ERROR_AUTH",
        msg: "ERROR_AUTH"
      });
    }
  }
  if (req.method == "POST" || req.method == "PUT") {
    jwt.verify(req.body.payload, "@ABAOFFICEkey*", (err, payload) => {
      if (payload) {
        req.body = payload;

        delete req.body.iat;
        delete req.body.exp;
      } else {
        res.json({
          code: "ERROR_PAYLOAD",
          msg: "PAYLOAD_NOT_KEY_OR_TIMEOUT"
        });
      }
    });
  }
  next();
});
axios.defaults.headers.common["cache-control"] = "no-cache";
// send params
app.use(function(req, res, next) {
  req.serviceSQL = serviceSQL;
  req.connection = connection;
  req.axios = axios;
  (req.insertLog = insertLog), (req.io = io);
  next();
});
// import routes
var deposit = require("./routes/deposit");
var withdraw = require("./routes/withdraw");
var history = require("./routes/history");
var member = require("./routes/member");
var credit = require("./routes/credit");
var bonus = require("./routes/bonus");
var statement = require("./routes/statement");
var news = require("./routes/news");
var dashboard = require("./routes/dashboard");
var ranking = require("./routes/ranking");
var report = require("./routes/report");
var admin = require("./routes/admin");
var settingIP = require("./routes/settingIP");
var transaction = require("./routes/transaction");
var telesale = require("./routes/telesale");
// routes
app.use("/api/deposit", deposit);
app.use("/api/withdraw", withdraw);
app.use("/api/history", history);
app.use("/api/member", member);
app.use("/api/credit", credit);
app.use("/api/bonus", bonus);
app.use("/api/statement", statement);
app.use("/api/news", news);
app.use("/api/dashboard", dashboard);
app.use("/api/ranking", ranking);
app.use("/api/report", report);
app.use("/api/admin", admin);
app.use("/api/settingIP", settingIP);
app.use("/api/transaction", transaction);
app.use("/api/telesale", telesale);

app.get("/api/", (req, res) => {
  res.send("TOPUP OFFICE API");
});

app.get("/api/login", (req, res) => {
  let payload = {
    grant_type: "authorization_code",
    code: req.query.code,
    // redirect_uri: 'https://office.heng789.com/login',
    redirect_uri: req.query.url,
    client_id: "1653427888",
    client_secret: "964242275173e0c40a72107c3f406756"
  };
  var options = {
    method: "POST",
    url: "https://api.line.me/oauth2/v2.1/token",
    headers: {
      "cache-control": "no-cache",
      Connection: "keep-alive",
      Host: "api.line.me",
      "Cache-Control": "no-cache",
      Accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    form: payload
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    let access_token = JSON.parse(body).access_token;
    var options = {
      method: "GET",
      url: "https://api.line.me/v2/profile",
      headers: {
        "cache-control": "no-cache",
        Connection: "keep-alive",
        Host: "api.line.me",
        "Cache-Control": "no-cache",
        Accept: "*/*",
        "User-Agent": "PostmanRuntime/7.16.3",
        Authorization: "Bearer " + access_token
      }
    };
    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      let lineData = JSON.parse(body);

      connection.query(
        'SELECT * FROM t_account_office a JOIN t_user_permission p ON a.id = p.userId WHERE line_userId="' +
          lineData.userId +
          '" AND status = 1',
        (error, user, fields) => {
          if (error)
            throw res.json({
              code: "ERROR",
              msg: "ERROR"
            });
          if (user.length > 0) {
            connection.query(
              "UPDATE t_account_office SET " +
                "line_displayName='" +
                lineData.displayName +
                "', line_statusMessage='" +
                lineData.statusMessage +
                "', line_image='" +
                lineData.pictureUrl +
                "', access_token='" +
                access_token +
                "', last_login=CURRENT_TIMESTAMP" +
                ", detail='" +
                req.query.detail +
                "', last_iplogin='" +
                req.query.detail +
                "' WHERE line_userId='" +
                lineData.userId +
                "'",
              (error, results) => {
                connection.query("SELECT * FROM t_group", (error, ipLock) => {
                  if (error)
                    throw res.json({
                      code: "ERROR",
                      msg: "ERROR"
                    });
                  if (user[0].level >= 6) {
                    jwt.sign(
                      { user },
                      "@ABAOFFICEkey*",
                      { expiresIn: "1h" },
                      (err, token) => {
                        res.json({
                          code: "SUCCESS",
                          token: token
                        });
                      }
                    );
                  } else if (ipLock[0].ip_lock == req.query.detail) {
                    jwt.sign(
                      { user },
                      "@ABAOFFICEkey*",
                      { expiresIn: "1h" },
                      (err, token) => {
                        res.json({
                          code: "SUCCESS",
                          token: token
                        });
                      }
                    );
                  } else {
                    res.json({
                      code: "ERROR",
                      msg:
                        "IP ที่ใช้ Login ของคุณไม่ถูกต้อง โปรดไป Login ที่ออฟฟิศ"
                    });
                  }
                });
              }
            );
          } else {
            res.json({
              code: "ERROR",
              msg: "ไม่พบพนักงานในระบบ"
            });
          }
        }
      );
    });
  });
});

app.get("/api/isLogin", (req, res) => {
  connection.query(
    'SELECT * FROM t_account_office a JOIN t_user_permission p ON a.id = p.userId WHERE line_userId="' +
      req.user.line_userId +
      '"',
    (error, user, fields) => {
      if (error)
        res.json({
          code: "ERROR",
          msg: "ERROR"
        });
      if (user.length > 0) {
        jwt.sign(
          { user },
          "@ABAOFFICEkey*",
          { expiresIn: "1h" },
          (err, token) => {
            res.json({
              code: "SUCCESS",
              token: token
            });
          }
        );
      } else {
        res.json({
          code: "ERROR",
          msg: "NOT FOUND USER"
        });
      }
    }
  );
});

app.post("/api/register", (req, res) => {
  let payload = {
    name: req.body.name,
    key_register: req.body.key_register,
    phone_number: req.body.phone_number,
    usertype: req.body.usertype,
    group_name: req.body.group_name
  };
  connection.query(
    "INSERT INTO `t_account_office` SET ?",
    payload,
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });

      let permission;
      if (req.body.usertype == "ceo") {
        permission = {
          userId: results.insertId,
          level: 9,
          credit_manager: 1,
          credit_return: 1,
          credit_delete: 1,
          point_delete: 1,
          diamond_delete: 1,
          withdraw_manager: 1,
          withdraw_add: 1,
          bonus_add: 1,
          working_log: 1,
          view_phone: 1,
          view_dashboard: 1,
          user_manager: 1,
          report_manager: 1,
          setting_bonus: 1,
          setting_statement: 1
        };
      } else if (req.body.usertype == "manager") {
        permission = {
          userId: results.insertId,
          level: 7,
          credit_manager: 1,
          credit_return: 1,
          credit_delete: 1,
          point_delete: 1,
          diamond_delete: 1,
          withdraw_manager: 1,
          withdraw_add: 1,
          bonus_add: 1,
          working_log: 1,
          view_phone: 1,
          view_dashboard: 0,
          user_manager: 1,
          report_manager: 0,
          setting_bonus: 1,
          setting_statement: 1
        };
      } else if (req.body.usertype == "marketing") {
        permission = {
          userId: results.insertId,
          level: 6.5,
          credit_manager: 0,
          credit_return: 0,
          credit_delete: 0,
          point_delete: 0,
          diamond_delete: 0,
          withdraw_manager: 0,
          withdraw_add: 0,
          bonus_add: 1,
          working_log: 0,
          view_phone: 0,
          view_dashboard: 0,
          user_manager: 0,
          report_manager: 0,
          setting_bonus: 1,
          setting_statement: 0
        };
      } else if (req.body.usertype == "head") {
        permission = {
          userId: results.insertId,
          level: 5,
          credit_manager: 1,
          credit_return: 1,
          credit_delete: 1,
          point_delete: 0,
          diamond_delete: 0,
          withdraw_manager: 1,
          withdraw_add: 0,
          bonus_add: 1,
          working_log: 0,
          view_phone: 1,
          view_dashboard: 0,
          user_manager: 1,
          report_manager: 0,
          setting_bonus: 0,
          setting_statement: 0
        };
      } else if (req.body.usertype == "withdraw") {
        permission = {
          userId: results.insertId,
          level: 3,
          credit_manager: 1,
          credit_return: 1,
          credit_delete: 1,
          point_delete: 0,
          diamond_delete: 0,
          withdraw_manager: 1,
          withdraw_add: 0,
          bonus_add: 1,
          working_log: 0,
          view_phone: 0,
          view_dashboard: 0,
          user_manager: 0,
          report_manager: 0,
          setting_bonus: 0,
          setting_statement: 0
        };
      } else {
        permission = {
          userId: results.insertId,
          level: 1,
          credit_manager: 0,
          credit_return: 0,
          credit_delete: 0,
          point_delete: 0,
          diamond_delete: 0,
          withdraw_manager: 0,
          withdraw_add: 0,
          bonus_add: 0,
          working_log: 0,
          view_phone: 0,
          view_dashboard: 0,
          user_manager: 0,
          report_manager: 0,
          setting_bonus: 0,
          setting_statement: 0
        };
      }

      connection.query(
        "INSERT INTO t_user_permission SET ?",
        permission,
        (error, results) => {
          if (error)
            throw res.json({
              code: "ERROR",
              msg: "ERROR"
            });

          req.insertLog(
            req.user.name,
            "เพิ่มพนักงาน",
            req.body.name,
            0,
            "เพิ่มพนักงาน ชื่อ " +
              req.body.name +
              " เบอร์ " +
              req.body.phone_number +
              " ตำแหน่ง " +
              req.body.usertype,
            req.params.service
          );
          res.json({
            code: "SUCCESS",
            payload: results
          });
        }
      );
    }
  );
});

app.get("/api/register/:key", (req, res) => {
  let payload = {
    grant_type: "authorization_code",
    code: req.query.code,
    // redirect_uri: 'https://office.heng789.com/login?key_register=' + req.params.key,
    redirect_uri: "http://localhost:8080/login?key_register=" + req.params.key,
    client_id: "1653427888",
    client_secret: "964242275173e0c40a72107c3f406756"
  };
  var options = {
    method: "POST",
    url: "https://api.line.me/oauth2/v2.1/token",
    headers: {
      "cache-control": "no-cache",
      Connection: "keep-alive",
      Host: "api.line.me",
      "Cache-Control": "no-cache",
      Accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    form: payload
  };
  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    let access_token = JSON.parse(body).access_token;
    console.log(access_token);
    var options = {
      method: "GET",
      url: "https://api.line.me/v2/profile",
      headers: {
        "cache-control": "no-cache",
        Connection: "keep-alive",
        Host: "api.line.me",
        "Cache-Control": "no-cache",
        Accept: "*/*",
        "User-Agent": "PostmanRuntime/7.16.3",
        Authorization: "Bearer " + access_token
      }
    };

    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      let lineData = JSON.parse(body);
      connection.query(
        'SELECT * FROM t_account_office WHERE key_register="' +
          req.params.key +
          '"',
        (error, user, fields) => {
          if (error)
            throw res.json({
              code: "ERROR",
              msg: "ERROR"
            });
          if (user.length > 0) {
            connection.query(
              "UPDATE t_account_office SET " +
                "line_displayName='" +
                encodeURI(lineData.displayName) +
                "', line_statusMessage='" +
                encodeURI(lineData.statusMessage) +
                "', line_image='" +
                lineData.pictureUrl +
                "', access_token='" +
                access_token +
                "', last_login=CURRENT_TIMESTAMP" +
                " , line_userId='" +
                lineData.userId +
                "', key_register='" +
                access_token +
                "' , detail='" +
                req.query.detail +
                "' , last_iplogin ='" +
                req.query.detail +
                "' WHERE key_register='" +
                req.params.key +
                "'",
              (error, results) => {
                connection.query(
                  'SELECT * FROM t_account_office WHERE key_register="' +
                    access_token +
                    '"',
                  (error, user, fields) => {
                    if (error)
                      res.json({
                        code: "ERROR",
                        msg: "ERROR"
                      });
                    connection.query(
                      "SELECT * FROM t_group",
                      (error, ipLock) => {
                        if (error)
                          res.json({
                            code: "ERROR",
                            msg: "ERROR"
                          });
                        if (user[0].level >= 6) {
                          jwt.sign(
                            { user },
                            "@ABAOFFICEkey*",
                            { expiresIn: "1h" },
                            (err, token) => {
                              res.json({
                                code: "SUCCESS",
                                token: token
                              });
                            }
                          );
                        } else if (ipLock[0].ip_lock == req.query.detail) {
                          jwt.sign(
                            { user },
                            "@ABAOFFICEkey*",
                            { expiresIn: "1h" },
                            (err, token) => {
                              res.json({
                                code: "SUCCESS",
                                token: token
                              });
                            }
                          );
                        } else {
                          res.json({
                            code: "ERROR",
                            msg:
                              "IP ที่ใช้ Login ของคุณไม่ถูกต้อง โปรดไป Login ที่ออฟฟิศ"
                          });
                        }
                      }
                    );
                  }
                );
              }
            );
          } else {
            res.json({
              code: "ERROR",
              msg: "NOT FOUND USER"
            });
          }
        }
      );
    });
  });
});

app.get("/api/user/:group_name", (req, res) => {
  connection.query(
    'SELECT *, (last_login > CURRENT_TIMESTAMP - INTERVAL 1 HOUR) is_online FROM t_account_office WHERE group_name = "' +
      req.params.group_name +
      '" AND usertype != "admin" AND status = 1',
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });

      res.json({
        code: "SUCCESS",
        payload: results
      });
    }
  );
});

app.delete("/api/user/:id/:name/:group_name", (req, res) => {
  connection.query(
    "UPDATE  t_account_office SET status = '0', line_userId=NULL WHERE id = '" +
      req.params.id +
      "'",
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });
      res.json({
        code: "SUCCESS",
        payload: results
      });
      // connection.query(
      //   "DELETE FROM t_user_permission WHERE userId = '" + req.params.id + "'",
      //   (error, results) => {
      //     req.insertLog(
      //       req.user.name,
      //       "ลบพนักงาน",
      //       req.params.name,
      //       req.params.id,
      //       "ลบพนักงาน ชื่อ " + req.params.name,
      //       req.params.service
      //     );
      //   }
      // );
    }
  );
});

app.post("/api/userData/:group_name", (req, res) => {
  connection.query(
    "SELECT * FROM t_account_office  WHERE id='" + req.body.id + "' LIMIT 1",
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });
      connection.query(
        "SELECT * FROM t_user_permission WHERE userId='" +
          req.body.id +
          "' LIMIT 1",
        (error, permission) => {
          if (error)
            throw res.json({
              code: "ERROR",
              msg: "ERROR"
            });
          for (var val in permission[0]) {
            if (val != "id" && val != "userId" && val != "level") {
              permission[0][val] = permission[0][val] ? true : false;
            }
          }
          res.json({
            code: "SUCCESS",
            payload: results[0],
            permission: permission[0]
          });
        }
      );
    }
  );
});

app.post("/api/updatePermission/:group_name", (req, res) => {
  for (var val in req.body) {
    if (val != "id" && val != "userId") {
      req.body[val] = req.body[val] ? 1 : 0;
    }
  }
  connection.query(
    "UPDATE t_account_office SET usertype = '" +
      req.query.usertype +
      "' WHERE id = '" +
      req.body.userId +
      "'"
  );
  connection.query(
    "UPDATE t_user_permission SET credit_manager = '" +
      req.body.credit_manager +
      "', credit_return = '" +
      req.body.credit_return +
      "' , credit_delete = '" +
      req.body.credit_delete +
      "' , point_delete = '" +
      req.body.point_delete +
      "' , diamond_delete = '" +
      req.body.diamond_delete +
      "' , withdraw_manager = '" +
      req.body.withdraw_manager +
      "' , withdraw_add = '" +
      req.body.withdraw_add +
      "' , bonus_add = '" +
      req.body.bonus_add +
      "' , working_log = '" +
      req.body.working_log +
      "' , view_phone = '" +
      req.body.view_phone +
      "' , view_dashboard = '" +
      req.body.view_dashboard +
      "' , user_manager = '" +
      req.body.user_manager +
      "', report_manager = '" +
      req.body.report_manager +
      "', setting_bonus = '" +
      req.body.setting_bonus +
      "', setting_statement = '" +
      req.body.setting_statement +
      "' WHERE userId = '" +
      req.body.userId +
      "'",
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });
      req.insertLog(
        req.user.name,
        "แก้ไขสิทธิ",
        0,
        0,
        "แก้ไขสิทธิ " + JSON.stringify(req.body),
        req.params.service
      );
      res.json({
        code: "SUCCESS",
        msg: "UPDATE_PERMISSION"
      });
    }
  );
});

app.get("/api/service/:group_name", (req, res) => {
  connection.query(
    'SELECT service,firebase_url FROM t_database_config WHERE group_name="' +
      req.params.group_name +
      '" AND status = 1',
    (error, results) => {
      console.log(error);
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });
      res.json({
        code: "SUCCESS",
        payload: results
      });
    }
  );
});

app.post("/api/bank/:service", (req, res) => {
  connection.query(
    "SELECT id value, bank_full_name label, bank_code code, bank_id FROM t_bank_config WHERE service = '" +
      req.params.service +
      "' AND type = '" +
      req.body.type +
      "' AND status = 1",
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: error
        });
      res.json({
        code: "SUCCESS",
        payload: results
      });
    }
  );
});

// withdraw Statement
app.post("/api/username/:service", (req, res) => {
  serviceSQL[req.params.service].query(
    "SELECT bank_number, bank_code, full_name FROM t_member_account WHERE username='" +
      req.body.username +
      "'",
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });
      res.json({
        code: "SUCCESS",
        payload: results
      });
    }
  );
});

app.post("/api/log/:service", (req, res) => {
  serviceSQL[req.params.service].query(
    "SELECT * FROM t_working_log WHERE date='" +
      req.body.date +
      "' ORDER BY id DESC",
    (error, results) => {
      if (error)
        throw res.json({
          code: "ERROR",
          msg: "ERROR"
        });
      res.json({
        code: "SUCCESS",
        payload: results
      });
    }
  );
});

function insertLog(operator, title, username, change, detail, service) {
  let logData = {
    operator: operator,
    title: title,
    username: username,
    change: change,
    date: new Date(),
    time: new Date(),
    detail: detail
  };
  if (service == undefined) {
    connection.query("INSERT INTO t_working_log SET ?", logData);
  } else {
    serviceSQL[service].query("INSERT INTO t_working_log SET ?", logData);
  }
}
