import { AirdropChecker } from '@/components/airdrop/airdrop-checker';
import { PageLayout } from '@/components/layout/page-layout';
import { config } from '@/lib/config';

export default function AirdropPage() {
  const apiBaseUrl = config.api.baseUrl;

  return (
    <PageLayout
      title="Airdrop"
      subtitle="Check your NEMA airdrop eligibility"
    >
      <div className="max-w-2xl mx-auto">
        <AirdropChecker apiBaseUrl={apiBaseUrl} />
      </div>
    </PageLayout>
  );
}
