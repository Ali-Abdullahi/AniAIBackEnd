const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./aniask.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Successfully connected to the aniask.db SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL)`, (err) => {
    if (err) {
      return console.error("Error creating chats table:", err.message);
    }
    console.log("Chats table is ready.");
  });


  db.run(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT,chat_id INTEGER NOT NULL,sender TEXT NOT NULL,text TEXT NOT NULL,FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE)`, (err) => {
    if (err) {
      return console.error("Error creating messages table:", err.message);
    }
    console.log("Messages tabe is ready.");
  });
});


db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Database connection closed.');
});