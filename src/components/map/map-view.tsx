'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
} from '@vis.gl/react-google-maps';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { LoaderCircle, Sparkles, Users } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

import {
  smartLocationSharingReminder,
} from '@/ai/flows/smart-location-sharing-reminder';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import type { Group, TrakdUser } from '@/lib/types';
import { getHaversineDistance } from '@/lib/utils';
import { MemberMarker } from './member-marker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function MapView() {
  const { user, trakdUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<TrakdUser[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const { toast } = useToast();

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReminder, setAiReminder] = useState<string | null>(null);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId]
  );
  
  const mapCenter = useMemo(() => {
    if (trakdUser?.location) {
        return { lat: trakdUser.location.latitude, lng: trakdUser.location.longitude };
    }
    // Default to San Francisco if no user location is available
    return { lat: 37.7749, lng: -122.4194 }; 
  }, [trakdUser]);

  // Fetch user's groups
  useEffect(() => {
    if (!trakdUser?.uid) {
        setIsGroupsLoading(false);
        return;
    };

    setIsGroupsLoading(true);
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', trakdUser.uid)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userGroups = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Group)
      );
      setGroups(userGroups);
      if (userGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(userGroups[0].id);
      } else if (userGroups.length === 0) {
        setSelectedGroupId(null);
      }
      setIsGroupsLoading(false);
    }, (error) => {
        console.error("Error fetching groups: ", error);
        setIsGroupsLoading(false);
    });
    return () => unsubscribe();
  }, [trakdUser?.uid, selectedGroupId]);

  // Fetch members of selected group or just the user
  useEffect(() => {
    if (!trakdUser) {
        setMembers([]);
        return;
    }

    if (!selectedGroupId) {
      setMembers([trakdUser]);
      return;
    };

    const group = groups.find(g => g.id === selectedGroupId);
    if (!group || group.members.length === 0) {
        setMembers([trakdUser]);
        return;
    }

    const q = query(
      collection(db, 'users'),
      where('__name__', 'in', group.members)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupMembers = snapshot.docs.map(
        (doc) => doc.data() as TrakdUser
      );
      setMembers(groupMembers);
    }, (error) => {
        console.error("Error fetching group members:", error);
        setMembers([trakdUser]); // Fallback to just showing the current user
    });

    return () => unsubscribe();
  }, [selectedGroupId, groups, trakdUser]);

  // Update user location and battery
  useEffect(() => {
    if (!trakdUser?.uid) return;
    const userDocRef = doc(db, 'users', trakdUser.uid);

    const updateLocation = (position: GeolocationPosition) => {
      updateDoc(userDocRef, {
        'location.latitude': position.coords.latitude,
        'location.longitude': position.coords.longitude,
        'location.timestamp': serverTimestamp(),
        lastSeen: serverTimestamp(),
      });
    };

    const handleError = (error: GeolocationPositionError) => {
        console.warn(`ERROR(${error.code}): ${error.message}`);
    }

    const watchId = navigator.geolocation.watchPosition(updateLocation, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
    
    const updateBattery = (battery: any) => {
        updateDoc(userDocRef, {
            'battery.level': battery.level,
            'battery.charging': battery.charging,
        });
    }

    let batteryInterval: NodeJS.Timeout;

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        updateBattery(battery);
        batteryInterval = setInterval(() => updateBattery(battery), 60000);
      });
    }

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (batteryInterval) clearInterval(batteryInterval);
    };
  }, [trakdUser?.uid]);

  const handleSmartReminder = async () => {
    if (!selectedGroup || members.length < 2) {
      toast({
        description: 'Not enough members in the group to use this feature.',
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const membersWithLocation = members.filter(m => m.location);
      if (membersWithLocation.length < 2) {
         setAiReminder('Not enough members are sharing their location to determine if they are together.');
         return;
      }

      let togetherCount = 0;
      for (let i = 0; i < membersWithLocation.length; i++) {
        for (let j = i + 1; j < membersWithLocation.length; j++) {
          const dist = getHaversineDistance(
            membersWithLocation[i].location!.latitude,
            membersWithLocation[i].location!.longitude,
            membersWithLocation[j].location!.latitude,
            membersWithLocation[j].location!.longitude
          );
          if (dist < 500) { // within 500 meters
            togetherCount++;
          }
        }
      }

      const areMembersTogether = togetherCount > (membersWithLocation.length / 2);

      const result = await smartLocationSharingReminder({
        groupName: selectedGroup.name,
        memberNames: members.map(m => m.displayName || 'A member'),
        areMembersTogether,
      });
      
      setAiReminder(result.reminderMessage);

    } catch (error) {
      console.error('AI reminder failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Assistant Error',
        description: 'Could not generate a reminder. Please try again.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };


  if (!user || !trakdUser) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={mapCenter}
          center={mapCenter}
          defaultZoom={13}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={MAP_ID}
        >
          {members
            .filter((member) => member.location)
            .map((member) => (
              <AdvancedMarker
                key={member.uid}
                position={{
                  lat: member.location!.latitude,
                  lng: member.location!.longitude,
                }}
              >
                <MemberMarker member={member} isCurrentUser={member.uid === trakdUser?.uid}/>
              </AdvancedMarker>
            ))}
        </Map>
      </APIProvider>
      <div className="absolute top-4 left-4 flex gap-4">
        {!isGroupsLoading && groups.length > 0 && (
            <Select
            value={selectedGroupId || ''}
            onValueChange={(val) => setSelectedGroupId(val)}
            >
            <SelectTrigger className="w-[200px] bg-background/80 backdrop-blur-sm shadow-lg">
                <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
                {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                    {group.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        )}
        {selectedGroupId && (
            <Button onClick={handleSmartReminder} disabled={isAiLoading} variant="outline" className="bg-background/80 backdrop-blur-sm shadow-lg">
            {isAiLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
            )}
            Smart Reminder
            </Button>
        )}
      </div>

      {!isGroupsLoading && groups.length === 0 && (
        <div className="absolute top-4 left-4 right-4">
            <div className="bg-background/80 backdrop-blur-sm shadow-lg rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h2 className="text-lg font-semibold">No Groups Yet</h2>
                <p className="text-muted-foreground text-sm">
                Create or join a group to see others on the map.
                </p>
            </div>
        </div>
      )}

      <AlertDialog open={!!aiReminder} onOpenChange={(open) => !open && setAiReminder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Sparkles className="text-primary w-5 h-5"/> AI Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              {aiReminder}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAiReminder(null)}>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
