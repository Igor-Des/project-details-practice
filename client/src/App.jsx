import Home from './pages/Home';
import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import DetailPage from './pages/DetailPage';


function App() {
  
  return (
    <>
    <Header/>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/details/:id' element={<DetailPage />} />
    </Routes>
    </>
  );
}

export default App;
