import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './../css/EditDetailPage.css';

function EditDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState([]);
  const [assemblyImgFile, setAssemblyImgFile] = useState(null);
  const [disassemblyImgFile, setDisassemblyImgFile] = useState(null);
  const [assemblyImg, setAssemblyImg] = useState('');
  const [disassemblyImg, setDisassemblyImg] = useState('');
  const [isImageChanged, setIsImageChanged] = useState(true);

  let navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/details/${id}`);
      setDetail(response.data);
      setName(response.data.name);
      setDescription(response.data.description);
      setComponents(response.data.components);
      setAssemblyImg(response.data.assemblyImg);
      setDisassemblyImg(response.data.disassemblyImg);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    try {
      let assemblyImgFileName = assemblyImg;
      let disassemblyImgFileName = disassemblyImg;

      if (assemblyImgFile) {
        assemblyImgFileName = await uploadImage(assemblyImgFile);
      }
      if (disassemblyImgFile) {
        disassemblyImgFileName = await uploadImage(disassemblyImgFile);
      }

      const token = localStorage.getItem('tokenAuthDetail');
      await axios.put(
        `http://localhost:3001/details/${id}`,
        {
          id,
          name,
          description,
          components,
          assemblyImg: assemblyImgFileName,
          disassemblyImg: disassemblyImgFileName,
        },
        {
          headers: { Authorization: token },
        }
      );
      navigate(`/details/${id}`);
      alert('Данные успешно сохранены!');
    } catch (error) {
      console.error('Error saving detail:', error);
      alert('Произошла ошибка при сохранении данных.');
    }
  };

  const handleAssemblyImgChange = (event) => {
    setAssemblyImgFile(event.target.files[0]);
  };

  const handleDisassemblyImgChange = (event) => {
    setDisassemblyImgFile(event.target.files[0]);
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('http://localhost:3001/upload', formData);
      return response.data.fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleDeleteComponent = (index) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
  };

  const handleAddComponent = () => {
    setComponents([...components, ['', '']]);
  };

  if (loading) {
    return <div className='detail-page__content'>Loading...</div>;
  }

  if (error) {
    return (
      <div className='detail-page__content'>
        <p className='detail-page__error-p'>Упс, что-то пошло не так.</p>
        <img className='detail-page__error-img' src="http://localhost:3001/images/sad-smile.png" alt="sad smile" />
        <Link to={`/`} className="btn-home">Вернуться в каталог товаров</Link>
        <div className='detail-page__error-view'>text for developer: {error}</div>
      </div>
    );
  }

  return (
    <div className='detail-page__content'>
      <h2>Редактирование детали «{name}»</h2>
      <div className='detail-page'>
        <img
          className="detail-page__image"
          src={isImageChanged ? `http://localhost:3001/images/${assemblyImg}` : `http://localhost:3001/images/${disassemblyImg}`}
          alt="loading image"
        />
        <div>
          <label className='edit-title__name'>Название:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className='edit-title__name'>Описание:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        
        <div>
          <p>Изображение в сборе:
          <input type="file" onChange={handleAssemblyImgChange} /></p>
          <p>Изображение в разборе: <input type="file" onChange={handleDisassemblyImgChange} /></p>
        </div>

        <div>
          <label className='edit-title__name'>Компоненты:</label>
          <ul>
            {components.map((component, index) => (
              <li key={index}>
                <input type="text" value={component[0]} onChange={(e) => {
                  const newComponents = [...components];
                  newComponents[index][0] = e.target.value;
                  setComponents(newComponents);
                }} />
                <input type="text" value={component[1]} onChange={(e) => {
                  const newComponents = [...components];
                  newComponents[index][1] = e.target.value;
                  setComponents(newComponents);
                }} />
                <button onClick={() => handleDeleteComponent(index)}>Удалить</button>
              </li>
            ))}
          </ul>
          <button className='edit-page__btn add' onClick={handleAddComponent}>Добавить компонент</button>
        </div>
        <div>
          <button className='edit-page__btn save' onClick={handleSave}>Сохранить изменения</button>
        </div>
        <hr />
        <div>
          <button className='detail-page__btn' onClick={() => setIsImageChanged(!isImageChanged)}>
            {isImageChanged ? "Разобрать деталь" : "Собрать деталь"}
          </button>
        </div>
      </div>
      <div className='btn-home-container'>
        <Link to={`/`} className="btn-home">Вернуться в каталог товаров</Link>
      </div>
    </div>
  );
}

export default EditDetailPage;
