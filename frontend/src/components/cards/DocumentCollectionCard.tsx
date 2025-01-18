import React from 'react'
import { Card, CardBody, Chip } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import type { DocumentCollectionResponse } from '@/utils/api'

interface DocumentCollectionCardProps {
    collection: DocumentCollectionResponse
    onClick: (id: string) => void
}

export default function DocumentCollectionCard({ collection, onClick }: DocumentCollectionCardProps) {
    return (
        <Card isPressable onPress={() => onClick(collection.id)} className="relative w-full">
            <CardBody className="relative min-h-[180px] bg-gradient-to-br from-content1 to-default-100/50 p-6">
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">{collection.name}</h2>
                </div>
                {collection.description && <p className="text-default-500 text-sm mb-3">{collection.description}</p>}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Icon icon="solar:document-linear" className="text-default-400" width={16} />
                        <p className="text-default-500">{collection.document_count} Documents</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Icon icon="solar:layers-minimalistic-linear" className="text-default-400" width={16} />
                        <p className="text-default-500">{collection.chunk_count} Chunks</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Chip
                            size="sm"
                            variant="flat"
                            color={
                                collection.status === 'ready'
                                    ? 'success'
                                    : collection.status === 'failed'
                                      ? 'danger'
                                      : 'warning'
                            }
                            startContent={
                                <Icon
                                    icon={
                                        collection.status === 'ready'
                                            ? 'solar:check-circle-linear'
                                            : collection.status === 'failed'
                                              ? 'solar:danger-circle-linear'
                                              : 'solar:clock-circle-linear'
                                    }
                                    width={14}
                                />
                            }
                        >
                            <span className="capitalize">{collection.status}</span>
                        </Chip>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
