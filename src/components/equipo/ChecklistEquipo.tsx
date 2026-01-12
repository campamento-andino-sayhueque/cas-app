import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ChecklistOficial } from './ChecklistOficial';
import { MisListas } from './MisListas';

/**
 * Componente principal del equipo que permite alternar entre
 * la lista oficial y las listas personalizadas del usuario.
 */
export function ChecklistEquipo() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="oficial" className="w-full">
        <div className="flex items-center justify-center sm:justify-start mb-6">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="oficial">Lista Oficial</TabsTrigger>
            <TabsTrigger value="mis-listas">Mis Listas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="oficial" className="mt-0">
          <ChecklistOficial />
        </TabsContent>

        <TabsContent value="mis-listas" className="mt-0">
          <MisListas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
