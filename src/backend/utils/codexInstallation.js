const CODEX_INSTALLATION_HEADER = 'x-codex-installation-id';
const CONVERSATION_API_PATH = 'backend-api/f/conversation';

function normalizeInstallationId(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function mergeClientMetadata(payload, installationId) {
    const current = payload.client_metadata;
    const metadata = current && typeof current === 'object' && !Array.isArray(current) ? current : {};

    payload.client_metadata = {
        ...metadata,
        [CODEX_INSTALLATION_HEADER]: installationId,
        codex_installation_id: installationId
    };

    return payload;
}

export async function installCodexInstallationRoute(page, installationId, meta = {}, logger) {
    const normalizedId = normalizeInstallationId(installationId);
    if (!normalizedId) {
        return async () => { };
    }

    const matcher = (url) => url.href.includes(CONVERSATION_API_PATH);
    const handler = async (route) => {
        const request = route.request();
        if (request.method() !== 'POST') {
            await route.continue();
            return;
        }

        const headers = {
            ...request.headers(),
            [CODEX_INSTALLATION_HEADER]: normalizedId
        };

        let postData = request.postData();
        try {
            const payload = request.postDataJSON();
            postData = JSON.stringify(mergeClientMetadata(payload, normalizedId));
        } catch {
            // Keep the original body if this request is not JSON.
        }

        await route.continue({ headers, postData });
    };

    await page.route(matcher, handler);
    logger?.debug?.('适配器', '已启用 Codex 安装 ID 注入', { ...meta, hasCodexInstallationId: true });

    return async () => {
        await page.unroute(matcher, handler).catch(() => { });
    };
}
