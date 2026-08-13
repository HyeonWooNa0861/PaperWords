"use client";

import { useEffect, useRef, useState } from "react";
import { PAPERWORDS_PWA_DEFAULT_VERSIONS, type PaperWordsPwaVersions } from "@/src/lib/pwa/version";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

interface WorkerVersionSignal extends PaperWordsPwaVersions {
  type: "PAPERWORDS_VERSION";
  lifecycle: "installed" | "activated";
}

export function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [workerVersion, setWorkerVersion] = useState<PaperWordsPwaVersions>(PAPERWORDS_PWA_DEFAULT_VERSIONS);
  const [installState, setInstallState] = useState<"idle" | "accepted" | "dismissed" | "installed">("idle");
  const workerVersionRef = useRef(workerVersion);
  const shouldReloadAfterUpdate = useRef(false);
  const hasReloadedAfterUpdate = useRef(false);

  useEffect(() => {
    workerVersionRef.current = workerVersion;
  }, [workerVersion]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallState("idle");
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setInstallState("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return undefined;
    }

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (isWorkerVersionSignal(event.data)) {
        const nextVersion = {
          appVersion: event.data.appVersion,
          contentVersion: event.data.contentVersion,
          cacheVersion: event.data.cacheVersion
        };

        workerVersionRef.current = nextVersion;
        storeWorkerVersion(nextVersion);
        setWorkerVersion(nextVersion);
      }
    };

    const handleControllerChange = () => {
      if (!shouldReloadAfterUpdate.current || hasReloadedAfterUpdate.current) {
        return;
      }

      hasReloadedAfterUpdate.current = true;
      storeWorkerVersion(workerVersionRef.current);
      window.location.reload();
    };

    const trackInstallingWorker = (worker: ServiceWorker | null) => {
      if (!worker) {
        return;
      }

      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          setWaitingWorker(worker);
        }
      });
    };

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none"
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }

        trackInstallingWorker(registration.installing);
        registration.addEventListener("updatefound", () => {
          trackInstallingWorker(registration.installing);
        });
      } catch {
        return;
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    restoreStoredVersion((versions) => {
      workerVersionRef.current = versions;
      setWorkerVersion(versions);
    });
    void register();

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    const prompt = installPrompt;
    setInstallPrompt(null);
    await prompt.prompt();
    const choice = await prompt.userChoice;
    setInstallState(choice.outcome);
  };

  const handleUpdate = () => {
    if (!waitingWorker) {
      return;
    }

    shouldReloadAfterUpdate.current = true;
    storeWorkerVersion(workerVersionRef.current);
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  const hasVisibleControls = Boolean(waitingWorker || installPrompt || installState === "installed");

  if (!hasVisibleControls) {
    return <PwaVersionSignal versions={workerVersion} />;
  }

  return (
    <section className="pwa-controls" aria-label="앱 상태" data-cache-version={workerVersion.cacheVersion}>
      <PwaVersionSignal versions={workerVersion} />
      {waitingWorker ? (
        <div className="pwa-banner" role="status" aria-labelledby="pwa-update-title">
          <div>
            <h2 id="pwa-update-title">새 PaperWords 버전 준비됨</h2>
            <p>로컬 콘텐츠와 오프라인 화면의 업데이트를 적용할 수 있습니다.</p>
          </div>
          <button className="button" type="button" onClick={handleUpdate}>
            업데이트 적용
          </button>
        </div>
      ) : null}
      {installPrompt ? (
        <div className="pwa-banner pwa-banner--install" role="status" aria-labelledby="pwa-install-title">
          <div>
            <h2 id="pwa-install-title">PaperWords 설치 가능</h2>
            <p>지원 브라우저에서 로컬 앱으로 열 수 있습니다.</p>
          </div>
          <button className="button button--secondary" type="button" onClick={handleInstall}>
            앱 설치
          </button>
        </div>
      ) : null}
      {installState === "installed" ? (
        <p className="pwa-installed" role="status">
          PaperWords 설치가 완료되었습니다.
        </p>
      ) : null}
    </section>
  );
}

function PwaVersionSignal({ versions }: Readonly<{ versions: PaperWordsPwaVersions }>) {
  return (
    <span
      className="pwa-version-signal"
      data-app-version={versions.appVersion}
      data-cache-version={versions.cacheVersion}
      data-content-version={versions.contentVersion}
      hidden
    />
  );
}

function isWorkerVersionSignal(value: unknown): value is WorkerVersionSignal {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkerVersionSignal>;

  return (
    candidate.type === "PAPERWORDS_VERSION" &&
    typeof candidate.appVersion === "string" &&
    typeof candidate.contentVersion === "string" &&
    typeof candidate.cacheVersion === "string"
  );
}

function restoreStoredVersion(setWorkerVersion: (versions: PaperWordsPwaVersions) => void): void {
  try {
    const raw = window.sessionStorage.getItem("paperwords:pwa-version");
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Partial<PaperWordsPwaVersions>;
    if (
      typeof parsed.appVersion === "string" &&
      typeof parsed.contentVersion === "string" &&
      typeof parsed.cacheVersion === "string"
    ) {
      setWorkerVersion({
        appVersion: parsed.appVersion,
        contentVersion: parsed.contentVersion,
        cacheVersion: parsed.cacheVersion
      });
    }
  } catch {
    window.sessionStorage.removeItem("paperwords:pwa-version");
  }
}

function storeWorkerVersion(versions: PaperWordsPwaVersions): void {
  window.sessionStorage.setItem("paperwords:pwa-version", JSON.stringify(versions));
}
