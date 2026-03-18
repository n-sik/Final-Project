let stompClient = null;

function setConnected(connected) {
    const connectBtn = document.getElementById("connect");
    const disconnectBtn = document.getElementById("disconnect");
    
    if (connectBtn) connectBtn.disabled = connected;
    if (disconnectBtn) disconnectBtn.disabled = !connected;
    
    if (connected) {
        document.getElementById("greetings").innerHTML = "";
    }
}

// 2. STOMP 클라이언트 초기화 함수
function initStompClient() {
    // 라이브러리 로드 확인 (가장 중요)
    const StompJSObject = window.StompJs || (typeof StompJs !== 'undefined' ? StompJs : null);
    
    if (!StompJSObject) {
        console.error("❌ 에러: StompJs 라이브러리가 로드되지 않았습니다. CDN 주소를 확인하세요.");
        return;
    }

    stompClient = new StompJSObject.Client({
        // 포트 80이든 8080이든 현재 접속 주소에 맞게 자동 설정
        brokerURL: `ws://${window.location.host}/ws`,
        
        onConnect: (frame) => {
            setConnected(true);
            console.log('✅ Connected: ' + frame);
            stompClient.subscribe('/topic/messages', (greeting) => {
                showGreeting(JSON.parse(greeting.body).content);
            });
        },
        
        debug: function (str) {
            console.log('STOMP Debug: ' + str);
        },

        onWebSocketError: (error) => {
            console.error('❌ WebSocket Error:', error);
        },
        onStompError: (frame) => {
            console.error('❌ Broker Error:', frame.headers['message']);
        }
    });
}

function connect() {
    if (!stompClient) initStompClient();
    console.log("🚀 연결 시도 중...");
    stompClient.activate();
}

function disconnect() {
    if (stompClient) {
        stompClient.deactivate();
        setConnected(false);
        console.log("🔌 Disconnected");
    }
}

function sendName() {
    const nameInput = document.getElementById("name");
    if (!stompClient || !stompClient.connected) {
        alert("먼저 연결을 해주세요!");
        return;
    }
    stompClient.publish({
        destination: "/app/send",
        body: JSON.stringify({'name': nameInput.value})
    });
    nameInput.value = "";
}

function showGreeting(message) {
    const greetings = document.getElementById("greetings");
    const row = document.createElement("tr");
    row.innerHTML = `<td>${message}</td>`;
    greetings.appendChild(row);
}

function setup() {
    console.log("아이디 찾기 및 이벤트 리스너 등록 시작");
    const cBtn = document.getElementById("connect");
    const dBtn = document.getElementById("disconnect");
    const sBtn = document.getElementById("send");

    if (cBtn) cBtn.onclick = (e) => { e.preventDefault(); connect(); };
    if (dBtn) dBtn.onclick = (e) => { e.preventDefault(); disconnect(); };
    if (sBtn) sBtn.onclick = (e) => { e.preventDefault(); sendName(); };
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    setup();
} else {
    document.addEventListener("DOMContentLoaded", setup);
}