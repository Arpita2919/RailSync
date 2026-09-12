import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OverviewDashboard from './pages/OverviewDashboard.jsx';
import DigitalTwin from './pages/DigitalTwin.jsx';
import BlockPlanner from './pages/BlockPlanner.jsx';
import SegmentWhy from './pages/SegmentWhy.jsx';
import WhatIfSandbox from './pages/WhatIfSandbox.jsx';
import TaskPool from './pages/TaskPool.jsx';
import Optimization from './pages/Optimization.jsx';
import Feedback from './pages/Feedback.jsx';

/**
 * AuthGuard — layout route that checks auth then renders <Outlet />.
 * Keeps the Route tree structure compatible with React Router v6 nested routes.
 */
function AuthGuard() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ── Protected dashboard routes ── */}
      <Route element={<AuthGuard />}>
        {/* Overview */}
        <Route path="overview" element={<OverviewDashboard />} />

        {/* Digital Twin */}
        <Route path="corridor-digital-twin" element={<DigitalTwin />} />
        <Route path="digital-twin" element={<DigitalTwin />} />

        {/* Schedule & Block Planner */}
        <Route path="block-planner" element={<BlockPlanner />} />
        <Route path="schedule" element={<BlockPlanner />} />
        <Route path="planner" element={<BlockPlanner />} />

        <Route path="timetable" element={<BlockPlanner />} />


        {/* Segment Why Risk */}
        <Route path="risk" element={<SegmentWhy />} />
        <Route path="segment-why" element={<SegmentWhy />} />

        {/* What-If Sandbox */}
        <Route path="what-if" element={<WhatIfSandbox />} />
        <Route path="disruption" element={<WhatIfSandbox />} />

        {/* Department Task Pool */}
        <Route path="tasks" element={<TaskPool />} />
        <Route path="task-pool" element={<TaskPool />} />

        {/* Pareto Optimization */}
        <Route path="pareto" element={<Optimization />} />
        <Route path="optimization" element={<Optimization />} />

        {/* Feedback & Audit */}
        <Route path="feedback" element={<Feedback />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  );
}
