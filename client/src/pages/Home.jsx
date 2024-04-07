import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import './../css/Card.css';
import './../css/Search.css';
import './../css/Popup.css';

function Home() {
  const [details, setDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDetailId, setDeleteDetailId] = useState(null);
  const [detailForDel, setDetailForDel] = useState(null);
  const [user, setUser] = useState({
    username: null,
    role: null
  });


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
    const fetchDetails = async () => {
      try {
        const response = await axios.get('http://localhost:3001/details');
        setDetails(response.data);
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    };

    const fetchData = async () => {
      await checkToken();
      await fetchDetails();
    };

    fetchData();

  }, []);
  
  const handleDeleteDetail = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/details/${id}`);
      const updatedDetails = details.filter(detail => detail.id !== id);
      setDeleteDetailId(null);
      setDetails(updatedDetails);
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };

  const handleConfirmDelete = (id, name, description) => {
    setDeleteDetailId(id);
    setDetailForDel({ id, name, description });
  };

  const filteredDetails = details.filter(detail =>
    detail.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const renderDetails = filteredDetails.map(({ id, name, assemblyImg, disassemblyImg, description }) => (
    <div key={id} className="detail-item">
      <img
        className="detail-item__image"
        src={'./images/' + assemblyImg}
        alt="loading image"
      />
      <div className="detail-info">
        <div className="detail-list">
          <p>Наименование: <span className="detail-list__name">{name}</span></p>
          <p>Описание: <span className="detail-list__desc">{description}</span></p>
        </div>
        <div className="detail-action">
          <Link to={`/details/${id}`} className="detail-action__info">Подробнее</Link>
          {user.role === 'admin' && (
            <>
              <Link to={`/details/edit/${id}`} className="detail-action__edit">Изменить</Link>
              <a href="#" className="detail-action__delete" onClick={() => handleConfirmDelete(id, name, description)}>Удалить</a>
            </>
          )}
        </div>
      </div>
    </div>
  ));

  return (
    <div>
      <div className="detail-search">
        <input
          className='detail-search__input'
          type="text"
          placeholder="Поиск по названию детали"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {renderDetails.length === 0 ? (
        <p>Деталей не найдено</p>
      ) : (
        <>
          {renderDetails}
        </>
      )}
      {deleteDetailId !== null && (
        <div className="popup">
          <div className="popup-inner">
            <p>Вы действительно хотите удалить данную деталь?</p>
            <hr />
            <p>Наименование: <span className='popup-inner__detail'>{detailForDel.name}</span></p>
            <p>Описание: <span className='popup-inner__detail'>{detailForDel.description}</span></p>
            <button className='popup-inner__btn delete' onClick={() => handleDeleteDetail(deleteDetailId)}>Удалить</button>
            <button className='popup-inner__btn' onClick={() => setDeleteDetailId(null)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
