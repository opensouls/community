# Raggy pitches

**Soul Designer:** [@tobowers](https://github.com/tobowers)

This soul, named Raggy, is designed to demonstrate the RAG capabilities built into the SOUL ENGINE. There are some documents in the `./rag` directory and those get pushed up to our vector store.
Then, souls within the organization can access the information contained in those files.

The source code for these processes can be found in the `./soul` directory.

## Run this soul

In this directory run

```bash
npx soul-engine rag push ./rag
```

then

```bash
npx soul-engine dev
```