import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import View from './View'

export function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route
          path="/:shortName?"
          element={<View />}
        />
        <Route
          path="/:shortName/play"
          element={<View play />}
        />
      </Routes>
      <Footer />
    </>
  )
}
