import { MetaData } from '@/core/Metadata';
import { Metadata, ResolvingMetadata } from 'next';
import FormRate from './_components/FormRate';

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    _: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
        metadataBase: new URL(MetaData.landingPageDomain),
        title: 'Fillform - Điền form theo tỉ lệ',
        description: MetaData.defaultDescription,
        alternates: {
            canonical: MetaData.defaultCanonical,
            languages: MetaData.defaultLanguages,
        },
        openGraph: {
            images: ['https://app.survify.info/static/img/background.jpg', ...previousImages],
        },
    };
}
export default function FormRatePage() {
    return (
        <FormRate />
    );
}
