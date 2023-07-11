import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import View from './View'
import { Header } from './components/Header'
import ScrollToTop from './components/ScrollToTop'

export function App() {
  return (
    <>
      <ToastContainer />
      <ScrollToTop />
      <Header />
      <Routes>
        <Route
          path="/"
          element={<View />}
        />
        <Route
          path="/:shortName"
          element={<View />}
        />
      </Routes>
    </>
  )
}
