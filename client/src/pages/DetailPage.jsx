import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import axios from 'axios';
import './../css/DetailPage.css';
import './../css/DetailTable.css';

function DetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    username: null,
    role: null
  });

  const [isImageChanged, setIsImageChanged] = useState(true);

  const handleClick = () => {
    setIsImageChanged(!isImageChanged);
  };

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

    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/details/${id}`);
        setDetail(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };


    const fetchData = async () => {
      await checkToken();
      await fetchDetail();
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className='detail-page__content'>Loading...</div>
    );
  }

  if (error) {
    return (
      <div className='detail-page__content'>
        <p className='detail-page__error-p'>Упс, что-то пошло не так.</p>
        <img className='detail-page__error-img' src="./../images/sad-smile-png.png" alt="sad smile" />
        <Link to={`/`} className="btn-home">Вернуться в каталог товаров</Link>
        <div className='detail-page__error-view'>text for developer: {error}</div>
      </div>);
  }

  return (
    <div className='detail-page__content'>
      <h2>Деталь(№{id}) в {isImageChanged ? "сборе" : "разборе"}</h2>
      {detail && (
        <div className='detail-page'>
          <button className='detail-page__btn' onClick={handleClick}>{isImageChanged ? "Разобрать деталь" : "Собрать деталь"}</button>
          <div className='detail-page__image-click' onClick={handleClick}>
            <img
              className="detail-page__image"
              src={isImageChanged ? './../images/' + detail.assemblyImg : './../images/' + detail.disassemblyImg}
              alt="loading image"
            />
          </div>
          <p>Название: <span className="detail-page__bold">{detail.name}</span></p>
          <p>Описание: <span className="detail-page__bold">{detail.description}</span></p>
          {user.role === 'admin' && (
            <>
          <p><Link to={`/details/edit/${id}`} className="detail-page__edit">Изменить</Link></p>
            </>
          )
          }
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Позиция</th>
                  <th>Наименование</th>
                  <th>Обозначение</th>
                </tr>
              </thead>
              <tbody>
                {detail.components.map((component, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{component[0]}</td>
                    <td>{component[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="btn-home-container">
        <Link to={`/`} className="btn-home">Вернуться в каталог товаров</Link>
      </div>
    </div>
  );
}

export default DetailPage;
