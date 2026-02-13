import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { DocumentsPage } from './pages/DocumentsPage'
import { RAGPage } from './pages/RAGPage'
import { AgentsPage } from './pages/AgentsPage'
import { ModelsPage } from './pages/ModelsPage'
import { ChatPage } from './pages/ChatPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DocumentsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/rag" element={<RAGPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MainLayout>
  )
}

export default App

