import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import CatchAllRoute from "./components/CatchAllRoute";
import GuestOnlyRoute from "./components/GuestOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";

import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Me from "./pages/Me";
import SignUp from "./pages/SignUp";
import Transactions from "./pages/Transactions";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />}>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="me" element={<Me />} />
            </Route>
          </Route>

          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          <Route path="*" element={<CatchAllRoute />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
