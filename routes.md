POST   /api/notebooks              → create new notebook
GET    /api/notebooks              → list user's notebooks
GET    /api/notebooks/:id          → load one notebook + its cells
PATCH  /api/notebooks/:id          → rename notebook
DELETE /api/notebooks/:id          → delete notebook

POST   /api/notebooks/:id/cells    → create cell
PATCH  /api/cells/:id              → update cell content/position
DELETE /api/cells/:id              → delete cell