import InquiryDetail from '@/modules/admin/components/inquiry-detail';

export default async function BusinessInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InquiryDetail inquiryId={id} />;
}

