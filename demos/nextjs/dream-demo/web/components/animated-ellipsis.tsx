import { useEffect, useState } from "react";

const AnimatedEllipsis = () => {
  const [ellipsis, setEllipsis] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setEllipsis((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return <>{ellipsis}</>;
};

export default AnimatedEllipsis;
