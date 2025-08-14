import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/login', data, { withCredentials: true });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', data.username);
      if (response.data.role) {
        localStorage.setItem('role', response.data.role);
      } else {
        localStorage.removeItem('role');
      }
      alert('Login successful!');
      router.push('/');
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
