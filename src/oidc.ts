import { oidcSpa } from "oidc-spa/react-spa";
import { z } from "zod";

export const {
    bootstrapOidc,
    useOidc,
    getOidc,
    OidcInitializationGate,
} = oidcSpa
    .withExpectedDecodedIdTokenShape({
        decodedIdTokenSchema: z.object({
            sub: z.string(),
            name: z.string().optional(),
            preferred_username: z.string().optional(),
            email: z.string().email().optional(),
            picture: z.string().optional(),
            // Keycloak sends groups at top level
            groups: z.array(z.string()).optional(),
            // Keycloak sends roles at top level (not under realm_access)
            roles: z.array(z.string()).optional(),
        }),
        decodedIdToken_mock: {
            sub: "mock-user-id",
            name: "Usuario Demo",
            preferred_username: "demo.user",
            email: "demo@example.com",
            groups: ["CAS", "HUEMUL"],
            roles: ["DIRIGENTE", "ADMIN", "ACAMPANTE"],
        },
    })
    .createUtils();

/**
 * Bootstrap OIDC configuration - call this immediately at app start
 */
bootstrapOidc(
    import.meta.env.VITE_OIDC_USE_MOCK === "true"
        ? {
            implementation: "mock",
            isUserInitiallyLoggedIn: true,
        }
        : {
            implementation: "real",
            issuerUri: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`,
            clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "FE",
            debugLogs: import.meta.env.DEV,
        }
);

/**
 * Fetch wrapper that automatically adds Authorization header when logged in
 */
export const fetchWithAuth: typeof fetch = async (input, init) => {
    const oidc = await getOidc();

    if (oidc.isUserLoggedIn) {
        const accessToken = await oidc.getAccessToken();
        const headers = new Headers(init?.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        (init ??= {}).headers = headers;
    }

    return fetch(input, init);
};
