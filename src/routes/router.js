import { userRegister, userLogin, userLogout, userMe } from "../controllers/user_controller.js";

export async function handleAppwriteRoute(pathname, method, body) {
    if (pathname === "/register" && method === "POST") return userRegister(body);
    if (pathname === "/login" && method === "POST") return userLogin(body);
    if (pathname === "/logout" && method === "POST") return userLogout();
    if (pathname === "/me" && method === "GET") return userMe();

    return null;
}