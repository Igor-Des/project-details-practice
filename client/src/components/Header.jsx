import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';


import './../css/Header.css'

function Header() {
  return (
    <header>
      <div className='header-nav'>
      <Link to={`/`} className="btn-home-back">Каталог деталей</Link>
      <Link to={`/register`} className="btn-home-back">Register</Link>
      <Link to={`/login`} className="btn-home-back">Login</Link>
      </div>
    </header>
  );
}

export default Header;
