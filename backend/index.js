import express from "express";
import mysql from "mysql2";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "abm",
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json("this is the backend");
});

app.get("/users", (req, res) => {
  const q = "SELECT * FROM users";
  db.query(q, (error, data) => {
    if (error) {
      return res.json(error);
    } else {
      return res.json(data);
    }
  });
});

app.post("/users", (req, res) => {
  const q = "INSERT INTO USERS (`username`, `password`) VALUES (?)";
  const values = [req.body.username, req.body.password];

  db.query(q, [values], (error, data) => {
    if (error) {
      return res.json(error);
    } else {
      return res.json("user created");
    }
  });
});

app.listen(8800, () => {
  console.log("Connected");
});
