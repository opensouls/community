export default function SystemMessage({ children }: { children: string }) {
  return (
    <div className="text-c-bright-yellow uppercase font-cranky-terminal">
      <span>&gt; {children}</span>
    </div>
  );
}
