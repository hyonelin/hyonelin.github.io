import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/zh-CN" element={<Home />} />
        <Route path="/en-US" element={<Home />} />
        <Route path="*" element={<Navigate to="/zh-CN" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
