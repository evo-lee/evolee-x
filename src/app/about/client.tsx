"use client";

import { useMemo } from "react";
import type {
  ProfileManifest,
  ProfileMeta,
  ProfileReport,
} from "@/lib/content/author-profile";
import { AboutClient } from "@/components/about/model-switcher";
import { AboutHero } from "@/components/about/about-hero";
import { AboutIdentity } from "@/components/about/about-identity";
import { AboutStrengths } from "@/components/about/about-strengths";
import { AboutStyles } from "@/components/about/about-styles";
import { AboutProofs } from "@/components/about/about-proofs";
import { AboutDisclaimer } from "@/components/about/about-disclaimer";

interface SerializedReport {
  modelId: string;
  meta: ProfileMeta;
  report: ProfileReport;
}

interface AboutPageClientProps {
  manifest: ProfileManifest;
  reports: SerializedReport[];
  postCovers: Record<string, string>;
}

export function AboutPageClient({ manifest, reports, postCovers }: AboutPageClientProps) {
  // 构建 modelId → report 的快速查找映射
  const reportMap = useMemo(() => {
    const map = new Map<string, SerializedReport>();
    for (const r of reports) {
      map.set(r.modelId, r);
    }
    return map;
  }, [reports]);

  // 确定默认模型（支持 URL 参数）
  const defaultModelId = useMemo(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlModel = params.get("model");
      if (urlModel && reportMap.has(urlModel)) {
        return urlModel;
      }
    }
    return manifest.defaultModel;
  }, [manifest.defaultModel, reportMap]);

  return (
    <AboutClient
      defaultModelId={defaultModelId}
      models={manifest.models}
    >
      {(activeModelId) => {
        const activeReport =
          reportMap.get(activeModelId) ?? reports[0];
        if (!activeReport) return null;

        const { meta, report } = activeReport;

        return (
          <div className="mt-6 space-y-6">
            <AboutHero
              title={report.hero.title}
              summary={report.hero.summary}
              intro={report.hero.intro}
              meta={meta}
            />

            <AboutIdentity identities={report.identities} />

            <section className="grid gap-4 md:grid-cols-2">
              <AboutStrengths strengths={report.strengths} />
              <AboutStyles styles={report.styles} />
            </section>

            <AboutProofs
              posts={report.proofs.posts}
              tweets={report.proofs.tweets}
              projects={report.proofs.projects}
              postCovers={postCovers}
            />

            <AboutDisclaimer disclaimer={report.disclaimer} meta={meta} />
          </div>
        );
      }}
    </AboutClient>
  );
}
