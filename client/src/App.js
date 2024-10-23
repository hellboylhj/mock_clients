import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ClientList from './components/ClientList';
import ClientsForm from './components/ClientsForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/form" element={<ClientsForm />} />
        </Routes>
      </Router>
  );
}

export default App;
