import { useState } from 'react';
import { Button } from './components/ui/button';

export const App = () => {
  return (
    <>
      <div className='flex flex-col gap-5'>
        <Button>BOTON DE PRUEBA</Button>
        <Button variant={'info'}>Prueba 2</Button>
      </div>
    </>
  );
};
