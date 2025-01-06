import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import Footer
import Home from './pages/Home';
import Events from './pages/Events';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/tickets" element={<Events />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer /> {/* Add Footer */}
      </div>
    </Router>
  );
}

export default App;