import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import View from './View'
import ScrollToTop from './components/ScrollToTop'

export function App() {
  return (
    <>
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        <Route
          path="/:shortName?"
          element={<View />}
        />
      </Routes>
    </>
  )
}
