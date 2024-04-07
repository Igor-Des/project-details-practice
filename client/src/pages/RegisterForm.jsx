import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './../css/RegisterForm.css';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    let navigate = useNavigate();
    let role = 'user';
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/register', { username, password, role });
            console.log('User registered successfully');
            setError('');
            navigate(`/login`);
            window.location.reload();
        } catch (error) {
            console.error('Error registering user:', error);
            setError('Регистрация не удалась. Заполните все поля корректно');
        }
    };

    return (
        <div className="register-container">
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Логин:</label>
                    <input type="text" id="username" placeholder="Введите логин" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Пароль:</label>
                    <input type="password" id="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn-register">Зарегистрироваться</button>
            </form>
        </div>
    );
};

export default RegisterForm;
