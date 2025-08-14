import DeviceList from '../components/DeviceList';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Devices() {
  return (
    <ProtectedRoute>
      <DeviceList />
    </ProtectedRoute>
  );
}
