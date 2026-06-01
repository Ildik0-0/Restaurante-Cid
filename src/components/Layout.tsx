import { Outlet } from 'react-router-dom'
import Navbar from './Navar/navbar'
import Footer from './Footer/footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
