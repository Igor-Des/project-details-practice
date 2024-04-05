import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import EditDetailPage from './pages/EditDetailPage';
import NotFound from './pages/NotFound';



function App() {
  
  return (
    <>
    <Header/>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/details/:id' element={<DetailPage />} />
      <Route path='/details/edit/:id' element={<EditDetailPage />} />
      <Route path='*' element={<NotFound />} />  
    </Routes>
    </>
  );
}

export default App;
