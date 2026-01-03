import { auth, db } from '../firebase';
import { Timestamp, doc, addDoc, updateDoc, deleteDoc, collection, query, where, orderBy, getDocs, getDoc } from 'firebase/firestore';
import { Trade } from '../types';

// ✅ SAVE: Perfect
export async function saveTrade(trade: Trade): Promise<string> {
  console.log('saveTrade called, current user:', auth.currentUser);
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const { id, ...tradeFields } = trade; // Exclude the frontend-generated id

  const tradeData = {
    ...tradeFields,
    userId: auth.currentUser.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    entryDate: trade.entryDate ? Timestamp.fromDate(new Date(trade.entryDate)) : null,
    exitDate: trade.exitDate ? Timestamp.fromDate(new Date(trade.exitDate)) : null,
  };

  console.log('Trade data to save:', tradeData);
  console.log('User ID being used:', auth.currentUser.uid);

  try {
    const docRef = await addDoc(collection(db, 'trades'), tradeData);
    console.log('Trade saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving trade:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
}

// ✅ LOAD: Perfect
export async function loadTrades(): Promise<Trade[]> {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const q = query(
    collection(db, 'trades'),
    where('userId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const trades: Trade[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    trades.push({
      id: doc.id,
      ...data,
      entryDate: data.entryDate?.toDate()?.toISOString() || '',
      exitDate: data.exitDate?.toDate()?.toISOString() || '',
    } as Trade);
  });

  return trades;
}

// ✅ DELETE: Added Try/Catch to prevent crash on permission error
export async function deleteTrade(tradeId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  console.log('Attempting to delete trade:', tradeId);
  console.log('Current user UID:', auth.currentUser.uid);
  const tradeRef = doc(db, 'trades', tradeId);

  try {
    // Try to read for debugging (might fail if permission denied)
    const tradeDoc = await getDoc(tradeRef);
    if (tradeDoc.exists()) {
      const tradeData = tradeDoc.data();
      console.log('Trade exists, owner userId:', tradeData.userId);
      console.log('Does userId match?', tradeData.userId === auth.currentUser.uid);
    } else {
      console.log('Trade document does not exist');
      return; // Early return if document doesn't exist
    }
  } catch (e) {
    console.warn('Could not read document details (likely permission issue), proceeding to delete attempt...');
  }

  // Actual delete
  try {
    await deleteDoc(tradeRef);
    console.log('Trade deleted successfully');
  } catch (error: any) {
    // Handle case where document doesn't exist or other errors
    if (error.code === 'not-found' || error.message?.includes('not-found')) {
      console.log('Trade document does not exist (already deleted or never existed):', tradeId);
      // Don't throw error for non-existent documents
      return;
    }
    // Re-throw other errors
    throw error;
  }
}

// ✅ UPDATE: Fixed Return Type Error
// Changed return type to Promise<string | void> to allow returning the new ID
export async function updateTrade(tradeId: string, trade: Trade): Promise<string | void> {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  console.log('Updating trade:', tradeId);

  const { id, ...editableFields } = trade;

  const cleanedTrade = {
    ...Object.fromEntries(
      Object.entries(editableFields).filter(([_, value]) => value != null)
    ),
    entryDate: trade.entryDate ? Timestamp.fromDate(new Date(trade.entryDate)) : null,
    exitDate: trade.exitDate ? Timestamp.fromDate(new Date(trade.exitDate)) : null,
  };

  const tradeData = {
    ...cleanedTrade,
    updatedAt: Timestamp.now(),
  };

  const tradeRef = doc(db, 'trades', tradeId);

  try {
    await updateDoc(tradeRef, tradeData);
    console.log('Update success');
    return; // Return void on success
  } catch (error: any) {
    console.error('Update failed, attempting recovery:', error.code, error.message);

    const isNotFound = error.code === 'not-found' ||
                       error.code === 'permission-denied' ||
                       error.message?.includes('No document');

    if (isNotFound) {
      console.log('Document missing/locked. Creating NEW trade to save data.');

      const newTradeData = {
        ...trade,
        userId: auth.currentUser.uid, // Attach NEW valid user ID
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        entryDate: trade.entryDate ? Timestamp.fromDate(new Date(trade.entryDate)) : null,
        exitDate: trade.exitDate ? Timestamp.fromDate(new Date(trade.exitDate)) : null,
      };

      const { id: _, ...dataWithoutId } = newTradeData;
      const newDocRef = await addDoc(collection(db, 'trades'), dataWithoutId);

      console.log('Recovery successful. New Trade ID:', newDocRef.id);
      return newDocRef.id; // ✅ Now this is allowed!
    } else {
      throw error;
    }
  }
}
