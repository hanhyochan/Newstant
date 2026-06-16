"use client";

import { useCallback } from "react";

type ShareContent = {
  text?: string;
  title: string;
  url?: string;
};

function getCurrentUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
}

async function copyShareUrl(url: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const textarea = document.createElement("textarea");

  textarea.value = url;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function useShareContent({ text, title, url }: ShareContent) {
  return useCallback(async () => {
    if (typeof window === "undefined") {
      return false;
    }

    const shareUrl = url ?? getCurrentUrl();
    const shareData: ShareData = {
      text,
      title,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyShareUrl(shareUrl);
      }

      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return false;
      }

      await copyShareUrl(shareUrl);
      return true;
    }
  }, [text, title, url]);
}
