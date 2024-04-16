export default function UserMessage({ children }: { children: string }) {
  return (
    <div className="text-c-green">
      <div>You: </div>
      <span>{children}</span>
    </div>
  );
}
