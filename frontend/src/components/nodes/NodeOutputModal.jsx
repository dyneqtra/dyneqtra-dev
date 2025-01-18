import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react'
import NodeOutputDisplay from './NodeOutputDisplay' // Import NodeOutputDisplay

const NodeOutputModal = ({ isOpen, onOpenChange, title, data }) => {
    const handleOpenChange = () => {
        onOpenChange(false)
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
            <ModalContent>
                <ModalHeader>
                    <h3>{title}</h3>
                </ModalHeader>
                <ModalBody className="max-h-[70vh] overflow-y-auto">
                    <div>{data ? <NodeOutputDisplay output={data.run} /> : <div>No output available</div>}</div>
                </ModalBody>
                <ModalFooter>
                    <Button onPress={handleOpenChange}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default NodeOutputModal
