import { createRoot } from 'react-dom/client'
import App from './App'

// Entry point: khởi tạo React app
const root = createRoot(document.getElementById('app')!)
root.render(<App />)
