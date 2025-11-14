const connectButton = document.getElementById("connectButton");
const walletAddress = document.getElementById("walletAddress");
const balance = document.getElementById("balance");

connectButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            // Gửi yêu cầu kết nối MetaMask
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const account = accounts[0];
            walletAddress.textContent = "Ví của bạn: " + account;
            balance.textContent = "Đang tải số dư...";

            // Lấy số dư tài khoản
            const weiBalance = await window.ethereum.request({
                method: "eth_getBalance",
                params: [account, "latest"]
            });
            const etherBalance = parseFloat(weiBalance) / 10 ** 18;
            balance.textContent = "Số dư: " + etherBalance + " ETH";


            console.log("Đã kết nối với:", account);
        } catch (err) {
            console.error("Người dùng từ chối:", err);
        }
    } else {
        alert("Hãy cài đặt MetaMask trước!");
    }
});

const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');


fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        fileInfo.textContent = `Tên tệp: ${file.name}, Kích thước: ${file.size} bytes, Loại: ${file.type}`;
    }
});

const hashButton = document.getElementById('hashButton');
const hashResult = document.getElementById('hashResult');

hashButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        hashResult.textContent = `Hash: ${hashHex}`;
    } else {
        alert('select file first');
    }
});