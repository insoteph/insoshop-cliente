export const permissions = {
  tiendas: {
    ver: "Tiendas.Ver",
    accesoGlobal: "Tiendas.AccesoGlobal",
    editar: "Tiendas.Editar",
  },
  productos: {
    ver: "Productos.Ver",
    crear: "Productos.Crear",
    editar: "Productos.Editar",
    eliminar: "Productos.Eliminar",
  },
  categorias: {
    ver: "Categorias.Ver",
    crear: "Categorias.Crear",
    editar: "Categorias.Editar",
    eliminar: "Categorias.Eliminar",
  },
  ventas: {
    ver: "Ventas.Ver",
  },
  usuarios: {
    ver: "Usuarios.Ver",
    crear: "Usuarios.Crear",
    editar: "Usuarios.Editar",
    cambiarEstado: "Usuarios.CambiarEstado",
  },
  roles: {
    ver: "Roles.Ver",
    crear: "Roles.Crear",
    editar: "Roles.Editar",
    eliminar: "Roles.Eliminar",
    gestionarUsuarios: "Roles.GestionarRolesDeUsuarios",
  },
  permiso: {
    gestionar: "Permiso.Gestionar",
  },
} as const;
