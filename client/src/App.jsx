import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import EditDetailPage from './pages/EditDetailPage';
import NotFound from './pages/NotFound';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import Footer from './components/Footer';

import './css/App.css'

function App() {
  const appConts = "Hello from App.JSX"
  return (
    <div className="app-container">
      <Header />
      <Routes>
        <Route path='/register' element={<RegisterForm />} />
        <Route path='/login' element={<LoginForm />} />

        <Route path='/' element={<Home />} />
        <Route path='/details/:id' element={<DetailPage />} />
        <Route path='/details/edit/:id' element={<EditDetailPage />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
