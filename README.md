# Sobre las jerarquías del sistema
El sistema está basado en una serie de instancias anidadas una dentro de la otra de manera jerarquica.
El siguiente es una lista en orden desde el conjunto global hasta lo más particular.
### Tenant
* Un tenant es la instancia principal
  - Un tenant siempre tendrá un usuario por defecto.
  - El usuario por defecto será creado al momento de crear el tenant.
  - El usuario por defecto tendrá asignado el rol OWNER (Administrador)
  - Cualquier usuario creado por el Administrador pertenece al tenant.

### Dominio
* Un dominio es una instancia particular dentro de tenant, pudiendo un tenant tener uno o muchos dominios
  - Un dominio es el nombre público con el que se puede acceder al sitio del usuario
  - Un dominio puede albergar un blog, donde los usuarios del tenant pueden manipular posts.
  - Un dominio puede albergar un sitio estático, que puede ser editado.
 
### Blog
* Un blog es un sitio en el que los usuarios pueden crear posts y manipularlos
 
### Post
* Un post es la estructura más pequeña del sistema
  - Un post admite medios como imagenes y videos
  - Un post admite modificaciones de su propio autor u otros usuarios con autorización suficiente

# Tabla de Roles y Permisos

Los roles permiten restringir las acciones de los usuarios de un tenant.
Usuario creado con el rol inicial BLANK, exceptuando el creador del tenant, que tiene el rol inicial OWNER

| Roles    | Permisos |
| -------- | ------- |
| OWNER | Crear Dominios |
| OWNER, ADMIN | Crear usuarios |
| OWNER, ADMIN | Asignar roles |
| OWNER, ADMIN | Listar usuarios |
| OWNER, ADMIN (o el propio usuario) | Editar usuario |
| OWNER, ADMIN | Eliminar otros usuarios |
| OWNER / ADMIN | Crear blogs |
| AUTHOR | Crear posts |             
          
# Creación de Tenants

* [POST] /api/v1/tenants/register

PAYLOAD ESPERADO
```
{
  "tenantName": "string",
  "username": "string",
  "email": "admin@miempresa.com",
  "password": "********"
}
```
RESPUESTA:
```
{
    "message":"msg",
    "token":"tkn",
    "tenant":{
        "id":"id",
        "name":"name"
    },
    "blog":{
        "id":"id",
        "slug":"main"
    },
    "domain":"domain"
}
```
# Login de usuario

* []
