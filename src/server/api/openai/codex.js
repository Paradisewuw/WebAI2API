export const CODEX_INSTALLATION_HEADER = 'x-codex-installation-id';

export function normalizeCodexInstallationId(value) {
    return typeof value === 'string' ? value.trim() : '';
}

export function getCodexInstallationId(req, data, config) {
    const metadata = data?.client_metadata;

    return normalizeCodexInstallationId(req.headers[CODEX_INSTALLATION_HEADER])
        || normalizeCodexInstallationId(metadata?.[CODEX_INSTALLATION_HEADER])
        || normalizeCodexInstallationId(metadata?.codex_installation_id)
        || normalizeCodexInstallationId(config?.server?.codexInstallationId);
}

export function applyCodexInstallationMetadata(data, installationId) {
    if (!installationId) return;

    if (!data.client_metadata || typeof data.client_metadata !== 'object' || Array.isArray(data.client_metadata)) {
        data.client_metadata = {};
    }

    data.client_metadata[CODEX_INSTALLATION_HEADER] = installationId;
    data.client_metadata.codex_installation_id = installationId;
}
