import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/login', data); // Backend login endpoint
      localStorage.setItem('token', response.data.token); // Save JWT token
      alert('Login successful!');
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed!');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('username')} placeholder="Username" required />
        <input {...register('password')} type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
