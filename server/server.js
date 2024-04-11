const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
// require('dotenv').config();

const app = express();
const PORT = 3001;
const JSON_FILE = 'details.json';
const usersFilePath = 'users.json';
const tokenKey = '1a2b-3c4d-5e6f-7g8h';

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Настройка хранения загруженных файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Путь к папке, где будут сохраняться изображения
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // Имя файла будет уникальным, чтобы избежать конфликтов
    }
});

const upload = multer({ storage: storage });

// Маршрут для обработки POST-запросов на загрузку изображений
app.post('/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      // При успешной загрузке вернуть имя загруженного файла
      res.json({ fileName: req.file.filename });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

// Middleware для проверки JWT токена и роли пользователя
const authenticateToken = (req, res, next) => {
    // Получаем токен из заголовка Authorization
    const token = req.headers['authorization'];

    // Проверяем наличие токена
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }
    // Верифицируем токен
    jwt.verify(token, tokenKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Если токен верен, добавляем информацию о пользователе в объект запроса
        req.user = decoded;
        // Переходим к следующему middleware
        next();
    });
};

// Middleware для проверки роли администратора
const checkAdminRole = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Error: Only admins are allowed' });
    }
    next();
};
// Получение роли пользователя
app.get('/api/user-role', authenticateToken, (req, res) => {
    const { role, username } = req.user;
    res.status(200).json({ role, username });
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(401).json({ message: 'Заполните все данные корректно!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data);

        // Проверка на существование пользователя с таким же именем
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            return res.status(402).json({ message: 'Пользователь с таким логином уже существует!' });
        }

        // Генерация нового ID на основе последнего ID в списке пользователей
        const lastUserId = users.length > 0 ? users[users.length - 1].id : 0;
        const newUser = {
            id: String(+lastUserId + 1),
            username,
            password: hashedPassword,
            role
        };

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
            // Генерация JWT токена
            const token = jwt.sign({ username, role: user.role }, tokenKey, { expiresIn: '60m' });
            return res.status(200).json({ message: 'Login successful', token });
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Получение всех пользователей
app.get('/api/users', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        const data = await fs.readFile(usersFilePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение пользователя по ID
app.get('/api/users/:id', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data);
        const user = users.find(user => user.id === id);
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
        } else {
            res.json(user);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Изменение роли пользователя
app.put('/api/users/:id', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        const id = req.params.id;
        const { role } = req.body;
        const data = await fs.readFile(usersFilePath, 'utf8');
        let users = JSON.parse(data);
        console.log(users);
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        users[userIndex].role = role;
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
        res.json(users[userIndex]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удаление пользователя по ID
app.delete('/api/users/:id', authenticateToken, checkAdminRole, async (req, res) => {
    try {
        console.log("delete app");
        const id = req.params.id;
        const data = await fs.readFile(usersFilePath, 'utf8');
        let users = JSON.parse(data);
        users = users.filter(user => user.id !== id);
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
        res.json({ message: 'Пользователь успешно удален' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
app.post('/details', authenticateToken, checkAdminRole, async (req, res) => {
    const { name, description, components, assemblyImg, disassemblyImg } = req.body;
  
    if (!name || !description || !components || !assemblyImg || !disassemblyImg) {
      return res.status(400).json({ message: 'Please provide all details' });
    }
  
    try {
      const data = await fs.readFile(JSON_FILE, 'utf8');
      const details = JSON.parse(data);
  
      // Генерация нового ID на основе последнего ID в списке деталей
      const lastDetailId = details.length > 0 ? details[details.length - 1].id : 0;
      const newDetail = {
        id: String(+lastDetailId + 1),
        name,
        description,
        components,
        assemblyImg,
        disassemblyImg
      };
  
      details.push(newDetail);
  
      await fs.writeFile(JSON_FILE, JSON.stringify(details, null, 2));
  
      res.status(201).json({ message: 'Detail created successfully', detail: newDetail });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Обновление существующей детали
app.put('/details/:id', authenticateToken, checkAdminRole, async (req, res) => {
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
app.delete('/details/:id', authenticateToken, checkAdminRole, async (req, res) => {
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
