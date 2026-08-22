import { handleAppwriteRoute } from "./src/routes/router.js";

(function () {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async function (input, init = {}) {
        const isAppwrite = document.querySelector('input[name="backendMode"][value="appwrite"]')?.checked;
        if (!isAppwrite) return originalFetch(input, init);

        const url = typeof input === "string" ? input : input.url;
        const { pathname } = new URL(url, window.location.href);
        const method = init.method || "GET";

        let body = {};
        if (init.body && typeof init.body === "string") {
            try { body = JSON.parse(init.body); } catch (_) {}
        }

        const response = await handleAppwriteRoute(pathname, method, body);
        if (response) return response;

        return originalFetch(input, init);
    };

    console.info("appwrite-adapter loaded successfully.");
})();