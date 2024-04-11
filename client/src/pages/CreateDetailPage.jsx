import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './../css/EditDetailPage.css';

function CreateDetailPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState([]);
  const [assemblyImgFile, setAssemblyImgFile] = useState(null);
  const [disassemblyImgFile, setDisassemblyImgFile] = useState(null);

  let navigate = useNavigate();

  const handleAssemblyImgChange = (event) => {
    setAssemblyImgFile(event.target.files[0]);
  };

  const handleDisassemblyImgChange = (event) => {
    setDisassemblyImgFile(event.target.files[0]);
  };

  const handleAddComponent = () => {
    setComponents([...components, ['', '']]);
  };

  const handleDeleteComponent = (index) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
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

  const handleSave = async () => {
    try {
      let assemblyImgFileName = assemblyImgFile;
      let disassemblyImgFileName = disassemblyImgFile;

      if (assemblyImgFile) {
        assemblyImgFileName = await uploadImage(assemblyImgFile);
      }
      if (disassemblyImgFile) {
        disassemblyImgFileName = await uploadImage(disassemblyImgFile);
      }

      const token = localStorage.getItem('tokenAuthDetail');
      await axios.post(
        'http://localhost:3001/details', // endpoint для создания детали
        {
            name,
            description,
            components,
            assemblyImg: assemblyImgFileName,
            disassemblyImg: disassemblyImgFileName,
        },
        {
          headers: { Authorization: token },
        }
      ).then(response => {
        let detailId = response.data.detail.id;
        alert('Деталь успешно создана!');
        navigate(`/details/${detailId}`);
      });
    } catch (error) {
      console.error('Error creating detail:', error);
      alert('Произошла ошибка при создании детали.');
    }
  };

  return (
    <div className='detail-page__content'>
      <h2>Создание новой детали</h2>
      <div className='detail-page'>
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
      </div>
      <div className='btn-home-container'>
        <Link to={`/`} className="btn-home">Вернуться в каталог товаров</Link>
      </div>
    </div>
  );
}

export default CreateDetailPage;
