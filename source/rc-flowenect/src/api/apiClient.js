import axios from 'axios';

export function getPortalBaseUrl() {
    let protocol = window.location.protocol;
    let hostname = window.location.hostname;
    // 개발환경(3000포트)에서는 포트 없이 반환
    return `${protocol}//${hostname}`;
}

const apiClient = axios.create({
    baseURL: getPortalBaseUrl(),
    withCredentials: true,
});

function forceLogout(message) {
    if (message) alert(message);
    window.location.href = `${getPortalBaseUrl()}/login`;
}

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            forceLogout('인증 세션이 만료되었습니다. 포털에서 다시 접근해주세요.');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
