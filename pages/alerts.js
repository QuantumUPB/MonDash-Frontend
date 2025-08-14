import Alerts from '../components/Alerts';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <Alerts />
    </ProtectedRoute>
  );
}
