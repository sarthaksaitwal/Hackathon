import { createRoot } from 'react-dom/client'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import App from './App.jsx'
import './index.css'

// Fix Leaflet's default icon paths for deployment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

createRoot(document.getElementById("root")).render(<App />);
