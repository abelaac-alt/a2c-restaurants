# MesaFácil MVP

MVP móvil de carta digital para restaurantes con backoffice y asociación automática de pedidos por mesa.

## Archivos principales

- `index.html?mesa=1`: carta móvil asociada a la mesa 1.
- `admin.html`: backoffice del restaurante.
- `qr-mesa-1.png`: QR de prueba.

## Prueba local

Para que carta y backoffice compartan pedidos, sirve la carpeta con un servidor local:

```bash
python -m http.server 8000
```

Después abre:

- Carta: `http://localhost:8000/index.html?mesa=1`
- Backoffice: `http://localhost:8000/admin.html`

## GitHub Pages

1. Sube todos los archivos a un repositorio.
2. Activa GitHub Pages desde `Settings > Pages`.
3. La URL de cada mesa debe terminar en `?mesa=N`.
4. Ejemplo: `https://usuario.github.io/repositorio/index.html?mesa=1`.
5. Genera el QR definitivo con esa URL pública. El QR incluido usa una URL demostrativa y debe sustituirse cuando conozcas la dirección final del repositorio.

## Limitación del MVP

Los datos se guardan en `localStorage`. Funciona para demostración en un mismo navegador. Para uso real se necesita una base de datos y autenticación para sincronizar pedidos entre los móviles de clientes y el backoffice.
