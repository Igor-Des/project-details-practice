import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:3001/api/login', { username, password });
        console.log('Login successful');
        console.log('User role:', response.data.role);
      } catch (error) {
        console.error('Error logging in:', error);
      }
    };
  
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  };

export default LoginForm;
