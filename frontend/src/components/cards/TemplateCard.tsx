import React from 'react'
import { Card, CardBody, CardFooter, Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'

interface TemplateCardProps {
    title: string
    description: string
    features?: string[]
    onUse: () => void
}

export default function TemplateCard({ title, description, features, onUse }: TemplateCardProps) {
    return (
        <Card className="relative w-full">
            <CardBody className="relative min-h-[180px] bg-gradient-to-br from-content1 to-default-100/50 p-6">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className="text-default-500 text-sm mb-3">{description}</p>
                {features && features.length > 0 && (
                    <ul className="list-disc pl-5 mb-2">
                        {features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center text-sm">
                                <Icon icon="solar:check-circle-linear" className="text-green-500 mr-2" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
            </CardBody>
            <CardFooter className="border-t-1 border-default-100 justify-end py-2 px-4">
                <Button
                    color="primary"
                    variant="flat"
                    onPress={onUse}
                    startContent={<Icon icon="lucide:copy" width={16} />}
                >
                    Use Template
                </Button>
            </CardFooter>
        </Card>
    )
}
