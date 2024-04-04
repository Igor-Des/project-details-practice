// NotFound.jsx
import React from 'react';
import './../css/NotFound.css';
import { BrowserRouter as Router, Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>Страница не найдена</h1>
      <img
        className="not-found__image"
        src={'./images/image-404.jpg'}
        alt="loading image"
      />
      <p>Извините, запрашиваемая страница не существует.</p>      
      <Link to={`/`} className="btn-home">Вернуться в каталог товаров</Link>
    </div>
  );
}

export default NotFound;
