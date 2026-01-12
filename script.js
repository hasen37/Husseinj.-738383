// --- EmailJS Configuration ---
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your Public Key
})();

// --- Games Data ---
const gamesList = [
    {
        id: 1, name: "PUBG MOBILE", img: "pubg.jpeg", 
      packs: [{q: "60 UC", p: "1.50$"}, {q: "120 UC", p: "2.50$"}, {q: "180 UC", p: "4.00$"}, {q: "325 UC", p: "5.50$"}, {q: "336 UC", p: "6.50$"}, {q: "660 UC", p: "11.50$"}
      ,] },
    { id: 2, name: "FREE FIRE", img: "free fire.jpeg", 
      packs: [{q: "100 Gems", p: "2.00$"}, {q: "210 Gems", p: "3.50$"}, {q: "310 Gems", p: "5.00$"},{q: "530 Gems", p: "8.00$"},//{q: "1080 Gems", p: "15.00$"},{q: "2200 Gems", p: "31.00$"},{q: "5700 Gems", p: "76 .00$"},
      {q: "تصريح بويا", p: "5.00$"}] },
  
];

// --- DOM Elements ---
const homePage = document.getElementById('homePage');
const detailsPage = document.getElementById('detailsPage');
const orderHistoryPage = document.getElementById('orderHistoryPage');
const gamesGrid = document.getElementById('gamesGrid');
const historyList = document.getElementById('historyList');

// --- Global State ---
let currentOrder = {};
let orders = JSON.parse(localStorage.getItem('pixelprime_orders')) || []; // Load from Local Storage

// --- Initialize Game Cards ---
gamesList.forEach(game => {
    gamesGrid.innerHTML += `
        <div class="game-card" onclick="openDetails(${game.id})">
            <img src="${game.img}" alt="${game.name}">
            <h3>${game.name}</h3>
        </div>
    `;
});

// --- Navigation Functions ---
function showHomePage() {
    homePage.style.display = 'block';
    detailsPage.style.display = 'none';
    orderHistoryPage.style.display = 'none';
    window.scrollTo(0,0);
}

function openDetails(id) {
    const game = gamesList.find(g => g.id === id);
    homePage.style.display = 'none';
    detailsPage.style.display = 'block';
    orderHistoryPage.style.display = 'none';
    
    document.getElementById('detailGameName').innerText = game.name;
    document.getElementById('detailGameImg').src = game.img;
    
    const pkgGrid = document.getElementById('packagesGrid');
    pkgGrid.innerHTML = "";
    game.packs.forEach(pack => {
        pkgGrid.innerHTML += `
            <div class="package-item">
                <div class="details">
                    <div class="quantity">${pack.q}</div>
                    <div class="price">${pack.p}</div>
                </div>
                <button onclick="confirmPurchase('${game.name}', '${pack.q}', '${pack.p}')">اطلب الآن</button>
            </div>
        `;
    });
    window.scrollTo(0,0);
}

function showOrderHistory() {
    homePage.style.display = 'none';
    detailsPage.style.display = 'none';
    orderHistoryPage.style.display = 'block';
    renderOrderHistory();
    window.scrollTo(0,0);
}

// --- Purchase Flow Functions ---
function confirmPurchase(game, qty, price) {
    currentOrder = { game, qty, price };
    document.getElementById('orderSummary').innerText = `${game} - ${qty} بسعر ${price}`;
    document.getElementById('orderModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    // Clear form fields
    document.getElementById('playerId').value = '';
    document.getElementById('playerName').value = '';
    document.getElementById('cardCode').value = '';
    document.getElementById('paymentMethod').value = 'Asiacell';
}

function sendOrder() {
    // 1. جمع البيانات من المدخلات
    const pId = document.getElementById('playerId').value;
    const pName = document.getElementById('playerName').value;
    const pMethod = document.getElementById('paymentMethod').value;
    const pCode = document.getElementById('cardCode').value;

    // 2. التأكد من ملء البيانات الأساسية
    if (!pId || !pCode) {
        alert("يرجى ملء Player ID و Card Code!");
        return;
    }

    // 3. رقم الهاتف الخاص بك (اكتبه بالصيغة الدولية بدون أصفار أو علامة +)
    // مثال للعراق: 9647700000000
    const myPhoneNumber = "9647881566981"; 

    // 4. تنسيق نص الرسالة التي ستصلك
    const message = `*طلب شحن جديد* 🎮%0A` +
                    `--------------------------%0A` +
                    `*اللعبة:* ${currentOrder.game}%0A` +
                    `*الباقة:* ${currentOrder.qty}%0A` +
                    `*السعر:* ${currentOrder.price}%0A` +
                    `*ID اللاعب:* ${pId}%0A` +
                    `*اسم اللاعب:* ${pName || "غير محدد"}%0A` +
                    `*طريقة الدفع:* ${pMethod}%0A` +
                    `*رمز الكارت:* \`${pCode}\` %0A` +
                    `--------------------------`;

    // 5. إنشاء رابط الواتساب وفتحه
    const whatsappUrl = `https://wa.me/${myPhoneNumber}?text=${message}`;
    
    // فتح الرابط في نافذة جديدة
    window.open(whatsappUrl, '_blank');

    // (اختياري) حفظ الطلب في سجل الطلبات بالمتصفح قبل الانتقال
    saveOrderLocally(pId, pMethod); 
    
    closeModal();
}


    const templateParams = {
        game_name: currentOrder.game,
        package: currentOrder.qty,
        price: currentOrder.price,
        player_id: pId,
        player_name: pName || "N/A",
        payment_type: pMethod,
        card_code: pCode
    };

    // Add order to history (Local Storage)
    const newOrder = {
        id: orders.length + 1,
        date: new Date().toLocaleString('ar-EG'),
        game: currentOrder.game,
        package: currentOrder.qty,
        price: currentOrder.price,
        playerId: pId,
        paymentMethod: pMethod,
        status: 'قيد المراجعة' // Initial status
    };
    orders.push(newOrder);
    localStorage.setItem('pixelprime_orders', JSON.stringify(orders)); // Save to Local Storage

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(() => {
            alert("✅ تم إرسال طلبك بنجاح! راجع سجل الطلبات للمتابعة.");
            closeModal();
            renderOrderHistory(); // Update history immediately
        }, (err) => {
            alert("❌ فشل الإرسال، تأكد من إعدادات الموقع أو اتصال الإنترنت.");
            console.error("EmailJS Error:", err);
            // Optionally, update order status to 'Failed' in local storage
            newOrder.status = 'فشل الإرسال';
            localStorage.setItem('pixelprime_orders', JSON.stringify(orders));
            renderOrderHistory();
        });
}

// --- Order History Rendering ---
function renderOrderHistory() {
    historyList.innerHTML = ''; // Clear previous entries
    if (orders.length === 0) {
        historyList.innerHTML = '<p class="no-orders-msg">لم تقم بأي طلبات بعد.</p>';
        return;
    }

    orders.forEach(order => {
        historyList.innerHTML += `
            <div class="order-history-item">
                <div class="order-info">
                    <span><strong>الطلب:</strong> ${order.game} - ${order.package} (${order.price})</span>
                    <span><strong>ID اللاعب:</strong> ${order.playerId}</span>
                    <span><strong>الدفع:</strong> ${order.paymentMethod}</span>
                    <span><strong>التاريخ:</strong> ${order.date}</span>
                </div>
                <div class="order-status pending">${order.status}</div>
            </div>
        `;
    });
}

// Initial render of history when page loads (optional, if you want it visible somewhere else)
// renderOrderHistory();
