import React from 'react'
import { Card, CardBody, Chip } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import type { VectorIndexResponse } from '@/utils/api'

interface VectorIndexCardProps {
    index: VectorIndexResponse
    onClick: (id: string) => void
}

export default function VectorIndexCard({ index, onClick }: VectorIndexCardProps) {
    return (
        <Card isPressable onPress={() => onClick(index.id)} className="relative w-full">
            <CardBody className="relative min-h-[180px] bg-gradient-to-br from-content1 to-default-100/50 p-6">
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">{index.name}</h2>
                </div>
                {index.description && <p className="text-default-500 text-sm mb-3">{index.description}</p>}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Icon icon="solar:document-linear" className="text-default-400" width={16} />
                        <p className="text-default-500">{index.document_count} Documents</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Icon icon="solar:layers-minimalistic-linear" className="text-default-400" width={16} />
                        <p className="text-default-500">{index.chunk_count} Chunks</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Chip
                            size="sm"
                            variant="flat"
                            color={
                                index.status === 'ready' ? 'success' : index.status === 'failed' ? 'danger' : 'warning'
                            }
                            startContent={
                                <Icon
                                    icon={
                                        index.status === 'ready'
                                            ? 'solar:check-circle-linear'
                                            : index.status === 'failed'
                                              ? 'solar:danger-circle-linear'
                                              : 'solar:clock-circle-linear'
                                    }
                                    width={14}
                                />
                            }
                        >
                            <span className="capitalize">{index.status}</span>
                        </Chip>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
