import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  HelperText,
  ProgressBar,
  SegmentedButtons,
  Checkbox,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useCreateShopMutation } from '../hooks/useShop';
import { ImageUploader } from '../components/ImageUploader';
import { shopRegistrationSchema, BUSINESS_CATEGORIES, INDIAN_STATES } from 'shared';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterShopScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const createShopMutation = useCreateShopMutation();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [ownerName, setOwnerName] = useState(user?.user_metadata?.full_name || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.user_metadata?.phone_number || '');
  const [ownerPhoto, setOwnerPhoto] = useState<string | null>(null);

  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('grocery');
  const [shopLogo, setShopLogo] = useState<string | null>(null);

  const [doorNo, setDoorNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [village, setVillage] = useState('');
  const [mandal, setMandal] = useState('');
  const [district, setDistrict] = useState('');
  const [stateCode, setStateCode] = useState('AP');
  const [pinCode, setPinCode] = useState('');

  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [upi, setUpi] = useState('');
  const [email, setEmail] = useState(user?.email || '');

  const [whatsappReminder, setWhatsappReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(false);

  const validateStep = () => {
    setErrors({});
    const tempErrors: Record<string, string> = {};

    if (step === 1) {
      if (!ownerName.trim()) tempErrors.owner_name = 'Owner name is required';
      if (!ownerPhone.trim()) tempErrors.owner_phone = 'Owner mobile phone is required';
      else if (!/^[6-9]\d{9}$/.test(ownerPhone.trim())) {
        tempErrors.owner_phone = 'Please enter a valid 10-digit mobile number';
      }
    } else if (step === 2) {
      if (!shopName.trim()) tempErrors.shop_name = 'Shop name is required';
      if (!category) tempErrors.business_category = 'Please select a business category';
    } else if (step === 3) {
      if (!village.trim()) tempErrors.village_town = 'Village/Town is required';
      if (!district.trim()) tempErrors.district = 'District is required';
      if (!pinCode.trim()) tempErrors.pin_code = 'PIN Code is required';
      else if (!/^\d{6}$/.test(pinCode.trim())) {
        tempErrors.pin_code = 'PIN Code must be exactly 6 digits';
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!user?.id) return;

    const selectedStateName =
      INDIAN_STATES.find((s) => s.code === stateCode)?.name || 'Andhra Pradesh';

    const payload = {
      owner_id: user.id,
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      owner_photo_url: ownerPhoto,
      owner_photo_path: null,

      shop_name: shopName.trim(),
      shop_logo_url: shopLogo,
      shop_logo_path: null,
      shop_code: `${shopName.trim().substring(0, 3).toUpperCase()}_${pinCode.trim()}`,
      business_category: category,

      door_number: doorNo.trim() || null,
      street: street.trim() || null,
      area: area.trim() || null,
      village_town: village.trim(),
      mandal: mandal.trim() || null,
      district: district.trim(),
      state: selectedStateName,
      pin_code: pinCode.trim(),
      country: 'India',

      gst: gst.trim() || null,
      pan: pan.trim() || null,
      upi_id: upi.trim() || null,
      business_email: email.trim() || null,

      language: 'en',
      currency: 'INR',
      theme: 'light',

      payment_reminder: true,
      whatsapp_reminder: whatsappReminder,
      sms_reminder: smsReminder,
      ai_daily_summary: true,
    };

    // Zod verification
    const result = shopRegistrationSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      // 1. Process picture uploads in services if base64 exists (currently handled by service uploadImage)
      let finalOwnerPhoto = ownerPhoto;
      let finalShopLogo = shopLogo;

      // Note: we can mock/delegate base64 storage uploads or query database
      await createShopMutation.mutateAsync(payload as any);
      router.replace('/(dashboard)' as any);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to register shop' });
    }
  };

  const progress = step / 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.stepTitle}>Step {step} of 4</Text>
            <Text style={styles.subtitle}>
              {step === 1 && 'Register Shop Owner details'}
              {step === 2 && 'Enter Business information'}
              {step === 3 && 'Enter Store Address'}
              {step === 4 && 'Billing Preferences'}
            </Text>
          </View>

          {errors.form && (
            <Surface style={styles.errorBanner} elevation={0}>
              <Text style={styles.errorText}>{errors.form}</Text>
            </Surface>
          )}

          <Surface style={styles.formCard} elevation={1}>
            {/* Step 1: Owner Info */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <ImageUploader
                  value={ownerPhoto}
                  onChange={(base64) => setOwnerPhoto(base64)}
                  label="Owner Photo"
                  shape="circle"
                />

                <TextInput
                  label="Owner Full Name *"
                  value={ownerName}
                  onChangeText={(val) => setOwnerName(val)}
                  mode="outlined"
                  error={!!errors.owner_name}
                  style={styles.input}
                />
                {errors.owner_name && <HelperText type="error">{errors.owner_name}</HelperText>}

                <TextInput
                  label="Owner Mobile Phone *"
                  value={ownerPhone}
                  onChangeText={(val) => setOwnerPhone(val)}
                  mode="outlined"
                  keyboardType="phone-pad"
                  error={!!errors.owner_phone}
                  style={styles.input}
                />
                {errors.owner_phone && <HelperText type="error">{errors.owner_phone}</HelperText>}
              </View>
            )}

            {/* Step 2: Shop Info */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <ImageUploader
                  value={shopLogo}
                  onChange={(base64) => setShopLogo(base64)}
                  label="Shop Logo"
                  shape="square"
                />

                <TextInput
                  label="Shop Name *"
                  value={shopName}
                  onChangeText={(val) => setShopName(val)}
                  mode="outlined"
                  error={!!errors.shop_name}
                  style={styles.input}
                />
                {errors.shop_name && <HelperText type="error">{errors.shop_name}</HelperText>}

                <Text style={styles.label}>Business Category *</Text>
                <View style={styles.pickerContainer}>
                  <SegmentedButtons
                    value={category}
                    onValueChange={setCategory}
                    buttons={[
                      { value: 'grocery', label: 'Grocery' },
                      { value: 'apparel', label: 'Apparel' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.inputRow}>
                  <TextInput
                    label="Door No"
                    value={doorNo}
                    onChangeText={setDoorNo}
                    mode="outlined"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TextInput
                    label="Street"
                    value={street}
                    onChangeText={setStreet}
                    mode="outlined"
                    style={[styles.input, { flex: 2 }]}
                  />
                </View>

                <TextInput
                  label="Village / Town *"
                  value={village}
                  onChangeText={setVillage}
                  mode="outlined"
                  error={!!errors.village_town}
                  style={styles.input}
                />
                {errors.village_town && <HelperText type="error">{errors.village_town}</HelperText>}

                <TextInput
                  label="District *"
                  value={district}
                  onChangeText={setDistrict}
                  mode="outlined"
                  error={!!errors.district}
                  style={styles.input}
                />
                {errors.district && <HelperText type="error">{errors.district}</HelperText>}

                <TextInput
                  label="PIN Code *"
                  value={pinCode}
                  onChangeText={setPinCode}
                  mode="outlined"
                  keyboardType="number-pad"
                  error={!!errors.pin_code}
                  style={styles.input}
                />
                {errors.pin_code && <HelperText type="error">{errors.pin_code}</HelperText>}
              </View>
            )}

            {/* Step 4: Billing Details & UPI */}
            {step === 4 && (
              <View style={styles.stepContent}>
                <TextInput
                  label="GST Number (Optional)"
                  value={gst}
                  onChangeText={setGst}
                  mode="outlined"
                  autoCapitalize="characters"
                  style={styles.input}
                />

                <TextInput
                  label="PAN Number (Optional)"
                  value={pan}
                  onChangeText={setPan}
                  mode="outlined"
                  autoCapitalize="characters"
                  style={styles.input}
                />

                <TextInput
                  label="UPI ID for Payments (Optional)"
                  value={upi}
                  onChangeText={setUpi}
                  mode="outlined"
                  placeholder="name@upi"
                  style={styles.input}
                />

                <View style={styles.checkboxContainer}>
                  <Checkbox.Item
                    label="Send Reminders via WhatsApp"
                    status={whatsappReminder ? 'checked' : 'unchecked'}
                    onPress={() => setWhatsappReminder(!whatsappReminder)}
                  />
                  <Checkbox.Item
                    label="Send SMS notifications"
                    status={smsReminder ? 'checked' : 'unchecked'}
                    onPress={() => setSmsReminder(!smsReminder)}
                  />
                </View>
              </View>
            )}

            {/* Form Controls */}
            <View style={styles.btnRow}>
              {step > 1 && (
                <Button
                  mode="outlined"
                  onPress={handleBack}
                  style={[styles.controlBtn, { marginRight: 8 }]}
                >
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button mode="contained" onPress={handleNext} style={styles.controlBtn}>
                  Next
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.controlBtn}
                  loading={createShopMutation.isPending}
                  disabled={createShopMutation.isPending}
                >
                  Register Shop
                </Button>
              )}
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  progressBar: {
    height: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  stepContent: {
    gap: 12,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  pickerContainer: {
    marginVertical: 4,
  },
  checkboxContainer: {
    marginTop: 8,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  controlBtn: {
    flex: 1,
    borderRadius: 8,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
});
