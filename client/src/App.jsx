import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './css/Card.css';
import './css/Search.css';
import './css/Pagination.css';
import './css/Popup.css';

import Header from './components/Header';

function App() {
  const [details, setDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDetailId, setDeleteDetailId] = useState(null);
  const [detailForDel, setDetailForDel] = useState(null);

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
    setDetailForDel({id, name, description});
  };

  const filteredDetails = details.filter(detail =>
    detail.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDetail = currentPage * 5;
  const indexOfFirstDetail = indexOfLastDetail - 5;
  const currentDetails = filteredDetails.slice(indexOfFirstDetail, indexOfLastDetail);

  const renderDetails = currentDetails.map(({ id, name, assemblyImg, disassemblyImg, description }) => (
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
          <a className="detail-action__info" href="#">Подробнее</a>
          <a className="detail-action__edit" href="#">Изменить</a>
          <a href="#" className="detail-action__delete" onClick={() => handleConfirmDelete(id, name, description)}>Удалить</a>
        </div>
      </div>
    </div>
  ));

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredDetails.length / 5); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <Header />
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
          <ul className="pagination">
            {pageNumbers.map(number => (
              <li key={number} className="page-item">
                <a onClick={() => handlePageChange(number)} href="!#" className="page-link">
                  {number}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {deleteDetailId !== null && (
        <div className="popup">
          <div className="popup-inner">
            <p>Вы действительно хотите удалить данную деталь?</p>
            <hr />
            <p>Наиманование: <span className='popup-inner__detail'>{detailForDel.name}</span></p>
            <p>Описание: <span className='popup-inner__detail'>{detailForDel.description}</span></p>
            <button className='popup-inner__btn delete' onClick={() => handleDeleteDetail(deleteDetailId)}>Удалить</button>
            <button className='popup-inner__btn' onClick={() => setDeleteDetailId(null)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
