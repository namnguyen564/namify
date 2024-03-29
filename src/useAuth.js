import { useState, useEffect } from "react";
import axios from "axios";

export default function useAuth(code) {
  const [accessToken, setAcessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    // axios.post('http://localhost:3001/login', {
    axios
      .post("https://namify-server-production.up.railway.app/login", {
        code,
      })
      .then((res) => {
        console.log(res.data);
        setAcessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, null, "/");
      })
      .catch(() => {
        // window.location = "/"
      });
  }, [code]);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      axios
        // .post('http://localhost:3001/refresh', {
        .post("https://namify-server-production.up.railway.app/refresh", {
          refreshToken,
        })
        .then((res) => {
          setAcessToken(res.data.accessToken);
          setExpiresIn(61);
        })
        .catch(() => {
          window.location = "/";
        });
    }, (expiresIn - 60) * 1000);
    return () => clearInterval(interval);
  }, [refreshToken, expiresIn]);

  return accessToken;
}
