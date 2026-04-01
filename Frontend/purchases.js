if (document.getElementById('tabela-zakupow-body')) {
    loadPurchases();
}

async function loadPurchases() {
    const tbody = document.getElementById('tabela-zakupow-body');

    try {
        const response = await fetch(PURCHASES_URL);
        
        if (!response.ok) throw new Error("Błąd pobierania zakupów");

        const purchases = await response.json();
        tbody.innerHTML = "";

        if (purchases.length === 0) {
            tbody.innerHTML = "<tr><td colspan='8' class='brak-danych'>Brak zakupów.</td></tr>";
            return;
        }

        purchases.forEach(p => {
            const tr = document.createElement('tr');
            
            const date = new Date(p.date).toLocaleDateString('pl-PL');
            const userLogin = p.user ? p.user.login : "<span class='tekst-czerwony'>Usunięty</span>";
            const productName = p.product ? p.product.name : "<span class='tekst-czerwony'>Usunięty</span>";

            let totalCost = "-";
            if (p.product) {
                const cost = p.product.price * p.quantity;
                totalCost = cost.toFixed(2) + " PLN";
            }

            tr.innerHTML = `
                <td><strong>${userLogin}</strong></td>
                <td>${productName}</td>
                <td>${date}</td>
                <td>${p.quantity}</td>
                <td>${totalCost}</td> <td>${p.status}</td>
                <td>
                    <a href="purchase_view.html?id=${p.id}" class="przycisk">Szczegóły</a>
                    <a href="purchase_edit.html?id=${p.id}" class="przycisk przycisk-edytuj">Edytuj</a>
                    <button class="przycisk przycisk-usun" onclick="deletePurchase(${p.id})">Usuń</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='8' class='blad-tabeli'>Błąd połączenia z API.</td></tr>";
    }
}

const purchaseForm = document.getElementById('add-purchase-form');

if (purchaseForm) {
    loadUsersForSelect();
    loadProductsForSelect();

    purchaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedUserId = document.getElementById('user-select').value;
        const selectedProductId = document.getElementById('product-select').value;
        const quantity = document.getElementById('quantity').value;
        const status = document.getElementById('status').value;

        if (!selectedUserId || !selectedProductId) {
            alert("Musisz wybrać klienta i produkt!");
            return;
        }

        const newPurchase = {
            userId: parseInt(selectedUserId),
            productId: parseInt(selectedProductId),
            quantity: parseInt(quantity),
            status: status
        };

        try {
            const response = await fetch(PURCHASES_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPurchase)
            });

            if (response.ok) {
                alert("Zakup dodany pomyślnie!");
                window.location.href = "purchases_list.html";
            } else {
                alert("Błąd dodawania zakupu: " + response.status);
            }
        } catch (err) {
            console.error(err);
            alert("Błąd połączenia.");
        }
    });
}

async function loadUsersForSelect() {
    const select = document.getElementById('user-select');
    try {
        const response = await fetch(USERS_URL);
        const users = await response.json();

        select.innerHTML = '<option value="">Wybierz Klienta</option>';
        users.forEach(u => {
            const option = document.createElement('option');
            option.value = u.id;
            option.innerText = `${u.login} (${u.email})`;
            select.appendChild(option);
        });
    } catch (err) {
        select.innerHTML = '<option>Błąd ładowania listy!</option>';
    }
}

async function loadProductsForSelect() {
    const select = document.getElementById('product-select');
    try {
        const response = await fetch(PRODUCTS_URL);
        const products = await response.json();

        select.innerHTML = '<option value="">Wybierz Produkt</option>';
        products.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.innerText = `${p.name} - ${p.price} PLN`;
            select.appendChild(option);
        });
    } catch (err) {
        select.innerHTML = '<option>Błąd ładowania listy!</option>';
    }
}

const purchaseViewContainer = document.getElementById('purchase-details-container');

if (purchaseViewContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseId = urlParams.get('id');

    if (!purchaseId) {
        purchaseViewContainer.innerHTML = "<p class='tekst-czerwony'>Błąd: Nie podano ID zakupu.</p>";
    } else {
        loadPurchaseDetails(purchaseId);
    }
}

async function loadPurchaseDetails(id) {
    try {
        const response = await fetch(`${PURCHASES_URL}/${id}`);
        if (!response.ok) throw new Error("Zakup nie istnieje");
        
        const p = await response.json();

        setText('view-purchase-id', p.id);
        
        const userName = p.user ? `${p.user.login} (${p.user.email})` : "Użytkownik usunięty";
        setText('view-purchase-user', userName);

        const productName = p.product ? p.product.name : "Produkt usunięty";
        setText('view-purchase-product', productName);

        const date = new Date(p.date).toLocaleString('pl-PL');
        setText('view-purchase-date', date);

        setText('view-purchase-qty', p.quantity);
        setText('view-purchase-status', p.status);

        let totalCost = "-";
        if (p.product) {
            const cost = p.product.price * p.quantity;
            totalCost = cost.toFixed(2) + " PLN";
        }
        setText('view-purchase-cost', totalCost);

        const btnEdit = document.getElementById('btn-edit-purchase');
        if(btnEdit) btnEdit.href = `purchase_edit.html?id=${p.id}`;

    } catch (err) {
        console.error(err);
        if(purchaseViewContainer) purchaseViewContainer.innerHTML = "<p>Nie udało się pobrać danych zakupu.</p>";
    }
}

const editPurchaseForm = document.getElementById('edit-purchase-form');

if (editPurchaseForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseId = urlParams.get('id');

    if (!purchaseId) {
        alert("Brak ID zakupu.");
        window.location.href = "purchases_list.html";
    } else {
        loadPurchaseForEdit(purchaseId);
    }

    editPurchaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedPurchase = {
            id: parseInt(purchaseId),
            userId: parseInt(document.getElementById('hidden-user-id').value),
            productId: parseInt(document.getElementById('hidden-product-id').value),
            date: document.getElementById('hidden-date').value,
            quantity: parseInt(document.getElementById('ilosc').value),
            status: document.getElementById('status').value
        };

        try {
            const response = await fetch(`${PURCHASES_URL}/${purchaseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPurchase)
            });

            if (response.ok) {
                alert("Zakup zaktualizowany!");
                window.location.href = "purchases_list.html";
            } else {
                alert("Błąd zapisu: " + response.status);
            }
        } catch (err) {
            console.error(err);
            alert("Błąd połączenia.");
        }
    });
}

async function loadPurchaseForEdit(id) {
    try {
        const response = await fetch(`${PURCHASES_URL}/${id}`);
        if (!response.ok) throw new Error("Błąd pobierania");
        
        const p = await response.json();

        document.getElementById('id-display').value = p.id;
        document.getElementById('user-display').value = p.user ? p.user.login : "Usunięty";
        document.getElementById('product-display').value = p.product ? p.product.name : "Usunięty";
        document.getElementById('ilosc').value = p.quantity;
        document.getElementById('status').value = p.status;
        document.getElementById('hidden-user-id').value = p.userId;
        document.getElementById('hidden-product-id').value = p.productId;
        document.getElementById('hidden-date').value = p.date;

    } catch (err) {
        console.error(err);
        alert("Nie udało się pobrać danych zakupu.");
        window.location.href = "purchases_list.html";
    }
}

async function deletePurchase(id) {
    if(!confirm("Czy na pewno chcesz usunąć ten zakup?")) return;
    
    try {
        await fetch(`${PURCHASES_URL}/${id}`, { method: 'DELETE' });
        loadPurchases();
    } catch (e) { 
        console.error(e);
        alert("Błąd usuwania zakupu."); 
    }
}