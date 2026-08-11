import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Blog } from '@/pages/Blog'
import { BlogPost } from '@/pages/BlogPost'
import { Photography } from '@/pages/Photography'
import { PhotoAlbumPage } from '@/pages/PhotoAlbum'
import { Resume } from '@/pages/Resume'
import { Admin } from '@/pages/Admin'
import { ThisIsMyCar } from '@/pages/ThisIsMyCar'
import { CarPage } from '@/pages/CarPage'
import { MakeMyCar } from '@/pages/MakeMyCar'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/photography/:albumId" element={<PhotoAlbumPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/this-is-my-car" element={<ThisIsMyCar />} />
        <Route path="/make-my-car" element={<MakeMyCar />} />
        <Route path="/car/:slug" element={<CarPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
