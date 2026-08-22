import { userRegister, userLogin, userLogout, userMe } from "../controllers/user_controller.js";
import { filesGet, filesGetById, filesDownloadById } from "../controllers/file_controller.js";

export async function handleAppwriteRoute(pathname, method, body) {
    if (pathname === "/register" && method === "POST") return userRegister(body);
    if (pathname === "/login" && method === "POST") return userLogin(body);
    if (pathname === "/logout" && method === "POST") return userLogout();
    if (pathname === "/me" && method === "GET") return userMe();
    if (pathname === "/files" && method === "GET") return filesGet();

    const downloadMatch = pathname.match(/^\/files\/([^/]+)\/download$/);
    if (downloadMatch && method === "GET") return filesDownloadById(downloadMatch[1]);

    const fileMatch = pathname.match(/^\/files\/([^/]+)$/);
    if (fileMatch && method === "GET") return filesGetById(fileMatch[1]);

    return null;
}