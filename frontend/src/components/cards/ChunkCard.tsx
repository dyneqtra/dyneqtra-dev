import React from 'react'
import { Card, CardBody, CardFooter, Button } from '@nextui-org/react'

interface ChunkCardProps {
    text: string
    className?: string
    onViewFull?: () => void
}

const MAX_PREVIEW_LENGTH = 200

export const ChunkCard: React.FC<ChunkCardProps> = ({ text, className, onViewFull }) => {
    const isTextTrimmed = text.length > MAX_PREVIEW_LENGTH
    const previewText = isTextTrimmed ? `${text.slice(0, MAX_PREVIEW_LENGTH)}...` : text

    return (
        <Card className={`bg-default-50 ${className}`}>
            <CardBody className="pb-2">
                <p className="whitespace-pre-wrap text-small">{previewText}</p>
            </CardBody>
            {isTextTrimmed && (
                <CardFooter className="justify-end pt-0">
                    <Button size="sm" variant="light" onPress={onViewFull}>
                        View Full
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

export default ChunkCard
