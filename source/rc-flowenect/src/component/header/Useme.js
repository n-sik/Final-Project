import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

export function useMe() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    apiClient
      .get("/rest/mypage/me")
      .then((res) => setMe(res.data))
      .catch((err) => {
        console.error("useMe 실패:", err);
        // setMe(null) 제거 - 실패해도 null 유지하면 재시도 안됨
      });
  }, []);

  return me;
}