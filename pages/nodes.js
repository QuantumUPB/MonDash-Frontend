import NodeList from '../components/NodeList';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Nodes() {
  return (
    <ProtectedRoute>
      <NodeList />
    </ProtectedRoute>
  );
}
