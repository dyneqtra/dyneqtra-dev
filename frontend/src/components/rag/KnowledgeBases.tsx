import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, CardBody, Spinner } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { listDocumentCollections, listVectorIndices } from '@/utils/api'
import type { DocumentCollectionResponse, VectorIndexResponse } from '@/utils/api'
import DocumentCollectionCard from '../cards/DocumentCollectionCard'
import VectorIndexCard from '../cards/VectorIndexCard'

export const KnowledgeBases: React.FC = () => {
    const router = useRouter()
    const [collections, setCollections] = useState<DocumentCollectionResponse[]>([])
    const [indices, setIndices] = useState<VectorIndexResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collectionsData, indicesData] = await Promise.all([
                    listDocumentCollections(),
                    listVectorIndices(),
                ])
                // Sort collections by created_at in descending order
                const sortedCollections = [...collectionsData].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                // Sort indices by created_at in descending order
                const sortedIndices = [...indicesData].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                setCollections(sortedCollections)
                setIndices(sortedIndices)
                setError(null)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load data. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <Card className="bg-danger-50">
                    <CardBody>
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:danger-circle-bold" className="text-danger" width={20} />
                            <p className="text-danger">{error}</p>
                        </div>
                    </CardBody>
                </Card>
            )}

            <Card className="shadow-small">
                <CardBody>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-xl font-bold text-default-900">Knowledge Bases</h1>
                                <p className="text-small text-default-500">
                                    Manage your document collections and vector indices
                                </p>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Document Collections Section */}
            <Card className="shadow-small">
                <CardBody>
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Document Collections</h2>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="solar:add-circle-linear" width={20} />}
                                onPress={() => router.push('/rag/collections/new')}
                            >
                                Create Collection
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {collections.length > 0 ? (
                                collections.map((collection) => (
                                    <DocumentCollectionCard
                                        key={collection.id}
                                        collection={collection}
                                        onClick={(id) => router.push(`/rag/collections/${id}`)}
                                    />
                                ))
                            ) : (
                                <Card className="bg-default-50 col-span-full">
                                    <CardBody className="py-8">
                                        <div className="flex flex-col items-center gap-4">
                                            <Icon
                                                icon="solar:documents-minimalistic-linear"
                                                width={48}
                                                className="text-default-400"
                                            />
                                            <p className="text-default-500">No document collections found</p>
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                startContent={<Icon icon="solar:add-circle-linear" width={20} />}
                                                onPress={() => router.push('/rag/collections/new')}
                                            >
                                                Create Your First Collection
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Vector Indices Section */}
            <Card className="shadow-small">
                <CardBody>
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Vector Indices</h2>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="solar:add-circle-linear" width={20} />}
                                onPress={() => router.push('/rag/indices/new')}
                            >
                                Create Index
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {indices.length > 0 ? (
                                indices.map((index) => (
                                    <VectorIndexCard
                                        key={index.id}
                                        index={index}
                                        onClick={(id) => router.push(`/rag/indices/${id}`)}
                                    />
                                ))
                            ) : (
                                <Card className="bg-default-50 col-span-full">
                                    <CardBody className="py-8">
                                        <div className="flex flex-col items-center gap-4">
                                            <Icon icon="solar:chart-2-linear" width={48} className="text-default-400" />
                                            <p className="text-default-500">No vector indices found</p>
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                startContent={<Icon icon="solar:add-circle-linear" width={20} />}
                                                onPress={() => router.push('/rag/indices/new')}
                                            >
                                                Create Your First Index
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
