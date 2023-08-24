import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InicioScorm from './components/scormCurso/InicioScorm'

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/inicioScorm" element={<InicioScorm />} /> */}
        <Route path="/" element={<InicioScorm />} />
      </Routes>
    </Router>
  );
}

export default App;
