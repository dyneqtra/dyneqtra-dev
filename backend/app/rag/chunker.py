import uuid
from typing import Dict, List, Optional, Tuple, Union

import tiktoken
from .embedder import EmbeddingModels, get_multiple_text_embeddings
from .schemas.document_schemas import (
    Document,
    DocumentChunk,
    DocumentChunkMetadata,
)
from pydantic import BaseModel

# Global variables
tokenizer = tiktoken.get_encoding(
    "cl100k_base"
)  # The encoding scheme to use for tokenization


# Constants
class ChunkingConfig(BaseModel):
    chunk_token_size: int = 200
    min_chunk_size_chars: int = 350
    min_chunk_length_to_embed: int = 5
    embeddings_batch_size: int = 128
    max_num_chunks: int = 10000


def get_text_chunks(text: str, config: ChunkingConfig) -> List[str]:
    """
    Split a text into chunks based on the provided configuration.

    Args:
        text: The text to split into chunks.
        config: ChunkingConfig containing the chunking parameters.

    Returns:
        A list of text chunks.
    """
    if not text or text.isspace():
        return []

    tokens = tokenizer.encode(text, disallowed_special=())
    chunks = []
    num_chunks = 0

    while tokens and num_chunks < config.max_num_chunks:
        chunk = tokens[: config.chunk_token_size]
        chunk_text = tokenizer.decode(chunk)

        if not chunk_text or chunk_text.isspace():
            tokens = tokens[len(chunk) :]
            continue

        last_punctuation = max(
            chunk_text.rfind("."),
            chunk_text.rfind("?"),
            chunk_text.rfind("!"),
            chunk_text.rfind("\n"),
        )

        if last_punctuation != -1 and last_punctuation > config.min_chunk_size_chars:
            chunk_text = chunk_text[: last_punctuation + 1]

        chunk_text_to_append = chunk_text.replace("\n", " ").strip()

        if len(chunk_text_to_append) > config.min_chunk_length_to_embed:
            chunks.append(chunk_text_to_append)

        tokens = tokens[len(tokenizer.encode(chunk_text, disallowed_special=())) :]
        num_chunks += 1

    if tokens:
        remaining_text = tokenizer.decode(tokens).replace("\n", " ").strip()
        if len(remaining_text) > config.min_chunk_length_to_embed:
            chunks.append(remaining_text)

    return chunks


def create_document_chunks(
    doc: Document, config: ChunkingConfig
) -> Tuple[List[DocumentChunk], str]:
    """
    Create a list of document chunks from a document object.

    Args:
        doc: The document object to create chunks from.
        config: ChunkingConfig containing the chunking parameters.

    Returns:
        A tuple of (doc_chunks, doc_id).
    """
    if not doc.text or doc.text.isspace():
        return [], doc.id or str(uuid.uuid4())

    doc_id = doc.id or str(uuid.uuid4())
    text_chunks = get_text_chunks(doc.text, config)

    metadata = (
        DocumentChunkMetadata(**doc.metadata.dict())
        if doc.metadata is not None
        else DocumentChunkMetadata()
    )
    metadata.document_id = doc_id

    doc_chunks = []
    for i, text_chunk in enumerate(text_chunks):
        chunk_id = f"{doc_id}_{i}"
        doc_chunk = DocumentChunk(
            id=chunk_id,
            text=text_chunk,
            metadata=metadata,
        )
        doc_chunks.append(doc_chunk)

    return doc_chunks, doc_id


async def get_document_chunks(
    documents: List[Document],
    chunk_token_size: Optional[Union[int, ChunkingConfig]] = None,
    model: str = EmbeddingModels.TEXT_EMBEDDING_3_SMALL.value,
) -> Dict[str, List[DocumentChunk]]:
    """
    Convert documents into chunks with embeddings.

    Args:
        documents: The list of documents to convert.
        chunk_token_size: Either a ChunkingConfig object or a legacy integer chunk size.
        model: The embedding model to use.

    Returns:
        A dictionary mapping document ids to their chunks.
    """
    # Handle legacy integer chunk_token_size
    if isinstance(chunk_token_size, int):
        config = ChunkingConfig(chunk_token_size=chunk_token_size)
    elif isinstance(chunk_token_size, ChunkingConfig):
        config = chunk_token_size
    else:
        config = ChunkingConfig()  # Use defaults

    chunks: Dict[str, List[DocumentChunk]] = {}
    all_chunks: List[DocumentChunk] = []

    for doc in documents:
        doc_chunks, doc_id = create_document_chunks(doc, config)
        all_chunks.extend(doc_chunks)
        chunks[doc_id] = doc_chunks

    if not all_chunks:
        return {}

    chunk_texts = [chunk.text for chunk in all_chunks]
    embeddings = await get_multiple_text_embeddings(
        docs=chunk_texts, model=model, batch_size=config.embeddings_batch_size
    )

    for i, chunk in enumerate(all_chunks):
        chunk.embedding = embeddings[i].tolist()

    return chunks
