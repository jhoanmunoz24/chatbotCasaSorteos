
export const Saludo= ({nombre,edad = 18}) => {
  return (
    <div>Hola {nombre} Bienvenido a React
    
      <p>Mi edad es {edad}</p>
    </div>
  )
}
