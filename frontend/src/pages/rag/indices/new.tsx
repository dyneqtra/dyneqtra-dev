import React from 'react'
import { VectorIndexWizard } from '@/components/rag/VectorIndexWizard'
import Header from '@/components/Header'
export default function NewVectorIndexPage() {
    return (
        <div className="App relative">
            <Header activePage="rag" />
            <VectorIndexWizard />
        </div>
    )
}
