import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';

const roles = [
  'admin',
  'technician',
  'partner head',
  'usecase head',
  'qkd user',
  'auditor',
];

export default function Register() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await axios.post('/api/register', data);
      alert('Registration successful!');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed!');
    }
  };

  return (
    <ProtectedRoute>
      <div className="auth-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('username')} placeholder="Username" required />
          <input {...register('email')} type="email" placeholder="Email" required />
          <input {...register('password')} type="password" placeholder="Password" required />
          <select {...register('role')}>
            {roles.map((r, idx) => (
              <option key={idx} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="submit">Register</button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
