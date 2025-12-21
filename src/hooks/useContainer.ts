import { useState, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";

export const useContainer = () => {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();

  async function main() {
    const webcontainerInstance = await WebContainer.boot();
    setWebcontainer(webcontainerInstance);
  }
  useEffect(() => {
    main();
  }, []);
  return webcontainer;
};
