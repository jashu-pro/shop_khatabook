import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

interface NetworkContextType {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isConnected: true });

export const useNetwork = () => useContext(NetworkContext);

export default function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [bannerAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Listen to network status changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = !!state.isConnected;
      setIsConnected(isOnline);

      // Animate banner entry/exit
      Animated.timing(bannerAnimation, {
        toValue: isOnline ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      unsubscribe();
    };
  }, [bannerAnimation]);

  // Translate banner animation state to layout transforms
  const translateY = bannerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      <View style={{ flex: 1 }}>
        {children}

        {/* Animated Offline Banner */}
        <Animated.View style={[styles.offlineBanner, { transform: [{ translateY }] }]}>
          <WifiOff size={16} color="#ffffff" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            Intermittent Connection. KhattaBook is operating in local/offline mode.
          </Text>
        </Animated.View>
      </View>
    </NetworkContext.Provider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: '#ea580c', // Dark warm amber/orange
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
    // Add shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
