export const useReplicaMemory = async (identifier, initialState, fn) => {
  const { get, set } = fn();

  const state = (await get(identifier)) || {
    key: identifier,
    content: initialState,
    metadata: {
      _pendingEmbed: true,
    },
    embedding: [],
  };

  const dispatch = async (nextContent) => {
    await set(identifier, nextContent);
  };

  return [state.content, dispatch];
};
