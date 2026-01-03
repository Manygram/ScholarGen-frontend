import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CalculatorScreen = ({ navigation }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setExpression(expression + String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
      setExpression(expression === '' ? String(num) : expression + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setExpression(expression + '0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    setExpression(expression + ' ' + nextOperation + ' ');
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setExpression(expression + '= ' + String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(display);
    const newValue = value / 100;
    setDisplay(String(newValue));
    setExpression(String(newValue));
  };

  const handlePlusMinus = () => {
    if (display !== '0') {
      const newValue = display.charAt(0) === '-' ? display.substr(1) : '-' + display;
      setDisplay(newValue);
      setExpression(newValue);
    }
  };

  const Button = ({ onPress, text, size = 1, theme = 'default' }) => {
    const buttonStyles = [
      styles.button,
      size === 2 && styles.buttonDouble,
      theme === 'secondary' && styles.buttonSecondary,
      theme === 'accent' && styles.buttonAccent,
    ];

    const textStyles = [
      styles.buttonText,
      theme === 'secondary' && styles.buttonTextSecondary,
      theme === 'accent' && styles.buttonTextAccent,
    ];

    return (
      <TouchableOpacity style={buttonStyles} onPress={onPress} activeOpacity={0.7}>
        <Text style={textStyles}>{text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculator</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {expression || display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          <Button text="C" theme="secondary" onPress={clear} />
          <Button text="±" theme="secondary" onPress={handlePlusMinus} />
          <Button text="%" theme="secondary" onPress={handlePercentage} />
          <Button text="÷" theme="accent" onPress={() => performOperation('÷')} />
        </View>

        <View style={styles.row}>
          <Button text="7" onPress={() => inputNumber(7)} />
          <Button text="8" onPress={() => inputNumber(8)} />
          <Button text="9" onPress={() => inputNumber(9)} />
          <Button text="×" theme="accent" onPress={() => performOperation('×')} />
        </View>

        <View style={styles.row}>
          <Button text="4" onPress={() => inputNumber(4)} />
          <Button text="5" onPress={() => inputNumber(5)} />
          <Button text="6" onPress={() => inputNumber(6)} />
          <Button text="-" theme="accent" onPress={() => performOperation('-')} />
        </View>

        <View style={styles.row}>
          <Button text="1" onPress={() => inputNumber(1)} />
          <Button text="2" onPress={() => inputNumber(2)} />
          <Button text="3" onPress={() => inputNumber(3)} />
          <Button text="+" theme="accent" onPress={() => performOperation('+')} />
        </View>

        <View style={styles.row}>
          <Button text="0" size={2} onPress={() => inputNumber(0)} />
          <Button text="." onPress={inputDecimal} />
          <Button text="=" theme="accent" onPress={handleEquals} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
  },
  displayText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#fff',
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  button: {
    flex: 1,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  buttonDouble: {
    flex: 2,
  },
  buttonSecondary: {
    backgroundColor: '#a6a6a6',
  },
  buttonAccent: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
  },
  buttonTextSecondary: {
    color: '#1a1a1a',
  },
  buttonTextAccent: {
    color: '#fff',
  },
});

export default CalculatorScreen;