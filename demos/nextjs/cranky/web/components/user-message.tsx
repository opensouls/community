export default function UserMessage({ children }: { children: string }) {
  return (
    <div className="text-c-green">
      <span>You: </span>
      <span>{children}</span>
    </div>
  );
}
