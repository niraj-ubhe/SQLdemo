const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2kitty@home",
  database: "testdb",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//home page route
app.get("/home", (req, res) => {
  let q = "SELECT count(*) FROM user";
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("error occured");
  }
});

//show all users route
app.get("/users", (req, res) => {
  let q = "SELECT * FROM user";
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showUsers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("error occured");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id= '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("error occured");
  }
});

//update route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;
  let q = `SELECT * FROM user WHERE id= '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("WRONG PASSWORD");
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id= '${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/users");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("error occured");
  }
});

app.get("/users/add", (req, res) => {
  res.render("newUser.ejs");
});

app.post("/users/add", (req, res) => {
  let id = faker.string.uuid();
  let { username: newUser, email: newEmail, password: newPassword } = req.body;
  let q3 = `INSERT INTO user(id, username, email, password) VALUES ('${id}', '${newUser}', '${newEmail}', '${newPassword}')`;
  try {
    connection.query(q3, (err, result) => {
      if (err) throw err;
      res.redirect("/users");
    });
  } catch (err) {
    console.log(err);
    res.send("error occured");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id= '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("error occured");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            res.redirect("/users");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
