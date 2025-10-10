'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
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
import { LoaderCircle, Sparkles, Users, MapPinOff, MapPin } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

function MapContainer() {
  const map = useMap();
  const { trakdUser, loading } = useAuth();
  const [locationPermission, setLocationPermission] =
    useState<PermissionState>('prompt');

  useEffect(() => {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permissionStatus) => {
        setLocationPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state);
        };
      });
  }, []);

  useEffect(() => {
    if (map && trakdUser?.location && locationPermission === 'granted') {
      map.moveCamera({
        center: {
          lat: trakdUser.location.latitude,
          lng: trakdUser.location.longitude,
        },
        zoom: 15,
      });
    }
  }, [map, trakdUser?.location, locationPermission]);

  const defaultCenter = useMemo(() => {
    if (trakdUser?.location && locationPermission === 'granted') {
      return {
        lat: trakdUser.location.latitude,
        lng: trakdUser.location.longitude,
      };
    }
    return { lat: 37.7749, lng: -122.4194 }; // Default to SF
  }, [trakdUser, locationPermission]);

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={13}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      mapId={MAP_ID}
    />
  );
}

export function MapView() {
  const { user, trakdUser, loading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | 'none'>(
    'none'
  );
  const [members, setMembers] = useState<TrakdUser[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const { toast } = useToast();

  const [locationPermission, setLocationPermission] =
    useState<PermissionState>('prompt');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReminder, setAiReminder] = useState<string | null>(null);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  useEffect(() => {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permissionStatus) => {
        setLocationPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state);
        };
      });
  }, []);

  const handleAllowLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermission('granted');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied');
        }
      }
    );
  };

  // Fetch user's groups
  useEffect(() => {
    if (!trakdUser?.uid) {
      setIsGroupsLoading(false);
      setMembers(trakdUser ? [trakdUser] : []);
      return;
    }

    setIsGroupsLoading(true);
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', trakdUser.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userGroups = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Group)
        );
        setGroups(userGroups);
        if (userGroups.length > 0 && selectedGroupId === 'none') {
          setSelectedGroupId(userGroups[0].id);
        }
        setIsGroupsLoading(false);
      },
      (error) => {
        console.error('Error fetching groups: ', error);
        setMembers(trakdUser ? [trakdUser] : []);
        setIsGroupsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [trakdUser, selectedGroupId]);

  // Fetch members of selected group or just the user
  useEffect(() => {
    if (!trakdUser) {
      setMembers([]);
      return;
    }

    if (!selectedGroupId || selectedGroupId === 'none') {
      if (trakdUser) setMembers([trakdUser]);
      return;
    }

    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group || group.members.length === 0) {
      if (trakdUser) setMembers([trakdUser]);
      return;
    }

    const q = query(
      collection(db, 'users'),
      where('__name__', 'in', group.members)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupMembers = snapshot.docs.map(
          (doc) => doc.data() as TrakdUser
        );
        setMembers(groupMembers);
      },
      (error) => {
        console.error('Error fetching group members:', error);
        if (trakdUser) setMembers([trakdUser]); // Fallback to just showing the current user
      }
    );

    return () => unsubscribe();
  }, [selectedGroupId, groups, trakdUser]);

  // Update user location and battery
  useEffect(() => {
    if (!trakdUser?.uid || locationPermission !== 'granted') return;
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
      if (error.code === 1) {
        // PERMISSION_DENIED
        setLocationPermission('denied');
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      updateLocation,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    const updateBattery = (battery: any) => {
      updateDoc(userDocRef, {
        'battery.level': battery.level,
        'battery.charging': battery.charging,
      });
    };

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
  }, [trakdUser?.uid, locationPermission]);

  const handleSmartReminder = async () => {
    if (!selectedGroup || members.length < 2) {
      toast({
        description: 'Not enough members in the group to use this feature.',
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const membersWithLocation = members.filter((m) => m.location);
      if (membersWithLocation.length < 2) {
        setAiReminder(
          'Not enough members are sharing their location to determine if they are together.'
        );
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
          if (dist < 500) {
            // within 500 meters
            togetherCount++;
          }
        }
      }

      const areMembersTogether = togetherCount > membersWithLocation.length / 2;

      const result = await smartLocationSharingReminder({
        groupName: selectedGroup.name,
        memberNames: members.map((m) => m.displayName || 'A member'),
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

  if (loading) {
    return (
      <div className="relative h-full w-full">
        <Skeleton className="h-full w-full" />
        <div className="absolute top-4 left-4 flex gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={API_KEY}>
        <MapContainer />
        {locationPermission === 'granted' &&
          members
            .filter((member) => member.location)
            .map((member) => (
              <AdvancedMarker
                key={member.uid}
                position={{
                  lat: member.location!.latitude,
                  lng: member.location!.longitude,
                }}
              >
                <MemberMarker
                  member={member}
                  isCurrentUser={member.uid === trakdUser?.uid}
                />
              </AdvancedMarker>
            ))}
      </APIProvider>
      <div className="absolute top-4 left-4 flex gap-4">
        {isGroupsLoading ? (
          <div className="flex h-10 w-[200px] items-center justify-center rounded-md bg-background/80 shadow-lg backdrop-blur-sm">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          groups.length > 0 && (
            <Select
              value={selectedGroupId || ''}
              onValueChange={(val) => setSelectedGroupId(val)}
            >
              <SelectTrigger className="w-[200px] bg-background/80 shadow-lg backdrop-blur-sm">
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
          )
        )}
        {selectedGroupId &&
          selectedGroupId !== 'none' &&
          locationPermission === 'granted' && (
            <Button
              onClick={handleSmartReminder}
              disabled={isAiLoading}
              variant="outline"
              className="bg-background/80 shadow-lg backdrop-blur-sm"
            >
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
          <div className="rounded-lg bg-background/80 p-4 text-center shadow-lg backdrop-blur-sm">
            <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No Groups Yet</h2>
            <p className="text-sm text-muted-foreground">
              Create or join a group to see others on the map.
            </p>
          </div>
        </div>
      )}

      {locationPermission === 'prompt' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="max-w-sm rounded-lg bg-background/80 p-6 text-center shadow-lg backdrop-blur-sm">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="text-xl font-semibold">Enable Location</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Trak'd needs access to your location to show you on the map.
              Click the button to allow location access.
            </p>
            <Button onClick={handleAllowLocation} className="mt-4">
              Allow Access
            </Button>
          </div>
        </div>
      )}

      {locationPermission === 'denied' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="max-w-sm rounded-lg bg-background/80 p-6 text-center shadow-lg backdrop-blur-sm">
            <MapPinOff className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Location Access Denied</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Trak'd needs access to your location to show you on the map.
              Please enable location services for this site in your browser
              settings.
            </p>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!aiReminder}
        onOpenChange={(open) => !open && setAiReminder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Assistant
            </AlertDialogTitle>
            <AlertDialogDescription>{aiReminder}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAiReminder(null)}>
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
