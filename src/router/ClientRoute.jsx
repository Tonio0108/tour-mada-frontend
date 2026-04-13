import PrivateRoute from './PrivateRoute';

const ClientRoute = ({ children }) => {
  return (
    <PrivateRoute requireClient={true}>
      {children}
    </PrivateRoute>
  );
};

export default ClientRoute;

