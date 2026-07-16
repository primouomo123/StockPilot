import { useState } from "react";
import api from "../../api/api";

export default function useLogin() {
    const [loginError, setLoginError] = useState(null);
    const [loginIsLoading, setLoginIsLoading] = useState(false);
    const [loginUser, setLoginUser] = useState(null);

    async function login(username, password) {
        setLoginIsLoading(true);
        setLoginError(null);
        setLoginUser(null);

        try {
            const response = await api.post("/login", {
                username,
                password,
            });

            localStorage.setItem("token", response.data.access_token);

            setLoginUser(response.data.user);
        }
        
        catch (err) {
            const data = err.response?.data;
            let errorMessage = "An error occurred during login.";

            if (data) {
                if (typeof data.message === "string") {
                    errorMessage = data.message;
                } else if (typeof data.error === "string") {
                    errorMessage = data.error;
                } else if (data.errors) {
                    errorMessage = typeof data.errors === "string"
                        ? data.errors
                        : Array.isArray(data.errors)
                        ? data.errors.join(", ")
                        : Object.values(data.errors).flat().join(" ");
                }
            }

            setLoginError(errorMessage);
            setLoginUser(null);
        }
        
        finally {
            setLoginIsLoading(false);
        }
    };

    return { login, loginError, setLoginError, loginIsLoading, setLoginIsLoading, loginUser, setLoginUser };
}