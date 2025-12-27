import { useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

type FileContent =
  | {
      file: { contents: string };
    }
  | {
      directory: { [name: string]: FileContent };
    };

type MountTree = {
  [name: string]: FileContent;
};

export function useContainer(files?: MountTree) {
  const webcontainerRef = useRef<WebContainer | null>(null);

  const [url, setUrl] = useState<string>("");
  const [status, setStatus] = useState<
    "booting" | "mounting" | "installing" | "running" | "error"
  >("booting");

  const hasInstalled = useRef(false);
  const hasStartedServer = useRef(false);

  // 1️⃣ Boot WebContainer ONCE
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (webcontainerRef.current) return;

        const wc = await WebContainer.boot();
        if (cancelled) return;

        webcontainerRef.current = wc;
        setStatus("mounting");
      } catch (err) {
        console.error("WebContainer boot failed:", err);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2️⃣ Mount files WHENEVER they change
  useEffect(() => {
    if (!files) return;
    if (!webcontainerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        setStatus("mounting");

        await webcontainerRef.current!.mount(files);
        if (cancelled) return;

        // 3️⃣ npm install (ONCE)
        if (!hasInstalled.current) {
          setStatus("installing");

          const install = await webcontainerRef.current!.spawn("npm", [
            "install",
          ]);

          await install.exit;
          hasInstalled.current = true;
        }

        // 4️⃣ Start dev server (ONCE)
        if (!hasStartedServer.current) {
          webcontainerRef.current!.on("server-ready", (_, serverUrl) => {
            setUrl(serverUrl);
            setStatus("running");
          });

          await webcontainerRef.current!.spawn("npm", ["run", "dev"]);
          hasStartedServer.current = true;
        }
      } catch (err) {
        console.error("WebContainer error:", err);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [files]);

  return {
    webcontainer: webcontainerRef.current,
    url,
    status,
  };
}
