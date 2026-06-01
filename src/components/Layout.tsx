import { Outlet } from 'react-router-dom'
import Navbar from './Navar/navbar'
import Footer from './Footer/footer'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
