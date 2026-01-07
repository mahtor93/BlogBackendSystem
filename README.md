# Tabla de Roles y Permisos

Asignar roles                   OWNER / ADMIN
Crear blogs                     OWNER / ADMIN
Crear dominios                  OWNER
Crear posts	                    AUTHOR+
Leer contenido	Público         BLANK
Crear usuarios	                OWNER, ADMIN
Listar usuarios del tenant      OWNER, ADMIN
Editar usuario	                OWNER, ADMIN (o el propio usuario)
Eliminar usuario	            OWNER, ADMIN
Asignar rol	                    OWNER, ADMIN
Usuario creado	Rol inicial =   BLANK

# Creación de dominios

* [POST] /api/v1/tenants/register

PAYLOAD ESPERADO
{
  "tenantName": "Mi Empresa",
  "username": "admin",
  "email": "admin@miempresa.com",
  "password": "********"
}

RESPUESTA:

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

# Login de usuario

* []
