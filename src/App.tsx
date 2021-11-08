import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import tw from 'tailwind-styled-components'

// import NavBar from './components/NavBar'
import Home from './components/Home'

import './App.css'

const Outer = tw.div`
  flex
`

function App() {
  return (
    <Router>
      <Outer>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Outer>
    </Router>
  )
}

export default App
