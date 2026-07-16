import { useState } from "react";
import api from "../../api/api";

export default function useSignUp() {
  const [signUpError, setSignUpError] = useState(null);
  const [signUpIsLoading, setSignUpIsLoading] = useState(false);
  const [signUpUser, setSignUpUser] = useState(null);

  async function signUp(username, email, password) {
    setSignUpIsLoading(true);
    setSignUpError(null);
    setSignUpUser(null);

    try {
      const response = await api.post("/signup", {
        username,
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      setSignUpUser(response.data.user);

    }
    
    catch (err) {
      const data = err.response?.data;
      let errorMessage = "An error occurred during sign up.";

      if (data) {
        if (data.errors && typeof data.errors === "object") {
          const messages = Array.isArray(data.errors)
            ? data.errors.join(", ")
            : Object.values(data.errors).flat().join(" ");
          if (messages) errorMessage = messages;
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        } else if (typeof data.error === "string") {
          errorMessage = data.error;
        }
      }

      setSignUpError(errorMessage);
      setSignUpUser(null);
    }
    
    finally {
      setSignUpIsLoading(false);
    }

  };

  return { signUp, signUpError, setSignUpError, signUpIsLoading, setSignUpIsLoading, signUpUser, setSignUpUser };
}