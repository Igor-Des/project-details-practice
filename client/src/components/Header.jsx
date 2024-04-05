import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';


import './../css/Header.css'

function Header() {
  return (
    <header>
      {/* <p>Каталог деталей</p> */}
      <Link to={`/`} className="btn-home-back">Каталог товаров</Link>
    </header>
  );
}

export default Header;
