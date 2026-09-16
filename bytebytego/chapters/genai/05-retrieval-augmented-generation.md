# 05: Retrieval-Augmented Generation

## Core Idea
Enable a chatbot to answer from an external, evolving knowledge base by combining a general-purpose LLM with a real-time vector retrieval system — prefer RAG over finetuning or prompt engineering for large, changing datasets.

## Design Framework / Approach
- **Input/output**: user query + document database (PDFs: text, tables, images) → referenced text answer.
- **Approach selection**: finetuning (accurate but costly, no references), prompt engineering (cheap but can't scale past context window), RAG (retrieval + generation — best balance for evolving corpora).
- **Data preparation (3 steps)**: document parsing (rule-based vs. AI-based OCR/object detection like Layout-Parser) → chunking (length-, regex-, or structure-based splitters) → indexing (convert chunks to embeddings, store in a vector DB).
- **Retrieval**: prefer vector-based over keyword/full-text/knowledge-graph for semantic understanding and scalability (~40M chunks here); use approximate nearest neighbor (ANN) over exact search.
- **Generation**: LLM consumes query + retrieved context with prompt engineering (CoT, few-shot, role, user-context) and top-p sampling.
- **System**: indexing process → safety filtering → query expansion → retrieval → generation.

## Key Concepts & Components
- **Text/image encoders**: encoder-only Transformer for text; use a shared embedding space (CLIP) or image captioning to align images with text.
- **Chunking**: split long text so embeddings retain detail and chunks fit the model's token limit.
- **ANN categories**: tree-based (k-d tree, Annoy), locality-sensitive hashing (LSH), clustering-based (inter- then intra-cluster search), graph-based (HNSW).
- **ANN frameworks**: Elasticsearch, FAISS, ScaNN.
- **RAFT (Retrieval-Augmented Fine-Tuning)**: finetune the LLM to distinguish relevant ("golden") from irrelevant ("distractor") retrieved docs; apply only when retrieval is good but generation is not.
- **Prompt engineering principles**: start simple, break down tasks, use clear instructions, be specific, balance length.
- **CoT**: guide intermediate reasoning steps; test-time compute scaling improves complex answers.
- **Evaluation triad**: context relevance (hit rate, MRR, NDCG, Precision@k), faithfulness (hallucination check), answer relevance, answer correctness (BLEU/ROUGE/METEOR).

## Trade-offs & Anti-patterns
- **Finetuning for a changing KB**: requires frequent retraining and can't cite sources.
- **Stuffing all context into a prompt**: exceeds the context window — chunk + retrieve instead.
- **Exact nearest neighbor at scale**: O(N×D) is too slow for tens of millions of embeddings — use ANN.
- **Finetuning as the first optimization step**: usually unnecessary; tune retrieval + prompts first, then consider RAFT.
- **Poor retrieval dominates output**: RAG quality is bounded by retrieval relevance — invest in indexing and query quality.

## Key Takeaways
1. Choose RAG when data is large, evolving, and must be referenced; choose finetuning only for deep domain specialization.
2. Index with vector embeddings (CLIP for multimodal) and ANN for sublinear retrieval.
3. Evaluate all three corners: retrieval (context relevance), groundedness (faithfulness), and answer quality (relevance + correctness).

## Connects To
- **03-chatgpt-personal-assistant-chatbot**: the LLM + safety-filtering foundation RAG builds on.
- **04-image-captioning**: used to align images with text embeddings.
- **09-personalized-headshot-generation**: LoRA (mentioned here) is a core finetuning method there.
