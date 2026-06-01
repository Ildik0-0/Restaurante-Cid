import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './sections/Homepage/homepage'
import Layout from './components/Layout'
import Events from './sections/Events/event.tsx'
import AdminLog from "./sections/AdminLog/adminlog.tsx";
import RequireAdmin from "./components/Admin/requireAdmin";
import AdminLayout from "./components/Admin/adminLayout";
import AdminDashboard from "./components/Admin/dashboard";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/event" element={<Events />} />
          <Route path="/homepage" element={<Homepage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLog />} />
        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
