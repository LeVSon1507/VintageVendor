import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Order } from '../types';
import { getItemImage } from '../game/assets';

type OrderCardProps = {
  order: Order;
  compact?: boolean;
};

function OrderCard(props: OrderCardProps): React.ReactElement {
  const { order, compact } = props;

  return (
    <View style={styles.card}>
      <Text style={compact ? styles.titleSm : styles.title}>Đơn hàng</Text>
      {order.items.map(function renderItem(item) {
        return (
          <View key={item.id} style={compact ? styles.itemRowSm : styles.itemRow}>
            <Image source={getItemImage(item.id)} style={compact ? styles.itemImageSm : styles.itemImage} resizeMode="contain" />
            <Text style={compact ? styles.itemNameSm : styles.itemName}>{item.name}</Text>
            <Text style={compact ? styles.itemInfoSm : styles.itemInfo}>{item.price}₫ • {item.preparationTime}s</Text>
            <View style={styles.ingredients}>
              {compact ? null : item.ingredients.map(function renderIngredient(ingredient) {
                return (
                  <Text key={ingredient.id} style={styles.ingredientText}>• {ingredient.name}</Text>
                );
              })}
            </View>
          </View>
        );
      })}
      <View style={styles.footerRow}>
        <Text style={compact ? styles.totalSm : styles.total}>Tổng: {order.totalPrice}₫</Text>
        <Text style={compact ? styles.limitSm : styles.limit}>Giới hạn: {order.timeLimit}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF8E1', padding: 12, borderRadius: 12, width: '92%' },
  title: { color: '#3B2F2F', fontWeight: '700', marginBottom: 8 },
  titleSm: { color: '#3B2F2F', fontWeight: '700', marginBottom: 4, fontSize: 12 },
  itemRow: { marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  itemRowSm: { marginBottom: 6, flexDirection: 'row', alignItems: 'center' },
  itemName: { color: '#3B2F2F', fontWeight: '600' },
  itemNameSm: { color: '#3B2F2F', fontWeight: '600', fontSize: 12 },
  itemInfo: { color: '#6B5B5B' },
  itemInfoSm: { color: '#6B5B5B', fontSize: 11 },
  ingredients: { marginTop: 4 },
  ingredientText: { color: '#6B5B5B' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  total: { color: '#3B2F2F', fontWeight: '700' },
  limit: { color: '#6B5B5B', fontWeight: '500' },
  totalSm: { color: '#3B2F2F', fontWeight: '700', fontSize: 12 },
  limitSm: { color: '#6B5B5B', fontWeight: '500', fontSize: 12 },
  itemImageSm: { width: 36, height: 36, marginBottom: 2 },
  itemImage: { width: 48, height: 48, marginBottom: 4 },
});

export default OrderCard;
