import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/register', data); // Backend registration endpoint
      alert('Registration successful!');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed!');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('username')} placeholder="Username" required />
        <input {...register('email')} type="email" placeholder="Email" required />
        <input {...register('password')} type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
