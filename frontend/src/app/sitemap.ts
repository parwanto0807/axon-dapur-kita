import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://axonumkm.id'

    // In a real app, we would fetch all products and shops here
    // For now, we'll include static routes and a placeholder logic

    const routes = [
        '',
        '/seller-info',
        '/seller-registration',
        '/faq',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return [
        ...routes,
    ]
}
