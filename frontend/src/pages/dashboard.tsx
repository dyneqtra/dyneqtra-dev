import React from 'react'
import Header from '../components/Header'
import Dashboard from '../components/Dashboard'

const DashboardPage: React.FC = () => {
    return (
        <div className="App relative">
            <Header activePage="dashboard" />
            <Dashboard />
        </div>
    )
}

export default DashboardPage
