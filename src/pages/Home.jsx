import { MainLayout } from '../layouts/MainLayout';
import { Inbox, CreditCard, Ticket, BanknoteArrowUp } from 'lucide-react';
import { ItemVariant } from '@/components/Dashboard/StatusCard';
export const Home = () => {
  const salesInfo = [
    { title: 'Solicitudes Pendientes', number: 2, icon: <Inbox /> },
    { title: 'Pagos Por Verificar', number: 4, icon: <CreditCard /> },
    { title: 'Boletas Hoy', number: 1, icon: <Ticket /> },
    { title: 'Ingresos Hoy', number: 10, icon: <BanknoteArrowUp /> },
  ];
  return (
    <MainLayout>
      <div>
        <h1>Dashboard</h1>
        <p>Estado general del estado de ventas</p>
      </div>

      {salesInfo.map((item, index) => {
        <ItemVariant key={index} title={item.title} number={item.number} icon={item.icon}></ItemVariant>
      })}

    </MainLayout>
  );
};
