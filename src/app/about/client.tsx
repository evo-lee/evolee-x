"use client";

import { useMemo } from "react";
import type {
  ProfileManifest,
  ProfileMeta,
  ProfileReport,
} from "@/lib/content/author-profile";
import { AboutModelClient } from "@/components/about/about-model-client";
import { AboutHero } from "@/components/about/about-hero";
import { AboutTags } from "@/components/about/about-tags";
import { AboutStyles } from "@/components/about/about-styles";
import { AboutIdentity } from "@/components/about/about-identity";
import { AboutStrengths } from "@/components/about/about-strengths";
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

  return (
    <AboutModelClient
      defaultModelId={manifest.defaultModel}
      models={manifest.models}
    >
      {(activeModelId) => {
        const activeReport =
          reportMap.get(activeModelId) ??
          reportMap.get(manifest.defaultModel) ??
          reports[0];
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

            {report.tags && report.tags.length > 0 && (
              <AboutTags tags={report.tags} />
            )}

            <AboutStyles styles={report.styles} />

            <AboutIdentity identities={report.identities} />

            <AboutStrengths strengths={report.strengths} />

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
    </AboutModelClient>
  );
}
