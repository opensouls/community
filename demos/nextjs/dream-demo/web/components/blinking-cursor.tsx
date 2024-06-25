import { useEffect, useState } from "react";

const BlinkingCursor = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <>{visible ? "▎" : ""}</>;
};

export default BlinkingCursor;
