import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Order } from '../types';
import { getItemImage } from '../game/assets';

type OrderCardProps = {
  order: Order;
  compact?: boolean;
  remaining?: number;
};

function OrderCard(props: OrderCardProps): React.ReactElement {
  const { order, compact, remaining } = props;

  return (
    <View style={styles.card}>
      <Text style={compact ? styles.titleSm : styles.title}>Đơn hàng</Text>
      {order.items.map(function renderItem(item) {
        return (
          <View
            key={item.id}
            style={compact ? styles.itemRowSm : styles.itemRow}
          >
            <Image
              source={getItemImage(item.id)}
              style={compact ? styles.itemImageSm : styles.itemImage}
              resizeMode="contain"
            />
            <View style={styles.itemInfoCol}>
              <View style={styles.namePriceRow}>
                <View style={styles.nameWrap}>
                  <Text style={compact ? styles.itemNameSm : styles.itemName}>
                    {item.name}
                  </Text>
                </View>
                <Text style={compact ? styles.itemMetaSm : styles.itemMeta}>
                  {item.price}₫ • {item.preparationTime}s
                </Text>
              </View>
              {item.requirements && item.requirements.length > 0 ? (
                <View style={styles.requirementRowUnderName}>
                  <Text style={styles.requirementLabelSmall}>Yêu cầu:</Text>
                  {item.requirements.map(function renderReq(req) {
                    return (
                      <View key={req} style={styles.requirementPillSmall}>
                        <Text style={styles.requirementPillTextSmall}>
                          {req}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
            <View style={styles.ingredients}>
              {compact
                ? null
                : item.ingredients.map(function renderIngredient(ingredient) {
                    return (
                      <Text key={ingredient.id} style={styles.ingredientText}>
                        • {ingredient.name}
                      </Text>
                    );
                  })}
            </View>
          </View>
        );
      })}
      <View style={styles.footerRow}>
        <Text style={compact ? styles.totalSm : styles.total}>
          Tổng: {order.totalPrice}₫
        </Text>
        <Text style={compact ? styles.limitSm : styles.limit}>
          {typeof remaining === 'number'
            ? `Còn lại: ${remaining}s`
            : `Giới hạn: ${order.timeLimit}s`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 12,
    width: '92%',
  },
  title: { color: '#3B2F2F', fontWeight: '700', marginBottom: 8 },
  titleSm: {
    color: '#3B2F2F',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 12,
  },
  itemRow: { marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  itemRowSm: { marginBottom: 6, flexDirection: 'row', alignItems: 'center' },
  itemName: { color: '#3B2F2F', fontWeight: '600', marginLeft: 8 },
  itemNameSm: {
    color: '#3B2F2F',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 8,
  },
  itemInfo: { color: '#6B5B5B', marginLeft: 8 },
  itemInfoSm: { color: '#6B5B5B', fontSize: 11, marginLeft: 8 },
  itemInfoCol: { flexDirection: 'column', marginLeft: 8, flexShrink: 1 },
  namePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  nameWrap: { flexShrink: 1, paddingRight: 12 },
  itemMeta: { color: '#6B5B5B' },
  itemMetaSm: { color: '#6B5B5B', fontSize: 11 },
  ingredients: { marginTop: 4 },
  ingredientText: { color: '#6B5B5B' },
  requirementRowUnderName: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 2,
    paddingLeft: 8,
  },
  requirementLabelSmall: { color: '#6B5B5B', marginRight: 6, fontSize: 11 },
  requirementTextSmall: { color: '#6B5B5B', fontSize: 11 },
  requirementPillSmall: {
    backgroundColor: '#E6D5B8',
    borderRadius: 10,
    paddingVertical: 1,
    paddingHorizontal: 6,
    marginRight: 6,
    marginTop: 2,
  },
  requirementPillTextSmall: { color: '#3B2F2F', fontSize: 11 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  total: { color: '#3B2F2F', fontWeight: '700' },
  limit: { color: '#6B5B5B', fontWeight: '500' },
  totalSm: { color: '#3B2F2F', fontWeight: '700', fontSize: 12 },
  limitSm: { color: '#6B5B5B', fontWeight: '500', fontSize: 12 },
  itemImageSm: { width: 36, height: 36, marginBottom: 2 },
  itemImage: { width: 48, height: 48, marginBottom: 4 },
});

export default OrderCard;
