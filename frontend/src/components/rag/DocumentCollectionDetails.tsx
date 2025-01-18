import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Accordion,
    AccordionItem,
    Chip,
    Divider,
} from '@nextui-org/react'
import { Icon } from '@iconify/react'
import {
    getDocumentCollection,
    addDocumentsToCollection,
    deleteDocumentCollection,
    getCollectionDocuments,
} from '@/utils/api'
import type { DocumentCollectionResponse, DocumentWithChunks } from '@/utils/api'
import FileUploadBox from './FileUploadBox'
import ChunkCard from '../cards/ChunkCard'

export const DocumentCollectionDetails: React.FC = () => {
    const router = useRouter()
    const { id } = router.query
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAddDocumentsOpen, onOpen: onAddDocumentsOpen, onClose: onAddDocumentsClose } = useDisclosure()
    const { isOpen: isDocumentTextOpen, onOpen: onDocumentTextOpen, onClose: onDocumentTextClose } = useDisclosure()
    const { isOpen: isChunkTextOpen, onOpen: onChunkTextOpen, onClose: onChunkTextClose } = useDisclosure()
    const [collection, setCollection] = useState<DocumentCollectionResponse | null>(null)
    const [documents, setDocuments] = useState<DocumentWithChunks[]>([])
    const [selectedDocument, setSelectedDocument] = useState<DocumentWithChunks | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isAddingDocuments, setIsAddingDocuments] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [selectedChunk, setSelectedChunk] = useState<{ text: string } | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id || typeof id !== 'string') return
                const [collectionData, documentsData] = await Promise.all([
                    getDocumentCollection(id),
                    getCollectionDocuments(id),
                ])
                setCollection(collectionData)
                setDocuments(documentsData)
                setError(null)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Error loading collection data')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleDelete = async () => {
        try {
            if (!id || typeof id !== 'string') return
            setIsDeleting(true)
            await deleteDocumentCollection(id)
            router.push('/rag')
        } catch (error) {
            console.error('Error deleting collection:', error)
            setError('Error deleting collection')
            onClose()
        } finally {
            setIsDeleting(false)
        }
    }

    const handleAddDocuments = async (files: FileList | File[]) => {
        try {
            if (!id || typeof id !== 'string') return
            setIsAddingDocuments(true)
            setError(null)
            await addDocumentsToCollection(id, Array.from(files))
            setSuccess('Documents added successfully')
            // Refresh data
            const [collectionData, documentsData] = await Promise.all([
                getDocumentCollection(id),
                getCollectionDocuments(id),
            ])
            setCollection(collectionData)
            setDocuments(documentsData)
            setError(null)
            // Close modal and reset state
            onAddDocumentsClose()
            setSelectedFiles([])
        } catch (error) {
            console.error('Error adding documents:', error)
            setError('Error adding documents')
            setSuccess(null)
        } finally {
            setIsAddingDocuments(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Spinner />
            </div>
        )
    }

    if (!collection) {
        return (
            <Card className="bg-danger-50">
                <CardBody>
                    <p className="text-danger">Collection not found</p>
                </CardBody>
            </Card>
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

            {success && (
                <Card className="bg-success-50">
                    <CardBody>
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:check-circle-bold" className="text-success" width={20} />
                            <p className="text-success">{success}</p>
                        </div>
                    </CardBody>
                </Card>
            )}

            <Card className="shadow-small">
                <CardBody>
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-2">
                                <h4 className="text-xl font-bold">{collection.name}</h4>
                                {collection.description && <p className="text-default-500">{collection.description}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    color="primary"
                                    variant="flat"
                                    startContent={<Icon icon="solar:upload-linear" width={20} />}
                                    isLoading={isAddingDocuments}
                                    onPress={onAddDocumentsOpen}
                                >
                                    Add Documents
                                </Button>
                                <Button
                                    color="primary"
                                    startContent={<Icon icon="solar:chart-2-linear" width={20} />}
                                    onPress={() => router.push(`/rag/indices/new?collection=${id}`)}
                                >
                                    Create Vector Index
                                </Button>
                                <Button
                                    color="danger"
                                    variant="light"
                                    startContent={<Icon icon="solar:trash-bin-trash-linear" width={20} />}
                                    onPress={onOpen}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Chip variant="flat" size="sm">
                                <div className="flex items-center gap-1">
                                    <Icon icon="solar:documents-linear" width={16} />
                                    <span>{collection.document_count} Documents</span>
                                </div>
                            </Chip>
                            <Chip variant="flat" size="sm">
                                <div className="flex items-center gap-1">
                                    <Icon icon="solar:layers-linear" width={16} />
                                    <span>{collection.chunk_count} Chunks</span>
                                </div>
                            </Chip>
                            <Chip
                                color={
                                    collection.status === 'ready'
                                        ? 'success'
                                        : collection.status === 'failed'
                                          ? 'danger'
                                          : 'warning'
                                }
                                variant="flat"
                                size="sm"
                            >
                                <div className="flex items-center gap-1">
                                    <Icon
                                        icon={
                                            collection.status === 'ready'
                                                ? 'solar:check-circle-linear'
                                                : collection.status === 'failed'
                                                  ? 'solar:danger-circle-linear'
                                                  : 'solar:clock-circle-linear'
                                        }
                                        width={16}
                                    />
                                    <span className="capitalize">{collection.status}</span>
                                </div>
                            </Chip>
                        </div>

                        <Divider />

                        {documents.length === 0 ? (
                            <Card className="bg-default-50">
                                <CardBody className="py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <Icon
                                            icon="solar:documents-minimalistic-linear"
                                            width={48}
                                            className="text-default-400"
                                        />
                                        <p className="text-default-500">No documents in this collection yet</p>
                                        <Button
                                            color="primary"
                                            variant="flat"
                                            startContent={<Icon icon="solar:upload-linear" width={20} />}
                                            isLoading={isAddingDocuments}
                                            onPress={onAddDocumentsOpen}
                                        >
                                            Add Your First Document
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ) : (
                            <Accordion
                                className="p-0 gap-2 flex flex-col"
                                variant="shadow"
                                itemClasses={{
                                    base: 'bg-default-50 dark:bg-default-100',
                                    title: 'font-normal text-medium',
                                    trigger:
                                        'px-4 py-0 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center',
                                    indicator: 'text-medium',
                                    content: 'text-small px-2',
                                }}
                            >
                                {documents.map((doc) => (
                                    <AccordionItem
                                        key={doc.id}
                                        aria-label={`Document ${doc.metadata?.source_id || doc.id}`}
                                        title={
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center gap-3">
                                                    <Icon
                                                        icon="solar:document-linear"
                                                        width={20}
                                                        className="text-default-500"
                                                    />
                                                    <span className="font-medium">
                                                        {doc.metadata?.source_id || doc.id}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<Icon icon="solar:eye-linear" width={16} />}
                                                        onPress={() => {
                                                            setSelectedDocument(doc)
                                                            onDocumentTextOpen()
                                                        }}
                                                    >
                                                        View Document
                                                    </Button>
                                                    <Chip size="sm" variant="flat">
                                                        <div className="flex items-center gap-1">
                                                            <Icon icon="solar:layers-minimalistic-linear" width={14} />
                                                            <span>{doc.chunks.length} chunks</span>
                                                        </div>
                                                    </Chip>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div className="flex flex-col gap-4 p-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {doc.chunks.map((chunk) => (
                                                    <ChunkCard
                                                        key={chunk.id}
                                                        text={chunk.text}
                                                        onViewFull={() => {
                                                            setSelectedChunk(chunk)
                                                            onChunkTextOpen()
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}

                        {collection.error_message && (
                            <Card className="bg-danger-50">
                                <CardBody>
                                    <div className="flex items-center gap-2">
                                        <Icon icon="solar:danger-triangle-linear" className="text-danger" width={20} />
                                        <div className="flex flex-col gap-1">
                                            <h6 className="text-medium font-semibold text-danger">Error</h6>
                                            <p className="text-danger-600">{collection.error_message}</p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader className="flex gap-2 items-center">
                        <Icon icon="solar:danger-triangle-bold" className="text-danger" width={24} />
                        Delete Collection
                    </ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to delete this collection? This action cannot be undone.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            startContent={<Icon icon="solar:trash-bin-trash-bold" width={20} />}
                            isLoading={isDeleting}
                            onPress={handleDelete}
                        >
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddDocumentsOpen} onClose={onAddDocumentsClose} size="4xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="flex gap-2 items-center">
                        <Icon icon="solar:upload-linear" width={24} />
                        Add Documents
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-6">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <h6 className="text-medium font-semibold">Upload Documents</h6>
                                    <p className="text-small text-default-500">
                                        Select documents to add to your collection. The documents will be processed
                                        using the collection's existing configuration.
                                    </p>
                                </div>

                                <FileUploadBox onFilesChange={setSelectedFiles} />
                            </div>

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

                            {success && (
                                <Card className="bg-success-50">
                                    <CardBody>
                                        <div className="flex items-center gap-2">
                                            <Icon icon="solar:check-circle-bold" className="text-success" width={20} />
                                            <p className="text-success">{success}</p>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onAddDocumentsClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            startContent={<Icon icon="solar:upload-linear" width={20} />}
                            isLoading={isAddingDocuments}
                            isDisabled={selectedFiles.length === 0}
                            onPress={() => handleAddDocuments(selectedFiles)}
                        >
                            Add Documents
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isDocumentTextOpen} onClose={onDocumentTextClose} size="4xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="flex gap-2 items-center">
                        <Icon icon="solar:document-text-linear" width={24} />
                        Document Text
                    </ModalHeader>
                    <ModalBody>
                        <Card>
                            <CardBody>
                                <p className="whitespace-pre-wrap text-small">{selectedDocument?.text}</p>
                            </CardBody>
                        </Card>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onPress={onDocumentTextClose}
                            startContent={<Icon icon="solar:close-circle-linear" width={20} />}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isChunkTextOpen} onClose={onChunkTextClose} size="4xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="flex gap-2 items-center">
                        <Icon icon="solar:layers-minimalistic-linear" width={24} />
                        Chunk Text
                    </ModalHeader>
                    <ModalBody>
                        <Card>
                            <CardBody>
                                <p className="whitespace-pre-wrap text-small">{selectedChunk?.text}</p>
                            </CardBody>
                        </Card>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onPress={onChunkTextClose}
                            startContent={<Icon icon="solar:close-circle-linear" width={20} />}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
