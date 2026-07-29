# MesaFácil MVP

MVP de carta digital para restaurantes preparado para GitHub Pages.

## Incluye

- Carta responsive para clientes.
- Categorías, búsqueda y filtros alimentarios.
- Ficha de producto y venta adicional.
- Carrito y envío de pedidos por mesa.
- Panel del restaurante.
- Cambio del estado de los pedidos.
- Edición rápida de precios y disponibilidad.
- Estadísticas básicas.
- Persistencia local mediante localStorage.
- PWA básica.

## Uso local

Abre `index.html` para la carta del cliente y `admin.html` para el panel del restaurante.

Para evitar limitaciones del navegador, se recomienda ejecutar un servidor local:

```bash
python -m http.server 8000
```

Después abre:

- `http://localhost:8000/index.html`
- `http://localhost:8000/admin.html`

## Publicar en GitHub Pages

1. Crea un repositorio nuevo.
2. Sube todos los archivos de esta carpeta.
3. En GitHub, entra en **Settings → Pages**.
4. Selecciona la rama principal y la carpeta raíz.
5. Guarda y abre la URL generada por GitHub Pages.

## Importante

Este MVP utiliza almacenamiento local del navegador. Para una versión comercial habría que añadir base de datos, usuarios, autenticación, pagos e integración con TPV.
