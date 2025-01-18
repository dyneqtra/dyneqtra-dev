import React from 'react'
import { DocumentCollectionWizard } from '@/components/rag/DocumentCollectionWizard'
import Header from '@/components/Header'

export default function NewDocumentCollectionPage() {
    return (
        <div className="App relative">
            <Header activePage="rag" />

            <DocumentCollectionWizard />
        </div>
    )
}
