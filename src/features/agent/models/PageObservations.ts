import type { HTTPMessageDTO, PageDTO, PageDataResponse } from "../../../api/agent/types";
import type { SpiderStats } from "../../../components/pages/agent_dashboard/types";

export interface PageDiffItem {
  page: string;
  http_msgs: HTTPMessageDTO[];
}

export class PageObservations {
  public readonly pages: PageDTO[];

  constructor(pages: PageDTO[] = []) {
    this.pages = Array.isArray(pages) ? pages : [];
  }

  static empty(): PageObservations {
    return new PageObservations([]);
  }

  static fromResponse(input: PageDataResponse | PageDTO[] | undefined | null): PageObservations {
    if (!input) return PageObservations.empty();
    if (Array.isArray(input)) return new PageObservations(input);
    return new PageObservations(input.page_data ?? []);
  }

  /**
   * Computes additions from this → other. Assumes data only ever appends.
   * Returns new pages entirely, and for existing pages, any new trailing http_msgs.
   */
  diff(other: PageObservations): PageDiffItem[] {
    const diffs: PageDiffItem[] = [];
    const priorByUrl = new Map<string, PageDTO>();
    this.pages.forEach((p) => priorByUrl.set(p.url, p));

    other.pages.forEach((p) => {
      const prior = priorByUrl.get(p.url);
      if (!prior) {
        // Entirely new page
        diffs.push({ page: p.url, http_msgs: p.http_msgs ?? [] });
        return;
      }
      const priorLen = prior.http_msgs?.length ?? 0;
      const nextLen = p.http_msgs?.length ?? 0;
      if (nextLen > priorLen) {
        const newMsgs = (p.http_msgs ?? []).slice(priorLen);
        if (newMsgs.length > 0) {
          diffs.push({ page: p.url, http_msgs: newMsgs });
        }
      }
    });

    return diffs;
  }

  toAsciiTreeLines(): string[] {
    const pages = this.pages;
    if (!Array.isArray(pages) || pages.length === 0) return ["/"];

    const lines: string[] = [];

    const safePathFromUrl = (url: string): string => {
      try {
        const u = new URL(url);
        return "/" + u.pathname || "/" + u.hash || "/";
      } catch {
        return url || "/";
      }
    };

    pages.forEach((page, pageIdx) => {
      const isLastPage = pageIdx === pages.length - 1;
      const pageConnector = isLastPage ? "└─ " : "├─ ";
      const pageLabel = safePathFromUrl(page.url);
      lines.push(`${pageConnector}${pageLabel}`);

      const msgs = page.http_msgs ?? [];
      msgs.forEach((msg, msgIdx) => {
        const isLastMsg = msgIdx === msgs.length - 1;
        const childPrefix = isLastPage ? "   " : "│  ";
        const msgConnector = isLastMsg ? "└─ " : "├─ ";
        const method = msg.request?.data?.method?.toUpperCase?.() || "GET";
        const requestUrl = msg.request?.data?.url || page.url;
        const path = safePathFromUrl(requestUrl);
        lines.push(`${childPrefix}${msgConnector}${method} ${path}`);
      });
    });

    return lines;
  }

  toStats(): SpiderStats {
    const pagesCount = this.pages.length;
    const requestsCount = this.pages.reduce((acc, p) => acc + (p.http_msgs?.length ?? 0), 0);
    return { pages: pagesCount, requests: requestsCount };
  }
}


