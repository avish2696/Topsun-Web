import React, { useState, useEffect } from 'react';
import { useAuth, Address } from '@/app/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { AddressForm } from '@/app/components/address/AddressForm';
import { Edit, Trash2, Plus, MapPin, Loader, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function AddressBook() {
  const { getAddresses, deleteAddress, setDefaultAddress } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (err: any) {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (address: Address) => {
    try {
      // Call deleteAddress which handles both soft delete and audit logging
      await deleteAddress(address.id);
      
      // Update local state to reflect deletion
      setAddresses(addresses.filter((a) => a.id !== address.id));
      
      toast.success('Address deleted successfully');
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Delete address error:', err);
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id);
      setAddresses(
        addresses.map((a) => ({
          ...a,
          isDefault: a.id === address.id,
        }))
      );
      toast.success('Default address updated');
    } catch (err: any) {
      toast.error('Failed to set default address');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses();
  };

  if (showForm) {
    return <AddressForm address={editingAddress} onClose={handleFormClose} />;
  }

  return (
    <div className="w-full">
      {/* Back Button with Background Text Header */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-br from-green-50/50 to-white mb-8">
        {/* Large background text */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
          <div className="text-[180px] md:text-[280px] font-light leading-none text-green-100/20 -mr-20 md:-mr-40 tracking-tighter">
            ADDRESS
          </div>
        </div>

        {/* Back Button and Title */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
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
            <p className="text-xs tracking-[0.3em] uppercase text-gray-500 font-medium">Delivery & Shipping</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">My Addresses</h2>
          </motion.div>
        </div>
      </div>

      {/* Address Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
        <Button
          onClick={handleAddAddress}
          className="h-10 px-4 bg-blue-400 text-white hover:bg-blue-500"
        >
          <Plus size={16} className="mr-2" />
          Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size={32} className="animate-spin text-blue-400" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No addresses yet. Add one to continue.</p>
          <Button
            onClick={handleAddAddress}
            className="bg-blue-400 text-white hover:bg-blue-500"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{address.fullName}</h3>
                    {address.isDefault && (
                      <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {address.phone}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address)}
                      className="text-xs"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAddress(address)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(address)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-gray-50 p-3 rounded-lg my-4 text-sm">
            <p className="font-medium">{deleteConfirm?.fullName}</p>
            <p className="text-gray-600">{deleteConfirm?.addressLine1}</p>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteAddress(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
