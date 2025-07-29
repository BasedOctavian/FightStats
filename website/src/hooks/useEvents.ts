import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Event, COLLECTIONS } from '../types/firestore';

// Hook to fetch a single event by eventCode
export const useEvent = (eventCode: string | null) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventCode) {
        setEvent(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Query for the event with matching EventCode
        const eventsQuery = query(
          collection(db, COLLECTIONS.EVENTS),
          where('EventCode', '==', eventCode)
        );
        
        const querySnapshot = await getDocs(eventsQuery);
        
        if (!querySnapshot.empty) {
          const eventDoc = querySnapshot.docs[0];
          const eventData = eventDoc.data();
          setEvent({
            ...eventData,
            id: eventDoc.id,
          } as Event);
        } else {
          setEvent(null);
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventCode]);

  return { event, loading, error };
};

// Hook to fetch a single event by document ID
export const useEventById = (id: string | null) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setEvent(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const eventDoc = doc(db, COLLECTIONS.EVENTS, id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          setEvent({
            ...eventData,
            id: eventSnapshot.id,
            // Map the fields to match our Event type
            date: eventData.Date,
            eventCode: eventData.EventCode,
            eventName: eventData.EventName,
            fans: eventData.Fans,
            ppv: eventData.PPV,
            numOfFights: eventData.numOfFights,
          } as Event);
        } else {
          setEvent(null);
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return { event, loading, error };
};

// Hook to fetch multiple events by their event codes
export const useEvents = (eventCodes: string[]) => {
  const [events, setEvents] = useState<Map<string, Event>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!eventCodes.length) {
        setEvents(new Map());
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const eventsMap = new Map<string, Event>();
        
        // Create a query to get all events with matching EventCodes
        const eventsQuery = query(
          collection(db, COLLECTIONS.EVENTS),
          where('EventCode', 'in', eventCodes)
        );

        const querySnapshot = await getDocs(eventsQuery);
        
        // Add debugging log
        console.log('Found events:', querySnapshot.size);
        
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const eventData = doc.data();
          console.log('Event document data:', eventData);
          if (eventData.EventCode) {
            eventsMap.set(eventData.EventCode, {
              ...eventData,
              id: doc.id,
              // Map the fields to match our Event type
              date: eventData.Date,
              eventCode: eventData.EventCode,
              eventName: eventData.EventName,
              fans: eventData.Fans,
              ppv: eventData.PPV,
              numOfFights: eventData.numOfFights,
            } as Event);
          }
        });

        setEvents(eventsMap);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventCodes]);

  return { events, loading, error };
};

// Hook to fetch all events with optional filters
export const useAllEvents = (options?: {
  fans?: 'Yes' | 'No';
  ppv?: 'Yes' | 'No';
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        let eventsQuery = collection(db, COLLECTIONS.EVENTS);
        const constraints = [];

        // Apply filters
        if (options?.fans) {
          constraints.push(where('fans', '==', options.fans));
        }
        if (options?.ppv) {
          constraints.push(where('ppv', '==', options.ppv));
        }

        // Default sort by date descending to get newest events first
        constraints.push(orderBy('date', 'desc'));

        // Execute query
        const querySnapshot = await getDocs(
          constraints.length > 0 ? query(eventsQuery, ...constraints) : eventsQuery
        );

        const eventsData: Event[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          eventsData.push({
            ...data,
            id: doc.id,
          } as Event);
        });

        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [options?.fans, options?.ppv]);

  return { events, loading, error };
}; 