import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { Svg, Line, Circle } from 'react-native-svg';

// --- LÓGICA DO JOGO (NÃO ALTERADA) ---
const words = [
  'ABACAXI', 'BANANA', 'MORANGO', 'LARANJA', 'UVA', 'MELANCIA', 'GOIABA', 'PERA',
  'MACA', 'KIWI', 'MANGA', 'CAJU', 'ACEROLA', 'PITANGA', 'JABUTICABA', 'CARAMBOLA',
  'FIGO', 'LIMAO', 'MARACUJA', 'MELAO', 'TANGERINA', 'AMORA', 'FRAMBOESA', 'CEREJA',
  'DAMASCO', 'PESSEGO', 'AMEIXA', 'NECTARINA', 'JACA', 'ROMA'
];
const getRandomWord = () => words[Math.floor(Math.random() * words.length)];

// --- COMPONENTE PRINCIPAL COM NOVO DESIGN ---
const App = () => {
  const [secretWord, setSecretWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [isModalVisible, setModalVisible] = useState(false);

  // Animação de tremor
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startNewGame();
  }, []);

  // Efeito para verificar vitória ou derrota
  useEffect(() => {
    if (secretWord && wrongLetters.length === 6) {
      setGameStatus('lost');
      setTimeout(() => setModalVisible(true), 500);
    }
    if (secretWord && secretWord.split('').every(letter => guessedLetters.includes(letter))) {
      setGameStatus('won');
      setTimeout(() => setModalVisible(true), 500);
    }
  }, [guessedLetters, wrongLetters, secretWord]);

  // Função para iniciar um novo jogo
  const startNewGame = () => {
    setSecretWord(getRandomWord());
    setGuessedLetters([]);
    setWrongLetters([]);
    setGameStatus('playing');
    setModalVisible(false);
  };

  // Função para lidar com o pressionar de uma letra
  const handleLetterPress = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
      return;
    }

    if (secretWord.includes(letter)) {
      setGuessedLetters(prev => [...prev, letter]);
    } else {
      setWrongLetters(prev => [...prev, letter]);
      triggerShakeAnimation();
    }
  };
  
  // Função para disparar a animação de tremor
  const triggerShakeAnimation = () => {
    shakeAnimation.setValue(0);
    Animated.timing(shakeAnimation, {
      toValue: 1,
      duration: 400,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  // Interpolação para o efeito de tremor
  const shakeInterpolate = shakeAnimation.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, -10, 10, -10, 10, -5, 5, -2, 2, 0, 0],
  });

  // --- NOVOS COMPONENTES DE RENDERIZAÇÃO ---

  // Renderiza a palavra com caixas estilizadas e animação
  const renderWord = () => (
    <View style={styles.wordContainer}>
      {secretWord.split('').map((letter, index) => (
        <View key={index} style={styles.letterBox}>
          {guessedLetters.includes(letter) && (
            <Animated.Text style={[styles.wordLetter, { opacity: 1 }]}>
              {letter}
            </Animated.Text>
          )}
        </View>
      ))}
    </View>
  );

  // Renderiza o teclado virtual com novo design
  const renderKeyboard = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (
      <View style={styles.keyboardContainer}>
        {alphabet.map(letter => {
          const isUsed = guessedLetters.includes(letter) || wrongLetters.includes(letter);
          return (
            <TouchableOpacity
              key={letter}
              style={[styles.key, isUsed && styles.keyDisabled]}
              onPress={() => handleLetterPress(letter)}
              disabled={isUsed || gameStatus !== 'playing'}
            >
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Renderiza o desenho da forca com novo design e animação
  const renderHangman = () => {
    const errors = wrongLetters.length;
    const strokeColor = '#E0E0E0'; // Cor do traço da forca

    return (
      <Animated.View style={[styles.hangmanContainer, { transform: [{ translateX: shakeInterpolate }] }]}>
        <Svg height="200" width="150">
          {/* Estrutura da forca */}
          <Line x1="10" y1="180" x2="100" y2="180" stroke={strokeColor} strokeWidth="3" />
          <Line x1="55" y1="180" x2="55" y2="40" stroke={strokeColor} strokeWidth="3" />
          <Line x1="55" y1="40" x2="120" y2="40" stroke={strokeColor} strokeWidth="3" />
          <Line x1="120" y1="40" x2="120" y2="60" stroke={strokeColor} strokeWidth="3" />

          {/* Boneco */}
          {errors > 0 && <Circle cx="120" cy="80" r="20" stroke="#FF6B6B" strokeWidth="3" fill="none" />}
          {errors > 1 && <Line x1="120" y1="100" x2="120" y2="140" stroke="#FF6B6B" strokeWidth="3" />}
          {errors > 2 && <Line x1="120" y1="110" x2="100" y2="130" stroke="#FF6B6B" strokeWidth="3" />}
          {errors > 3 && <Line x1="120" y1="110" x2="140" y2="130" stroke="#FF6B6B" strokeWidth="3" />}
          {errors > 4 && <Line x1="120" y1="140" x2="100" y2="160" stroke="#FF6B6B" strokeWidth="3" />}
          {errors > 5 && <Line x1="120" y1="140" x2="140" y2="160" stroke="#FF6B6B" strokeWidth="3" />}
        </Svg>
      </Animated.View>
    );
  };

  // Renderiza o modal customizado de fim de jogo
  const renderModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{gameStatus === 'won' ? 'Você Venceu!' : 'Você Perdeu!'}</Text>
          <Text style={styles.modalText}>A palavra era:</Text>
          <Text style={styles.modalWord}>{secretWord}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={startNewGame}>
            <Text style={styles.modalButtonText}>Jogar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JOGO DA FORCA</Text>
      
      {renderHangman()}

      <Text style={styles.attemptsText}>
        {6 - wrongLetters.length} tentativas restantes
      </Text>

      {renderWord()}
      
      {renderKeyboard()}

      <TouchableOpacity style={styles.restartButton} onPress={startNewGame}>
        <Text style={styles.restartButtonText}>Reiniciar Jogo</Text>
      </TouchableOpacity>

      {renderModal()}
    </View>
  );
};

// --- NOVOS ESTILOS (DARK MODE & PREMIUM) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fundo escuro
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0', // Texto claro
    letterSpacing: 5,
  },
  hangmanContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptsText: {
    fontSize: 16,
    color: '#9E9E9E', // Cinza para texto secundário
    marginBottom: 10,
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  letterBox: {
    width: 40,
    height: 50,
    borderBottomWidth: 3,
    borderColor: '#424242', // Borda da caixa da letra
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00BFFF', // Cor de destaque para letra correta
  },
  keyboardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  key: {
    width: 45,
    height: 45,
    margin: 4,
    borderRadius: 22,
    backgroundColor: '#212121', // Fundo da tecla
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra para iOS
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // Sombra para Android
    elevation: 5,
  },
  keyDisabled: {
    opacity: 0.3,
    elevation: 0,
  },
  keyText: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos do Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '85%',
    padding: 30,
    backgroundColor: '#212121',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginBottom: 5,
  },
  modalWord: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00BFFF', // Cor de destaque
    letterSpacing: 3,
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restartButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9E9E9E',
  },
  restartButtonText: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default App;