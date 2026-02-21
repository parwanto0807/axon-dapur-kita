export const getImageUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Get API URL from env, default to local if not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    // Ensure the path is prefixed with a slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${apiUrl}${cleanPath}`;
};
