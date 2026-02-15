import { useState } from 'react';

const Lista = ({ titulo, visto }) => {
  return (
    <li>
      {titulo} {visto ? '✅' : '❌'}
    </li>
  );
};

export const App = () => {
  let listadoSecciones = [
    { titulo: 'Hola papi', visto: false },
    { titulo: 'Custom Hooks', visto: true },
    { titulo: 'Hola papi', visto: false },
    { titulo: 'Hola papi', visto: true },
    { titulo: 'Hola papi', visto: false },
    { titulo: 'Hola papi', visto: true },
    { titulo: 'Hola papi', visto: false },
    { titulo: 'Hola papi', visto: false },
  ];
  const [arreglo, setArreglo] = useState(listadoSecciones);
  return (
    <>
      <ol>
        {arreglo.map((seccion, index) => {
          return (
            <Lista
              key={index}
              titulo={seccion.titulo}
              visto={seccion.visto}
            ></Lista>
          );
        })}
      </ol>
    </>
  );
};
