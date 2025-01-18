import React from 'react'
import Header from '@/components/Header'
import { KnowledgeBases } from '@/components/rag/KnowledgeBases'

export default function RAGPage() {
    return (
        <div className="App relative">
            <Header activePage="rag" />
            <div className="p-6">
                <KnowledgeBases />
            </div>
        </div>
    )
}
