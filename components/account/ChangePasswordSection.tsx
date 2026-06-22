import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { changePasswordWithToken } from '@/services/auth';
import { rtlTextInputStyle } from '@/theme/arabicTypography';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { homeShell } from '@/theme/homeShell';
import { evaluateAccountPassword, isStrongAccountPassword } from '@/utils/accountPasswordPolicy';
import { errorMessage } from '@/utils/errorMessage';

type Props = {
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  getAccessToken: () => Promise<string | null>;
};

export function ChangePasswordSection({ rtl, t, getAccessToken }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordRules = useMemo(() => evaluateAccountPassword(newPassword), [newPassword]);
  const passwordStrong = useMemo(() => isStrongAccountPassword(newPassword), [newPassword]);
  const passwordsMatch = newPassword !== '' && newPassword === confirmPassword;

  const canSubmit =
    !submitting &&
    currentPassword.trim() !== '' &&
    passwordStrong &&
    confirmPassword.trim() !== '' &&
    passwordsMatch &&
    currentPassword !== newPassword;

  const onSubmit = async () => {
    if (!currentPassword.trim()) {
      Alert.alert(t('commonErrorTitle'), t('accountCurrentPasswordRequired'));
      return;
    }
    if (!passwordStrong) {
      Alert.alert(t('commonErrorTitle'), t('registerPasswordWeak'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('commonErrorTitle'), t('registerPasswordsMismatch'));
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert(t('commonErrorTitle'), t('accountNewPasswordMustDiffer'));
      return;
    }

    const token = await getAccessToken();
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await changePasswordWithToken(token, currentPassword, newPassword, confirmPassword);
      if (!res.success) {
        throw new Error(res.message || t('accountChangePasswordFailed'));
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(t('accountChangePasswordSuccessTitle'), res.message || t('accountChangePasswordSuccessBody'));
    } catch (e: unknown) {
      Alert.alert(t('commonErrorTitle'), errorMessage(e, t, 'account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.card, styles.stackItem]}>
      <View style={styles.sectionHead}>
        <FontAwesome name="lock" size={16} color={homeShell.blue} />
        <Text style={[styles.sectionTitle, rtl ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
          {t('accountChangePasswordTitle')}
        </Text>
      </View>

      <Field label={t('accountCurrentPasswordLabel')} rtl={rtl}>
        <PasswordInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={t('accountCurrentPasswordPlaceholder')}
          show={showCurrent}
          onToggleShow={() => setShowCurrent((v) => !v)}
          rtl={rtl}
          autoComplete="password"
        />
      </Field>

      <Field label={t('accountNewPasswordLabel')} rtl={rtl}
        belowInput={
          newPassword.length > 0 ? (
            <View style={styles.passwordRulesBox}>
              <Text style={[styles.passwordRulesTitle, rtl && styles.txtRtl]}>{t('registerPasswordRulesTitle')}</Text>
              {(
                [
                  ['minLength', t('registerPasswordRuleMinLength')],
                  ['hasUpperCase', t('registerPasswordRuleUpper')],
                  ['hasLowerCase', t('registerPasswordRuleLower')],
                  ['hasNumber', t('registerPasswordRuleNumber')],
                  ['hasSpecialChar', t('registerPasswordRuleSpecial')],
                ] as const
              ).map(([key, label]) => {
                const ok = passwordRules[key];
                return (
                  <View key={key} style={[styles.passwordRuleRow, rtl && styles.passwordRuleRowRtl]}>
                    <FontAwesome
                      name={ok ? 'check-circle' : 'circle-o'}
                      size={13}
                      color={ok ? brand.success : homeShell.cardMuted}
                    />
                    <Text style={[styles.passwordRuleTxt, ok && styles.passwordRuleTxtOk, rtl && styles.txtRtl]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null
        }>
        <PasswordInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t('accountNewPasswordPlaceholder')}
          show={showNew}
          onToggleShow={() => setShowNew((v) => !v)}
          rtl={rtl}
          autoComplete="new-password"
        />
      </Field>

      <Field
        label={t('registerPasswordConfirmLabel')}
        rtl={rtl}
        belowInput={
          confirmPassword.length > 0 && !passwordsMatch ? (
            <Text style={[styles.matchHint, styles.matchHintError, rtl && styles.txtRtl]}>
              {t('registerPasswordsMismatch')}
            </Text>
          ) : confirmPassword.length > 0 && passwordsMatch ? (
            <Text style={[styles.matchHint, styles.matchHintOk, rtl && styles.txtRtl]}>
              {t('accountPasswordsMatch')}
            </Text>
          ) : null
        }>
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t('registerPasswordConfirmPlaceholder')}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((v) => !v)}
          rtl={rtl}
          autoComplete="new-password"
          invalid={confirmPassword.length > 0 && !passwordsMatch}
          valid={confirmPassword.length > 0 && passwordsMatch}
        />
      </Field>

      <Pressable
        accessibilityRole="button"
        onPress={() => void onSubmit()}
        disabled={!canSubmit}
        style={({ pressed }) => [
          styles.submitBtn,
          (!canSubmit || pressed) && { opacity: canSubmit ? 0.92 : 0.55 },
        ]}>
        {submitting ? (
          <ActivityIndicator color={homeShell.text} />
        ) : (
          <>
            <FontAwesome name="lock" size={15} color={homeShell.text} />
            <Text style={[styles.submitBtnTxt, rtl && styles.txtRtl]}>{t('accountChangePasswordSubmit')}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function Field({
  label,
  rtl,
  children,
  belowInput,
}: {
  label: string;
  rtl: boolean;
  children: React.ReactNode;
  belowInput?: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={[styles.fieldLabel, rtl ? styles.fieldLabelRtl : styles.fieldLabelLtr]}>{label}</Text>
      </View>
      <View style={[styles.inputShell, rtl && styles.inputShellRtl]}>{children}</View>
      {belowInput}
    </View>
  );
}

function PasswordInput({
  value,
  onChangeText,
  placeholder,
  show,
  onToggleShow,
  rtl,
  autoComplete,
  invalid,
  valid,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  rtl: boolean;
  autoComplete: 'password' | 'new-password';
  invalid?: boolean;
  valid?: boolean;
}) {
  const baseStyle = StyleSheet.flatten(styles.input) as TextStyle;
  return (
    <>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={homeShell.cardMuted}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={autoComplete === 'new-password' ? 'newPassword' : 'password'}
        textAlign={rtl ? 'right' : 'left'}
        textAlignVertical="center"
        style={[
          styles.input,
          rtl ? rtlTextInputStyle(baseStyle) : null,
          invalid ? styles.inputInvalid : undefined,
          valid ? styles.inputValid : undefined,
        ]}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onToggleShow}
        hitSlop={8}
        style={styles.eyeBtn}>
        <FontAwesome name={show ? 'eye-slash' : 'eye'} size={16} color={homeShell.cardMuted} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  stackItem: { marginBottom: 0 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: homeShell.cardText,
    flex: 1,
    minWidth: 0,
  },
  sectionTitleLtr: { textAlign: 'left', writingDirection: 'ltr' },
  sectionTitleRtl: { textAlign: 'right', writingDirection: 'rtl' },
  field: { marginTop: spacing.md },
  fieldLabelRow: { flexDirection: 'row' },
  fieldLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: '#475569',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  fieldLabelLtr: { textAlign: 'left', writingDirection: 'ltr' },
  fieldLabelRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    textTransform: 'none',
    letterSpacing: 0,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputShellRtl: { flexDirection: 'row-reverse' },
  input: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
    ...Platform.select({
      ios: { paddingVertical: 12 },
      android: { paddingVertical: 0 },
    }),
  },
  inputInvalid: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  inputValid: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  eyeBtn: { padding: 4 },
  passwordRulesBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    gap: 6,
  },
  passwordRulesTitle: { fontSize: 12, fontWeight: '800', color: homeShell.cardText },
  passwordRuleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passwordRuleRowRtl: { flexDirection: 'row-reverse' },
  passwordRuleTxt: { flex: 1, fontSize: 12, color: homeShell.cardMuted, fontWeight: '600' },
  passwordRuleTxtOk: { color: brand.success },
  matchHint: { marginTop: spacing.xs, fontSize: fontSize.xs, fontWeight: '700' },
  matchHintError: { color: brand.error },
  matchHintOk: { color: brand.success },
  submitBtn: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: homeShell.blue,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  submitBtnTxt: { color: homeShell.text, fontSize: fontSize.md, fontWeight: '900' },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
