import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CardPayment() {
  return (
    <View style={styles.container}>
      <Text>Card Payment</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor:'white'
  }
})
