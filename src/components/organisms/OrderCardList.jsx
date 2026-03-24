/**
 * OrderCardList.jsx — Organism
 * BeautyHome / KORA · NODO Studio
 *
 * Grilla o listado de órdenes previas de un usuario para su perfil.
 */

import React from 'react';
import { Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'delivered': return <CheckCircle2 size={16} className="text-green-600" />;
    case 'transit': return <Truck size={16} className="text-blue-600" />;
    case 'processing': return <Clock size={16} className="text-yellow-600" />;
    case 'cancelled': return <XCircle size={16} className="text-red-600" />;
    default: return null;
  }
};

const StatusText = ({ status }) => {
  switch (status) {
    case 'delivered': return 'Entregado';
    case 'transit': return 'En camino';
    case 'processing': return 'Preparando';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

export function OrderCardList({ orders = [], className = '' }) {
  if (!orders || orders.length === 0) {
    return (
      <div className={`p-8 rounded-f2-md bg-sand-100 text-center border-dashed border-2 border-sand-200 ${className}`}>
        <p className="font-sans text-[15px] font-medium text-petrol mb-2">Aún no hay pedidos registrados</p>
        <p className="font-sans text-[13px] text-sand-500">Tus compras de KORA aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {orders.map((order) => (
        <div 
          key={order.id} 
          className="p-5 md:p-6 rounded-f2-md border border-sand-200 bg-white hover:border-petrol transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-sans text-[14px] font-bold text-petrol">Pedido #{order.id}</span>
              <span className="px-2 py-0.5 rounded-sm bg-sand-100 font-sans text-[11px] text-sand-500 font-medium">
                {order.date}
              </span>
            </div>
            <p className="font-sans text-[13px] text-sand-900/70 mb-1">
              {order.itemCount} {order.itemCount === 1 ? 'artículo' : 'artículos'}
            </p>
            <p className="font-sans text-[15px] font-semibold text-petrol">
              {formatPrice(order.total)}
            </p>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-2 bg-sand-50/50 px-3 py-1.5 rounded-full border border-sand-200">
              <StatusIcon status={order.status} />
              <span className="font-sans text-[13px] font-medium text-sand-900">
                <StatusText status={order.status} />
              </span>
            </div>
            
            <button className="font-sans text-[12px] font-bold tracking-widest uppercase text-watermelon hover:text-watermelon-hover underline underline-offset-4 transition-colors">
              Ver Detalle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
