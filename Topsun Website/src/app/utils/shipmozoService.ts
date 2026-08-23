// src/app/utils/shipmozoService.ts

import { supabase } from '@/supabase'
import { shortenOrderIdForShipmozo, logOrderIdValidation } from './orderIdGenerator';

/**
 * Get Shipmozo warehouses via Edge Function
 */
export const getShipmozoWarehouseId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('shipmozo-integration', {
      body: {
        action: 'get-warehouses'
      }
    })

    if (error || !data?.success) {
      console.warn('⚠️ Warehouse fetch failed, using fallback ID: 131950')
      return '131950' // TOPSUN Main Store
    }

    if (data.data?.data && data.data.data.length > 0) {
      const warehouse = data.data.data[0]
      console.log('✅ Warehouse ID from API:', warehouse.id, '- Name:', warehouse.name)
      return String(warehouse.id)
    }

    return '131950' // Fallback

  } catch (err) {
    console.error('❌ Error fetching warehouse:', err)
    return '131950' // Fallback
  }
};

/**
 * Push order to Shipmozo via Supabase Edge Function
 * NOW: Returns proper success/failure based on Shipmozo sync
 */
export const pushOrderToShipmozo = async (orderData: any) => {
  console.log('📤 Calling Shipmozo Edge Function...', {
    order_number: orderData.order_number,
    customer: orderData.shipping_address?.fullName
  })

  try {
    const { data, error } = await supabase.functions.invoke('shipmozo-integration', {
      body: {
        action: 'push-order',
        orderData: orderData
      }
    })

    if (error) {
      console.error('❌ Edge function error:', error)
      return {
        success: false,
        shipmozo_synced: false,
        message: error.message || 'Edge function failed'
      }
    }

    console.log('✅ Edge function response:', data)
    
    // Check if Shipmozo actually synced
    if (data?.shipmozo_synced) {
      console.log('✅✅✅ ORDER SUCCESSFULLY SYNCED TO SHIPMOZO! ✅✅✅')
      return {
        success: true,
        shipmozo_synced: true,
        message: data.message || 'Order synced to Shipmozo successfully',
        data: data
      }
    } else {
      console.error('❌ Shipmozo sync failed:', data?.message)
      return {
        success: false,
        shipmozo_synced: false,
        message: data?.message || 'Shipmozo sync failed',
        warning: data?.warning,
        data: data
      }
    }

  } catch (err: any) {
    console.error('❌ Exception calling Edge function:', err)
    return {
      success: false,
      shipmozo_synced: false,
      message: err.message || 'Unknown error'
    }
  }
}

/**
 * Test Shipmozo connectivity via Edge Function
 */
export const testShipmozoConnection = async () => {
  try {
    const result = await getShipmozoWarehouseId()
    return {
      success: !!result,
      data: { warehouse_id: result },
      message: result ? 'Connection successful' : 'Connection failed'
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message
    }
  }
}

/**
 * Manually trigger order push (for retrying failed orders)
 */
export const retryPushOrderToShipmozo = async (orderId: string) => {
  console.log('🔄 Retrying Shipmozo push for order:', orderId);
  
  try {
    // In a real implementation, you'd fetch the order from your DB
    // For now, this is a template for how to retry
    console.log('To implement retry: Fetch order from DB, then call pushOrderToShipmozo');
    return { success: false, message: "Retry not implemented yet" };
  } catch (err) {
    console.error('Error retrying Shipmozo push:', err);
    return { success: false, message: String(err) };
  }
};
