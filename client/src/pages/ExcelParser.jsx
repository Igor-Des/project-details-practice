import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

import './../css/ExcelParser.css';

const ExcelParser = () => {
    const [arrayDetail, setArrayDetail] = useState([]);
    const [assemblyImgFile, setAssemblyImgFile] = useState(null);
    const [disassemblyImgFile, setDisassemblyImgFile] = useState(null);
    const [newDetail, setNewDetail] = useState({ name: '', description: '', components: [], assemblyImg: "not-found.jpg", disassemblyImg: "not-found.jpg" });

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

    const handleDel = async (index) => {
        setArrayDetail(prevArray => prevArray.filter((_, idx) => idx !== index));
        alert('Деталь убрана из списка!');

    }  

    const handleSave = async (index, name, description, components) => {
        try {
          let assemblyImgFileName = assemblyImgFile;
          let disassemblyImgFileName = disassemblyImgFile;
    
          if (assemblyImgFile !== null) {
            assemblyImgFileName = await uploadImage(assemblyImgFile);
          }
          else {
            assemblyImgFileName = "not-found.jpg";
          }
          if (disassemblyImgFile !== null) {
            disassemblyImgFileName = await uploadImage(disassemblyImgFile);
          }
          else {            
            disassemblyImgFileName = "not-found.jpg";
          }
    
          const token = localStorage.getItem('tokenAuthDetail');
          await axios.post(
            'http://localhost:3001/details',
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
              setArrayDetail(prevArray => prevArray.filter((_, idx) => idx !== index));

              alert('Деталь успешно создана!');
          });
        } catch (error) {
            console.error('Error creating detail:', error);
            alert('Произошла ошибка при создании детали.');
        }
      };
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const details = [];

            for (let i = 1; i < parsedData.length; i++) {
                const row = parsedData[i];
                if (row[0] === "name") {
                    details.push({ name: row[1], description: "", components: [] });
                } else if (row[0] === "desc") {
                    details[details.length - 1].description = row[1];
                } else if (row[0] === "comp") {
                    details[details.length - 1].components.push([row[1], row[2]]);
                }
            }

            setArrayDetail(details);
        };

        reader.readAsArrayBuffer(file);
    };
    const handleAssemblyImgChange = (event) => {
        setAssemblyImgFile(event.target.files[0]);
      };
      const handleDisassemblyImgChange = (event) => {
        setDisassemblyImgFile(event.target.files[0]);
      };
    return (
        <div className='parse-container'>
            <input className='input-for-excel-file' type="file" onChange={handleFileUpload} />
            {arrayDetail.map((detail, index) => (
                <div className='detail-parse-card' id={`detail-parse__${index}`} key={index}>
                    <div className='parse-name'>
                        <p><span className='parse-title__name'>Название: </span> {detail.name} </p>
                    </div>

                    <div className='parse-desc'>
                        <p><span className='parse-title__description'>Описание: </span> {detail.description}</p>
                    </div>
                    <div className='parse-title__comp'>Компоненты:</div>
                    <ul className='ul-comp'>
                        {detail.components.map((component, componentIndex) => (
                            <li className='li-comp' key={componentIndex}>
                                {component[0]} - {component[1]}
                            </li>
                        ))}
                    </ul>
                    <div className='parse-images'>
                        <p>Изображение в сборе:
                            <input type="file" onChange={handleAssemblyImgChange} /></p>
                        <p>Изображение в разборе: 
                            <input type="file" onChange={handleDisassemblyImgChange} /></p>
                    </div>
                        <button className='btn-for-save-detail-parse' id={`btn-save-${index}`} onClick={() => handleSave(index, detail.name, detail.description, detail.components)}>Сохранить изменения</button>
                        <button className='btn-for-del-detail-parse' id={`btn-del-${index}`} onClick={() => handleDel(index)}>Убрать деталь из списка</button>
                </div>
            ))}
        </div>
    );
};

export default ExcelParser;
