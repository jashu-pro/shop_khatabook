import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Avatar, Text, Button, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';

interface ImageUploaderProps {
  value: string | null;
  onChange: (base64: string) => void;
  label?: string;
  shape?: 'circle' | 'square';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Upload Image',
  shape = 'square',
}) => {
  const theme = useTheme();

  const handleCameraCapture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Camera permissions are required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      onChange(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleLibraryPick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Gallery permissions are required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      onChange(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const isRound = shape === 'circle';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.uploaderRow}>
        <View style={styles.avatarWrapper}>
          {value ? (
            <Image
              source={{ uri: value }}
              style={[
                styles.imagePreview,
                isRound ? styles.roundBorder : styles.squareBorder,
                { borderColor: theme.colors.outlineVariant },
              ]}
            />
          ) : (
            <View
              style={[
                styles.placeholderBox,
                isRound ? styles.roundBorder : styles.squareBorder,
                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
              ]}
            >
              <ImageIcon size={32} color={theme.colors.onSurfaceVariant} />
            </View>
          )}
        </View>

        <View style={styles.btnColumn}>
          <Button
            mode="contained-tonal"
            icon={() => <Camera size={16} color={theme.colors.primary} />}
            onPress={handleCameraCapture}
            style={styles.actionBtn}
            labelStyle={styles.btnLabel}
          >
            Take Photo
          </Button>

          <Button
            mode="outlined"
            icon={() => <ImageIcon size={16} color={theme.colors.secondary} />}
            onPress={handleLibraryPick}
            style={styles.actionBtn}
            labelStyle={styles.btnLabel}
          >
            Choose Gallery
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderWidth: 1,
  },
  placeholderBox: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundBorder: {
    borderRadius: 40,
  },
  squareBorder: {
    borderRadius: 8,
  },
  btnColumn: {
    flex: 1,
    gap: 8,
  },
  actionBtn: {
    borderRadius: 8,
  },
  btnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
