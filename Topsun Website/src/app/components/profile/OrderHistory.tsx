import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useShopping } from '@/app/context/ShoppingContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ShoppingBag, Package, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function OrderHistory() {
  const { user } = useAuth();
  const { orders } = useShopping();
  const navigate = useNavigate();

  // Filter orders by current user
  const userOrders = user ? orders.filter((order) => order.userId === user.id) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="w-full">
      {/* Back Button with Background Text Header */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-br from-amber-50/50 to-white mb-8">
        {/* Large background text */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
          <div className="text-[180px] md:text-[280px] font-light leading-none text-amber-100/20 -mr-20 md:-mr-40 tracking-tighter">
            ORDERS
          </div>
        </div>

        {/* Back Button and Title */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl group mb-6"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
          </motion.button>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gray-500 font-medium">My Account</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Order History</h2>
          </motion.div>
        </div>
      </div>

      {/* Order Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

      {userOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No orders yet. Start shopping!</p>
          <Link to="/shop">
            <Button className="bg-blue-400 text-white hover:bg-blue-500">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <div
              key={order.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={18} />
                    Order #{order.id.substring(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge className={getStatusColor(order.orderStatus)}>
                  {getStatusLabel(order.orderStatus)}
                </Badge>
              </div>

              {/* Order Items Summary */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{order.items.length}</strong> item{order.items.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  {order.items.slice(0, 2).map((item) => (
                    <p key={`${item.id}-${item.size}`}>
                      • {item.name} (Size {item.size}) × {item.quantity}
                    </p>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-gray-500 italic">+ {order.items.length - 2} more items</p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 text-sm">
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <p className="font-medium text-gray-900 mb-2">Shipping To:</p>
                  <p className="text-gray-700">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
              )}

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
                  <p className="font-medium text-gray-900 mb-1">Tracking Number</p>
                  <p className="font-mono text-blue-600">{order.trackingNumber}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link to={`/order-confirmation/${order.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                {order.orderStatus === 'shipped' && (
                  <Button variant="outline" className="flex-1">
                    Track Package
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
