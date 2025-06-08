Here you go broo — a **single, complete `project-context.md` file** containing all the necessary details for Zencoder AI (or any LLM) to understand and follow your project structure, stack, and rules without confusion:

---

```markdown
# 🧠 Project Context: City Mart (Full Stack App)

## 🔧 Tech Stack

- **Frontend (Web)**: React.js ✅ (Completed)
- **Mobile App**: React Native (In Progress)  
- **Backend**: Flask (Python)  
- **Database**: MySQL (local setup, production-like data)  
- **Authentication**: JWT Bearer Token  
- **State Storage (Mobile)**: AsyncStorage  
- **API Client**: Axios (configured with interceptors in `App.js`)  
- **Deployment**: ❌ Not yet (running locally)  

---

## 📂 Folder Structure


project-root/
├── backend/
│   ├── app.py                # Main Flask backend (1,290+ lines)
│   ├── requirements.txt      # Flask + MySQL dependencies
│   ├── add\_cart\_table.py     # Migration for cart features
│   ├── update\_db.py          # DB schema tweaks
│   ├── migrate\_db.py         # DB helper scripts
│   ├── update\_schema.py      # Product schema updates
│
├── frontend/                 # React web app (✅ Completed)
│   └── ...
│
├── mobile/                   # React Native app (📱 In Progress)
│   ├── App.js                # Axios client + JWT interceptor
│   ├── api.js                # Exports all structured API calls
│   ├── screens/
│   ├── components/
│   └── ...

````

---

## 📚 API Guidelines (Flask)

- **Base URL**: `http://localhost:5000/api`  
- **Authentication**: JWT required for protected routes  
- **Headers**:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
````

* **Available Modules**:

  * `/auth` – login, register, get profile, update profile
  * `/products` – list, detail, by category
  * `/categories` – fetch all
  * `/cart` – add, update, delete, list
  * `/orders` – create, view, cancel
  * `/addresses` – manage shipping addresses

**Note**: You must use **live backend data**, no mock APIs allowed.

---

## 📱 Mobile App Integration Rules

* **Use Axios instance from `App.js`** – already includes JWT in headers.
* Tokens are stored using `AsyncStorage` (see `App.js` interceptor).
* **Do not use mock data** for cart, orders, products, or profile.
* **All API calls must be real** — no dummy fetch or hardcoded responses.
* Handle errors (401, 404, 500) using the `apiClient.interceptors.response`.

### Sample API Call

```js
api.auth.login(email, password) // POST /api/auth/login
api.products.getAll()           // GET /api/products
api.cart.addItem(productId, qty) // POST /api/cart
```

### Sample Auth Interceptor in App.js

```js
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🌐 Flask CORS Setup (For React Native access)

Update your `app.py` like this:

```python
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Replace '*' with specific origin for production
```

---

## 📦 Axios Config Summary (in `mobile/App.js`)

* **Base URL**: `http://localhost:5000/api`
* **JWT**: Auto-attached in headers
* **Timeout**: 15s
* **Error Interception**:

  * 401 → Clear AsyncStorage + redirect to login
  * 403, 404 → Show messages
  * 500 → Show "server error"
* **API Available Methods**:

  * `api.auth.login`, `api.auth.signup`, `api.auth.profile`
  * `api.products.getAll`, `api.products.getById`
  * `api.cart.addItem`, `api.cart.removeItem`, etc.

---

## ✅ Status Table

| Module              | Status          |
| ------------------- | --------------- |
| Flask Backend       | ✅ Completed     |
| MySQL Schema        | ✅ Done (Local)  |
| React Web Frontend  | ✅ Completed     |
| React Native App    | 🚧 In Progress  |
| API Coverage        | \~90% Available |
| Deployment (Server) | ❌ Not Yet       |
| Mobile Auth         | ✅ Done          |

---

## 🧪 Example Working Request

### POST /api/auth/login

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response**:

```json
{
  "access_token": "eyJhbGci...",
  "role": "customer",
  "city": "Mumbai",
  "user_id": 1
}
```

---

## 📏 Rules for Zencoder AI or Any AI Assistant

1. **Always refer to this file before generating any code.**
2. Use actual Flask APIs (`/api/...`), not mock endpoints.
3. Never break existing `App.js` axios + JWT config.
4. Do not suggest “dummy” placeholder data unless asked.
5. Match endpoint payloads and response format exactly.
6. Don’t suggest deploying unless explicitly requested.
7. Help only with production-level code using the current structure.

---

## 🎯 Final Goal

Build a robust **React Native mobile app** connected to the Flask backend using Axios. Implement cart, orders, products, auth, and profile features using real API calls and structured responses.

No mock data, no Firebase, no GraphQL — stick to Flask + MySQL REST API.




