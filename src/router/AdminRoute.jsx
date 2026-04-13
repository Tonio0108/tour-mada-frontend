import PrivateRoute from './PrivateRoute';

const AdminRoute = ({ children }) => {
  return (
    <PrivateRoute requireAdmin={true}>
      {children}
    </PrivateRoute>
  );
};

export default AdminRoute;

