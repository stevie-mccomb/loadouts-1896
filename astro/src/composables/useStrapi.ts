import { strapi } from '@strapi/client';

export const useStrapi = () => {
    return strapi({
        baseURL: import.meta.env.PUBLIC_STRAPI_API_URL,
        auth: import.meta.env.PUBLIC_STRAPI_API_TOKEN,
    });
};

export const useStrapiMedia = () => {};
