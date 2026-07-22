declare module "@localSearchIndex" {
  const loaders: Record<string, () => Promise<{ default: string }>>;
  export default loaders;
}
