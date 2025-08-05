const express= require('express');
const cors= require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai"); 
const dotenv= require('dotenv');
const app= express()
const PORT=3000;
const sqlite3 = require('sqlite3').verbose();
dotenv.config();
const GEMINI_API_KEY=process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./aniask.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Successfully connected to the aniask.db database in server.');
  });


  app.post('/chats', (req, res) => {
    const defaultTitle = "New Chat";
  
    const sql = `INSERT INTO chats (title) VALUES (?)`;
    
    db.run(sql, [defaultTitle], function(err) {
      if (err) {
        console.error("Database error creating new chat:", err.message);
        return res.status(500).json({ error: "Could not create a new chat." });
      }
  
      
      const newChatId = this.lastID;1
      const welcomeMessage = "Hello! How can I help you with anime or manga today?";
  
      const messageSql = `INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)`;
      db.run(messageSql, [newChatId, 'AI', welcomeMessage], (err) => {
        if (err) {
          console.error("Database error creating welcome message:", err.message);
          return res.status(500).json({ error: "Could not create welcome message." });
        }

        const newChat = {
          id: newChatId,
          title: defaultTitle,
          messages: [
            { id: 1, chat_id: newChatId, sender: 'AI', text: welcomeMessage }
          ]
        };
        return res.status(201).json(newChat); 
      });
    });
  });
  
  app.get('/chats', (req,res) => {

    const sql = `SELECT * FROM chats ORDER BY id DESC`; 
  
    db.all(sql, [], (err) => {
      if (err) {
        console.error("Database error getting chats:", err.message);
        return res.status(500).json({ error: "Could not retrieve chats." });
      }
      
    });
  });



const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/chat', async (req, res) => {

    const { prompt, chatId } = req.body;
  
    try {
      const userMessageSql = `INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)`;
      db.run(userMessageSql, [chatId, 'user', prompt]);
      const historySql = `SELECT * FROM messages WHERE chat_id = ? ORDER BY id ASC`;
      db.all(historySql, [chatId], async (err, rows) => {
        if (err) {
          console.error("Database error getting history:", err.message);
          return res.status(500).json({ error: "Could not get chat history." });
        }
  
        const formattedHistory = rows.map(message => ({
          role: message.sender === 'AI' ? 'model' : 'user',
          parts: [{ text: message.text }]
        }));

               
        if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            formattedHistory.shift(); 
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction:"You are AniAsk, a specialized AI assistant. Your sole purpose is to answer questions and discuss topics exclusively related to Japanese anime and manga. Be friendly, enthusiastic, and knowledgeable. Critically, if a user's question involves characters, series, or topics from outside the world of anime and manga (such as American comics, movies, or real-world figures), you must politely refuse to answer. For example, if asked about 'Goku vs. Superman', you must state that Superman is outside your area of expertise and you can only discuss matchups between anime and manga characters. If a user asks a question that is completely unrelated to anime or manga, you must also politely refuse and guide the conversation back to your area of expertise. Do not answer questions about other topics, even if you know the answer." });
        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const aiText = response.text();
  
        const aiMessageSql = `INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)`;
        db.run(aiMessageSql, [chatId, 'AI', aiText]); 
        
        res.json({ message: aiText });
      });
  
    } catch (error) {
      console.error('Error in /chat route:', error);
      res.status(500).json({ error: "An error occurred" });
    }
  });

app.listen(PORT,()=>{
    console.log(`Server Ready on http://localhost:${PORT}`)
})