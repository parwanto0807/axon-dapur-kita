export const getImageUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Get base URL from env, default to local if not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    // Ensure the path is prefixed with the base API URL correctly
    // Product paths from backend usually look like /products/slug/file.webp
    // The final URL should be https://domain.com/api/products/...
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Replace /api if it's already at the end of apiUrl to avoid double /api/api
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    return `${baseUrl}${cleanPath}`;
};
