import { useState } from 'react'
import { Routes, Route } from "react-router-dom"
import './App.css'
import Razorpay from './Pages/Razorpay'

function App() {


  return (
    <div className="App">
    <Routes>
      <Route path="/" element={ <Razorpay/> } />
    </Routes>
  </div>
  )
}

export default App
