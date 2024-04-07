const express = require('express');
const cors = require('cors');

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;
const JSON_FILE = 'details.json';
const usersFilePath = 'users.json';

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
  

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
  
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Please provide username, password, and role' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = {
        username,
        password: hashedPassword,
        role
      };
  
      const data = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(data);
      users.push(newUser);
  
      await fs.writeFile(usersFilePath, JSON.stringify(users));
      
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


// Авторизация пользователя
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
  
    try {
      const data = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(data);
      const user = users.find(u => u.username === username);
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      const result = await bcrypt.compare(password, user.password);
  
      if (result) {
        return res.status(200).json({ message: 'Login successful', role: user.role });
      } else {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Получение списка всех деталей
app.get('/details', async (req, res) => {
    try {
        const data = await fs.readFile(JSON_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Получение одной детали по ID
app.get('/details/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await fs.readFile(JSON_FILE, 'utf8');
        const details = JSON.parse(data);
        const detail = details.find(detail => detail.id === id);
        if (!detail) {
            res.status(404).json({ message: 'Detail not found' });
        } else {
            res.json(detail);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Создание новой детали
app.post('/details', async (req, res) => {
    try {
        const data = await fs.readFile(JSON_FILE, 'utf8');
        const details = JSON.parse(data);
        const newDetail = req.body;
        details.push(newDetail);
        await fs.writeFile(JSON_FILE, JSON.stringify(details, null, 2));
        res.status(201).json({ message: 'Detail created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Обновление существующей детали
app.put('/details/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await fs.readFile(JSON_FILE, 'utf8');
        let details = JSON.parse(data);
        const index = details.findIndex(detail => detail.id === id);
        if (index === -1) {
            res.status(404).json({ message: 'Detail not found' });
        } else {
            details[index] = req.body;
            await fs.writeFile(JSON_FILE, JSON.stringify(details, null, 2));
            res.json({ message: 'Detail updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Удаление детали
app.delete('/details/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await fs.readFile(JSON_FILE, 'utf8');
        let details = JSON.parse(data);
        details = details.filter(detail => detail.id !== id);
        await fs.writeFile(JSON_FILE, JSON.stringify(details, null, 2));
        res.json({ message: 'Detail deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
