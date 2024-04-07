import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './../css/Header.css'


function Header() {
  const [user, setUser] = useState(null);

  let navigate = useNavigate();

  useEffect(() => {
    // Проверка токена
    const checkToken = async () => {
      try {
        const token = localStorage.getItem("tokenAuthDetail")
        console.log(token);
        if (token) {
          const response = await axios.get('http://localhost:3001/api/user-role', {
            headers: { Authorization: token }
          });
          setUser({
            username: response.data.username,
            role: response.data.role
          });
          console.log("token good")
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };
    checkToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tokenAuthDetail');
    setUser(null);
    navigate(`/`);
    window.location.reload()
  };

  return (
    <header>
      <div className='header-nav'>
        <Link to={`/`} className="btn-home-back catalog">Каталог деталей</Link>
        {user ? (
          <>
            <div className='user-profile'>
              <span className='user-profile__name'>{user.username}</span>
              <span className='user-profile__role'> ({user.role})</span>
            <button onClick={handleLogout} className="btn-exit">Выход</button>
            </div>
            
          </>
        ) : (
          <>
          <div className='user-profile'>
            <Link to={`/register`} className="btn-auth">Регистрация</Link>
            <Link to={`/login`} className="btn-auth">Вход</Link>
          </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
