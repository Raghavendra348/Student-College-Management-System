const sqlite3 = require("sqlite3").verbose();

const fs = require("fs");

const path = require("path");


const databasePath = path.join(
  __dirname,
  "college.db"
);


const schemaPath = path.join(
  __dirname,
  "schema.sql"
);


const db = new sqlite3.Database(
  databasePath,
  (error) => {

    if (error) {

      console.error(
        "SQLite connection error:",
        error.message
      );

      return;
    }

    console.log(
      "SQLite database connected successfully."
    );

  }
);


db.serialize(() => {

  db.run("PRAGMA foreign_keys = ON");


  const schema = fs.readFileSync(
    schemaPath,
    "utf8"
  );


  db.exec(
    schema,
    (error) => {

      if (error) {

        console.error(
          "Database schema error:",
          error.message
        );

        return;
      }

      console.log(
        "Database schema initialized successfully."
      );

    }
  );

});


module.exports = db;