import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Card.css';

function App() {
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get('http://localhost:3001/details');
        setDetails(response.data);
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    };
    fetchDetails();
  }, []);

  return (
    <div>
      details:
      
      {details.map(({ id, name, assemblyImg, disassemblyImg, description, components }) => (
        <div key={id} className="detail-item">
          <img className="detail-item__image" src={'./images/' + assemblyImg}
          alt="loading image"/>
        <div className="detail-info">
          <div className="detail-list">
            <p>Наименование: <span className="detail-list__name">{name}</span></p>
            <p>Описание: <span className="detail-list__desc">{description}</span></p>
          </div>
          <div className="detail-action">
            <a className="detail-action__info" href="#">Подробнее</a>
            <a className="detail-action__edit" href="#">Изменить</a>
            <a className="detail-action__delete" href="#">Удалить</a>
          </div>
        </div>
        </div>
      ))}

    </div>
  );
}

export default App;
