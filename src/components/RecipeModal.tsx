import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import { Recipes } from '../game/recipes';
import { getIngredientImage } from '../game/assets';
import { getIngredientName, getItemName } from '../i18n/names';
import { t } from '../i18n';

export type RecipeModalProps = {
  visible: boolean;
  onClose: () => void;
};

function RecipeModal(props: RecipeModalProps): React.ReactElement | null {
  const { visible, onClose } = props;
  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.panel}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{t('recipes')}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel={t('close')}>
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {Recipes.map(function renderRecipe(r) {
                return (
                  <View key={r.id} style={styles.rowItem}>
                    <View style={styles.leftHeader}>
                      <Image source={r.resultIcon} style={styles.resultIcon} />
                      <Text style={styles.dishName}>{getItemName(r.id)}</Text>
                    </View>
                    <View style={styles.rightIngredients}>
                      {r.requiredIngredients.map(function renderIng(ingId) {
                        return (
                          <Image
                            key={ingId}
                            source={getIngredientImage(ingId)}
                            style={styles.ingIcon}
                          />
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,69,19,0.18)',
  },
  panel: {
    backgroundColor: '#F5F5DC',
    borderRadius: 16,
    padding: 16,
    width: '88%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#3B2F2F' },
  closeBtn: { backgroundColor: '#E6D5B8', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { color: '#3B2F2F', fontWeight: '600' },
  scrollContent: { paddingVertical: 8 },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#8B4513',
    borderStyle: 'dashed',
  },
  leftHeader: { flexDirection: 'row', alignItems: 'center' },
  dishName: { color: '#3B2F2F', fontWeight: '700', marginLeft: 10 },
  resultIcon: { width: 40, height: 40 },
  rightIngredients: { flexDirection: 'row', alignItems: 'center' },
  ingIcon: { width: 28, height: 28, marginLeft: 6 },
});

export default RecipeModal;
