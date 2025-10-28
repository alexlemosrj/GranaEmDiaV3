import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Root should take users to the login page. Protected routes live under "/".
  return <Navigate to="/login" replace />;
};

export default Index;