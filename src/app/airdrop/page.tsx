import { AirdropChecker } from '@/components/airdrop/airdrop-checker';
import { PageLayout } from '@/components/layout/page-layout';
import { config } from '@/lib/config';

export default function AirdropPage() {
  const apiBaseUrl = config.api.baseUrl;

  return (
    <PageLayout
      title="$NEMA Airdrop"
      subtitle="Check your eligibility for the $NEMA airdrop"
    >
      <AirdropChecker apiBaseUrl={apiBaseUrl} />
    </PageLayout>
  );
}
