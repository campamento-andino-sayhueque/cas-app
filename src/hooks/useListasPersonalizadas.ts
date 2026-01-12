import { useState, useEffect } from 'react';

export interface ItemPersonalizado {
  id: string;
  nombre: string;
  completado: boolean;
}

export interface ListaPersonalizada {
  id: string;
  nombre: string;
  items: ItemPersonalizado[];
  createdAt: number;
}

const STORAGE_KEY = 'cas_listas_personalizadas';

export function useListasPersonalizadas() {
  const [listas, setListas] = useState<ListaPersonalizada[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar al inicio
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setListas(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error al cargar listas personalizadas:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  // Guardar cambios
  const guardarListas = (nuevasListas: ListaPersonalizada[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasListas));
      setListas(nuevasListas);
    } catch (error) {
      console.error('Error al guardar listas personalizadas:', error);
    }
  };

  const crearLista = (nombre: string) => {
    const nuevaLista: ListaPersonalizada = {
      id: crypto.randomUUID(),
      nombre,
      items: [],
      createdAt: Date.now(),
    };
    guardarListas([...listas, nuevaLista]);
    return nuevaLista;
  };

  const eliminarLista = (id: string) => {
    guardarListas(listas.filter(l => l.id !== id));
  };

  const agregarItem = (listaId: string, nombreItem: string) => {
    const listasActualizadas = listas.map(lista => {
      if (lista.id === listaId) {
        return {
          ...lista,
          items: [
            ...lista.items,
            { id: crypto.randomUUID(), nombre: nombreItem, completado: false }
          ]
        };
      }
      return lista;
    });
    guardarListas(listasActualizadas);
  };

  const toggleItem = (listaId: string, itemId: string) => {
    const listasActualizadas = listas.map(lista => {
      if (lista.id === listaId) {
        return {
          ...lista,
          items: lista.items.map(item => 
            item.id === itemId ? { ...item, completado: !item.completado } : item
          )
        };
      }
      return lista;
    });
    guardarListas(listasActualizadas);
  };

  const eliminarItem = (listaId: string, itemId: string) => {
    const listasActualizadas = listas.map(lista => {
      if (lista.id === listaId) {
        return {
          ...lista,
          items: lista.items.filter(item => item.id !== itemId)
        };
      }
      return lista;
    });
    guardarListas(listasActualizadas);
  };

  return {
    listas,
    cargando,
    crearLista,
    eliminarLista,
    agregarItem,
    toggleItem,
    eliminarItem
  };
}
