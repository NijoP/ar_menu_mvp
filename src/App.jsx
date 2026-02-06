import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import ARViewPage from './pages/ARViewPage';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/ar/:id" element={<ARViewPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
