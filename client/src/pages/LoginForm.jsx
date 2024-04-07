import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import './../css/LoginForm.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    let navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        console.log("response")
        const response = await axios.post('http://localhost:3001/api/login', { username, password });
        console.log('Login successful');
        setError('');
        // Сохраняем токен в localStorage
        localStorage.setItem('tokenAuthDetail', response.data.token);
        
        navigate(`/`);
        window.location.reload()
      } catch (error) {
        console.error('Error logging in:', error);
        setError('Неверный логин или пароль');
    }
    };
  
    return (
      <div className="login-container">
            <h2>Авторизация</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Логин:</label>
                    <input type="text" id="username" placeholder="Введите логин" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Пароль:</label>
                    <input type="password" id="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn-login">Войти</button>
            <Link to={`/register`} className="btn-login__reg">Регистрация</Link>
            </form>
        </div>
    );
  };

export default LoginForm;
