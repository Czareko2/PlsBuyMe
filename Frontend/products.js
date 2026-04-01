

// Lista produktów
if (document.getElementById('tabela-produktow-body')) {
    loadProducts();
}

async function loadProducts() {
    const tbody = document.getElementById('tabela-produktow-body');
    try {
        const response = await fetch(PRODUCTS_URL);
        if (!response.ok) throw new Error("Błąd pobierania");
        
        const products = await response.json();
        tbody.innerHTML = ""; 

        if (products.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' class='brak-danych>Brak produktów.</td></tr>";
            return;
        }

        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.price.toFixed(2)} PLN</td>
                <td>${p.size || '-'}</td> 
                <td>${p.color || '-'}</td>
                <td>
                    <a href="product_view.html?id=${p.id}" class="przycisk">Szczegóły</a>
                    <a href="product_edit.html?id=${p.id}" class="przycisk przycisk-edytuj">Edytuj</a>
                    <button class="przycisk przycisk-usun" onclick="deleteProduct(${p.id})">Usuń</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        tbody.innerHTML = "<tr><td colspan='5' class='blad-tabeli'>Błąd połączenia z API.</td></tr>";
        console.error(err);
    }
}

async function deleteProduct(id) {
    if(!confirm("Usunąć produkt?")) return;
    try {
        await fetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' });
        loadProducts();
    } catch (e) { alert("Błąd usuwania"); }
}

const addForm = document.getElementById('add-product-form');

if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors(); 

        const priceInput = document.getElementById('cena').value;
        const finalPrice = priceInput === "" ? 0 : parseFloat(priceInput);

        const newProduct = {
            name: document.getElementById('nazwa').value,
            code: document.getElementById('kod').value,
            price: finalPrice, 
            size: document.getElementById('rozmiar').value,
            color: document.getElementById('kolor').value,
            description: document.getElementById('opis').value
        };

        try {
            const response = await fetch(PRODUCTS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct)
            });

            if (response.ok) {
                alert("Produkt dodany pomyślnie!");
                window.location.href = "products_list.html"; 
            } else if (response.status === 400) {
                const data = await response.json();
                showErrors(data.errors);
            } else {
                alert("Wystąpił inny błąd: " + response.status);
            }
        } catch (error) {
            console.error(error);
            alert("Brak połączenia z serwerem.");
        }
    });
}

const editForm = document.getElementById('edit-product-form');

if (editForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert("Brak ID produktu. Wróć do listy.");
        window.location.href = "products_list.html";
    } else {
        loadProductForEdit(productId);
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const priceInput = document.getElementById('cena').value;
        const finalPrice = priceInput === "" ? 0 : parseFloat(priceInput);

        const updatedProduct = {
            id: parseInt(productId),
            name: document.getElementById('nazwa').value,
            code: document.getElementById('kod').value,
            price: finalPrice,
            size: document.getElementById('rozmiar').value,
            color: document.getElementById('kolor').value,
            description: document.getElementById('opis').value
        };

        try {
            const response = await fetch(`${PRODUCTS_URL}/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct)
            });

            if (response.ok) {
                alert("Zmiany zapisane!");
                window.location.href = "products_list.html";
            } else if (response.status === 400) {
                const data = await response.json();
                showErrors(data.errors);
            } else {
                alert("Błąd zapisu: " + response.status);
            }
        } catch (error) {
            console.error(error);
            alert("Błąd połączenia.");
        }
    });
}

async function loadProductForEdit(id) {
    try {
        const response = await fetch(`${PRODUCTS_URL}/${id}`);
        if (!response.ok) throw new Error("Nie znaleziono produktu");
        
        const p = await response.json();

        document.getElementById('product-id').value = p.id;
        document.getElementById('nazwa').value = p.name;
        document.getElementById('kod').value = p.code || "";
        document.getElementById('cena').value = p.price;
        document.getElementById('rozmiar').value = p.size || "";
        document.getElementById('kolor').value = p.color || "";
        document.getElementById('opis').value = p.description || "";

    } catch (err) {
        console.error(err);
        alert("Nie udało się pobrać danych produktu.");
    }
}

const viewContainer = document.getElementById('details-container');

if (viewContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        viewContainer.innerHTML = "<p>Błąd: Nie podano ID produktu.</p>";
    } else {
        loadProductDetails(productId);
    }
}

async function loadProductDetails(id) {
    try {
        const response = await fetch(`${PRODUCTS_URL}/${id}`);
        if (!response.ok) throw new Error("Produkt nie istnieje");
        
        const p = await response.json();

        setText('view-id', p.id);
        setText('view-name', p.name);
        setText('view-code', p.code || "-");
        setText('view-price', p.price.toFixed(2));
        setText('view-size', p.size || "-");
        setText('view-color', p.color || "-");
        setText('view-desc', p.description || "Brak opisu.");

        const btnEdit = document.getElementById('btn-edit');
        if (btnEdit) btnEdit.href = `product_edit.html?id=${p.id}`;
        
        const btnDelete = document.getElementById('btn-delete');
        if (btnDelete) {
            btnDelete.onclick = async () => {
                 if(confirm("Czy na pewno usunąć ten produkt?")) {
                      await fetch(`${PRODUCTS_URL}/${p.id}`, { method: 'DELETE' });
                      window.location.href = "products_list.html";
                 }
            };
        }

        const historyBody = document.getElementById('product-history-body');
        if (historyBody) {
            historyBody.innerHTML = ""; 
            if (p.purchases && p.purchases.length > 0) {
                p.purchases.forEach(purchase => {
                    const tr = document.createElement('tr');
                    const date = new Date(purchase.date).toLocaleDateString('pl-PL');
                    const userLogin = purchase.user ? purchase.user.login : "Usunięty user";

                    tr.innerHTML = `
                        <td>${date}</td>
                        <td><strong>${userLogin}</strong></td>
                        <td>${purchase.quantity} szt.</td>
                        <td>${purchase.status}</td>
                    `;
                    historyBody.appendChild(tr);
                });
            } else {
                historyBody.innerHTML = "<tr><td colspan='4' class='brak-danych'>Nikt jeszcze nie kupił tego produktu.</td></tr>";
            }
        }

    } catch (err) {
        console.error(err);
        if(typeof viewContainer !== 'undefined') {
             viewContainer.innerHTML = "<p>Nie udało się pobrać danych produktu.</p>";
        }
    }
}