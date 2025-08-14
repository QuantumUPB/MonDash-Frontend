import AppList from '../components/AppList';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Apps() {
  return (
    <ProtectedRoute>
      <AppList />
    </ProtectedRoute>
  );
}
