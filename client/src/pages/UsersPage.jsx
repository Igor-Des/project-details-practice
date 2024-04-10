import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './../css/UserPage.css';

function UserDetailsModal({ user, onUpdateRole, onClose }) {
  const [role, setRole] = useState(user.role);

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleUpdateRole = () => {
    onUpdateRole(user.id, role);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>×</span>
        <h2>Подробнее</h2>
        <hr />
        <p>ID: {user.id}</p>
        <p>Логин: {user.username}</p>
        <label htmlFor="role">Роль:</label>
        <select id="role" value={role} onChange={handleRoleChange}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button onClick={handleUpdateRole}>Обновить данные </button>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);  
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [userForDel, setUserForDel] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState({
    username: null,
    role: null
  });

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem("tokenAuthDetail");
        console.log(token);
        if (token) {
          const response = await axios.get('http://localhost:3001/api/user-role', {
            headers: { Authorization: token }
          });
          setUser({
            username: response.data.username,
            role: response.data.role
          });
          setToken(token);
          console.log("token verify")
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    checkToken();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users', {
        headers: { Authorization: token },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const handleDeleteUser = async (id) => {
    await axios.delete(`http://localhost:3001/api/users/${id}`, {
      headers: { Authorization: token },
    })
      .then(response => {
        console.log(response);
        setUsers(users.filter(user => user.id !== id));
        setDeleteUserId(null);
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  const handleUpdateRole = (userId, newRole) => {
    axios.put(`http://localhost:3001/api/users/${userId}`,
      {
        role: newRole
      },
      {
        headers: { Authorization: token },
      })
      .then(response => {
        console.log(response);
        const updatedUsers = users.map(user => {
          if (user.id === userId) {
            return { ...user, role: newRole };
          }
          return user;
        });
        setUsers(updatedUsers);
        setSelectedUser(null);
      })
      .catch(error => {
        console.error('Error updating user role:', error);
      });
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchUsername.toLowerCase())
  );

  const handleConfirmDelete = (id, username, role) => {
    setDeleteUserId(id);
    setUserForDel({ id, username, role });
  };

  return (
    <div className="container">
      {user.role === "admin" ? (
        <><h1>Все пользователи</h1><div className="input-container">
          <input
            className='input-search__user'
            type="text"
            placeholder="Поиск по логину"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)} />
        </div>
          <ul className='user-content'>
            <li>
              <p>Логин</p>
              <p>Права</p>
              <p></p>
              <p></p>
            </li>
            {filteredUsers.map(user => (
              <li key={user.id}>
                <p>{user.username}</p>
                <p>{user.role}</p>
                <button onClick={() => setSelectedUser(user)}>Подробнее</button>
                <button onClick={() => handleConfirmDelete(user.id, user.username, user.role)}>Удалить</button>
              </li>
            ))}
          </ul>
          {selectedUser && (
            <UserDetailsModal user={selectedUser} onUpdateRole={handleUpdateRole} onClose={() => setSelectedUser(null)} />
          )}

          {deleteUserId !== null && (
            <div className="popup">
              <div className="popup-inner">
                <p>Вы действительно хотите удалить данного пользователя?</p>
                <hr />
                <p>Логин: <span className='popup-inner__detail'>{userForDel.username}</span></p>
                <p>Роль: <span className='popup-inner__detail'>{userForDel.role}</span></p>
                <button className='popup-inner__btn delete' onClick={() => handleDeleteUser(userForDel.id)}>Удалить</button>
                <button className='popup-inner__btn' onClick={() => setDeleteUserId(null)}>Отмена</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Доступно только для пользователей с ролью администратора</p>
      )
      }
    </div>
  );
}

export default UsersPage;
