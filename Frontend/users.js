if (document.getElementById('tabela-uzytkownikow-body')) {
    loadUsers();
}

async function loadUsers() {
    const tbody = document.getElementById('tabela-uzytkownikow-body');
    try {
        const response = await fetch(USERS_URL);
        const users = await response.json();
        
        tbody.innerHTML = "";
        
        if (users.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' class='brak-danych'>Brak użytkowników.</td></tr>";
            return;
        }

        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${u.login}</strong></td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>
                    <a href="user_details.html?id=${u.id}" class="przycisk">Szczegóły</a>
                    <a href="user_edit.html?id=${u.id}" class="przycisk przycisk-edytuj">Edytuj</a>
                    <button class="przycisk przycisk-usun" onclick="deleteUser(${u.id})">Usuń</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='5' class='blad-tabeli'; text-align:center'>Błąd API Userów.</td></tr>";
    }
}

async function deleteUser(id) {
    if(!confirm("Usunąć użytkownika?")) return;
    try {
        await fetch(`${USERS_URL}/${id}`, { method: 'DELETE' });
        loadUsers();
    } catch (e) { alert("Błąd usuwania"); }
}

const userViewContainer = document.getElementById('user-details-container');

if (userViewContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        userViewContainer.innerHTML = "<p class='blad-tabeli'>Błąd: Nie podano ID usera.</p>";
    } else {
        loadUserDetails(userId);
    }
}

async function loadUserDetails(id) {
    try {
        const response = await fetch(`${USERS_URL}/${id}`);
        if (!response.ok) throw new Error("Użytkownik nie istnieje");
        
        const u = await response.json();

        setText('view-user-id', u.id);
        setText('view-user-login', u.login);
        setText('view-user-email', u.email);
        setText('view-user-role', u.role);

        const btnEdit = document.getElementById('btn-user-edit');
        if(btnEdit) btnEdit.href = `user_edit.html?id=${u.id}`;

        const historyBody = document.getElementById('user-history-body');
        if (historyBody) {
            historyBody.innerHTML = "";
            if (u.purchases && u.purchases.length > 0) {
                u.purchases.forEach(purchase => {
                    const tr = document.createElement('tr');
                    const date = new Date(purchase.date).toLocaleDateString('pl-PL');
                    const productName = purchase.product ? purchase.product.name : "Produkt usunięty";

                    tr.innerHTML = `
                        <td>${purchase.id}</td>
                        <td>${productName}</td>
                        <td>${date}</td>
                        <td>${purchase.status}</td>
                    `;
                    historyBody.appendChild(tr);
                });
            } else {
                historyBody.innerHTML = "<tr><td colspan='4' class='brak-danych'>Ten użytkownik jeszcze nic nie kupił.</td></tr>";
            }
        }

    } catch (err) {
        console.error(err);
        userViewContainer.innerHTML = "<p>Błąd pobierania danych.</p>";
    }
}

const addUserForm = document.getElementById('add-user-form');

if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const newUser = {
            login: document.getElementById('login').value,
            email: document.getElementById('email').value,
            password: document.getElementById('haslo').value,
            role: document.getElementById('rola').value
        };

        try {
            const response = await fetch(USERS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                alert("Użytkownik dodany!");
                window.location.href = "users_list.html";
            } else if (response.status === 400) {
                const data = await response.json();
                showErrors(data.errors);
            } else {
                alert("Błąd: " + response.status);
            }
        } catch (err) {
            console.error(err);
            alert("Błąd połączenia.");
        }
    });
}

const editUserForm = document.getElementById('edit-user-form');

if (editUserForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        alert("Brak ID. Wracam na listę.");
        window.location.href = "users_list.html";
    } else {
        loadUserForEdit(userId);
    }

    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const updatedUser = {
            id: parseInt(userId),
            login: document.getElementById('login').value,
            email: document.getElementById('email').value,
            password: document.getElementById('haslo').value, 
            role: document.getElementById('rola').value
        };

        try {
            const response = await fetch(`${USERS_URL}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser)
            });

            if (response.ok) {
                alert("Zapisano zmiany!");
                window.location.href = "users_list.html";
            } else if (response.status === 400) {
                const data = await response.json();
                showErrors(data.errors);
            } else {
                alert("Błąd: " + response.status);
            }
        } catch (err) {
            console.error(err);
            alert("Błąd połączenia.");
        }
    });
}

async function loadUserForEdit(id) {
    try {
        const response = await fetch(`${USERS_URL}/${id}`);
        if (!response.ok) throw new Error("Błąd pobierania");
        
        const u = await response.json();

        document.getElementById('user-id-hidden').value = u.id;
        document.getElementById('id-display').value = u.id;
        document.getElementById('login').value = u.login;
        document.getElementById('email').value = u.email;
        document.getElementById('rola').value = u.role;
        document.getElementById('haslo').value = u.password; 

    } catch (err) {
        console.error(err);
        alert("Nie udało się pobrać danych użytkownika.");
        window.location.href = "users_list.html";
    }
}