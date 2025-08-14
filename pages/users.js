import UserList from '../components/UserList';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Users() {
  return (
    <ProtectedRoute>
      <UserList />
    </ProtectedRoute>
  );
}
