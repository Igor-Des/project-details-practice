import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';


import './../css/Header.css'

function Header() {
  return (
    <header>
      <Link to={`/`} className="btn-home-back">Каталог деталей</Link>
    </header>
  );
}

export default Header;
